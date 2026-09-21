import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { startCheckout, openBillingPortal } from "@/lib/actions/billing";
import CopyReferralLink from "@/components/CopyReferralLink";
import { getBillingCurrency, PLAN_PRICES } from "@/lib/currency";

export default async function BillingPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { success?: string; canceled?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, referral_code, has_referral_discount, stripe_customer_id, is_founder")
    .eq("id", user.id)
    .single();

  const isFounder = profile?.is_founder === true;

  // Referral coupons: 20% off one payment, earned by inviting friends who buy.
  const { data: credits } = await supabase
    .from("referral_credits")
    .select("kind, used_at")
    .eq("user_id", user.id);
  const couponsAvailable = (credits ?? []).filter((c: any) => !c.used_at).length;
  const friendsSubscribed = (credits ?? []).filter((c: any) => c.kind === "friend").length;

  // Free-forever access for anyone who is an ACTIVE member of a project owned
  // by a founder. Pending invites don't count until they're accepted.
  let grantedByFounder = false;
  let grantedByName: string | null = null;
  if (!isFounder) {
    const { data: memberships } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    const projectIds = (memberships ?? []).map((m: any) => m.project_id);

    if (projectIds.length > 0) {
      const { data: ownedProjects } = await supabase
        .from("projects")
        .select("owner_id")
        .in("id", projectIds);

      const ownerIds = Array.from(new Set((ownedProjects ?? []).map((p: any) => p.owner_id)));

      if (ownerIds.length > 0) {
        const { data: owners } = await supabase
          .from("profiles")
          .select("full_name")
          .in("id", ownerIds)
          .eq("is_founder", true)
          .limit(1);

        if (owners && owners.length > 0) {
          // Track "granted by a founder" separately from the name, so a founder
          // without a full_name set still grants access.
          grantedByFounder = true;
          grantedByName = owners[0].full_name;
        }
      }
    }
  }

  const hasFreeForeverAccess = isFounder || grantedByFounder;

  // Show (and charge) in EUR or USD depending on the visitor's country.
  const currency = getBillingCurrency(headers().get("x-vercel-ip-country"));
  const prices = PLAN_PRICES[currency];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = `${appUrl}/${locale}/signup?ref=${profile?.referral_code ?? ""}`;

  let ownedProjectsCount = 0;
  let stripeConfigured = false;
  if (!hasFreeForeverAccess) {
    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);
    ownedProjectsCount = count ?? 0;

    stripeConfigured = !!(
      process.env.STRIPE_PRICE_MONTHLY &&
      process.env.STRIPE_PRICE_YEARLY &&
      process.env.STRIPE_PRICE_LIFETIME
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-display font-semibold mb-6 border-b border-line pb-4">
        Billing
      </h1>

      {hasFreeForeverAccess ? (
        <div className="border border-accent/30 rounded-lg p-6 bg-gradient-to-b from-accent/10 to-transparent mb-6">
          {isFounder ? (
            <>
              <div className="text-lg font-display font-semibold mb-2">This is your app 💙</div>
              <p className="text-sm text-ink/70">
                Everything here is yours — no billing, no limits, nothing to manage. Build away.
              </p>
            </>
          ) : (
            <>
              <div className="text-lg font-display font-semibold mb-2">
                You&apos;re on {grantedByName ?? "the founder"}&apos;s team 💙
              </div>
              <p className="text-sm text-ink/70">
                You have full access to everything here, on the house — no subscription, no
                limits, ever. Thanks for being part of this.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {searchParams.success && (
            <div className="mb-4 text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              Payment successful — welcome to Pro.
            </div>
          )}
          {searchParams.canceled && (
            <div className="mb-4 text-sm text-ink/60 bg-surface border border-line rounded-lg px-3 py-2">
              Checkout canceled — no charge was made.
            </div>
          )}
          {searchParams.error === "not_configured" && (
            <div className="mb-4 text-sm text-ink/60 bg-surface border border-line rounded-lg px-3 py-2">
              Billing isn&apos;t set up yet — check back soon.
            </div>
          )}

          <div className="mb-3 text-xs font-medium uppercase text-ink/40">Current plan</div>
          <div className="border border-line rounded-lg p-4 bg-surface mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium capitalize">{profile?.plan ?? "free"}</div>
                <div className="text-xs text-ink/50">
                  {profile?.plan === "free"
                    ? `${ownedProjectsCount}/1 free project used`
                    : "Unlimited projects"}
                </div>
                {couponsAvailable > 0 && profile?.plan !== "lifetime" && (
                  <div className="text-xs text-accentLight mt-1">
                    {couponsAvailable} referral {couponsAvailable === 1 ? "coupon" : "coupons"} ready
                    — 20% off your next payment
                  </div>
                )}
              </div>
              {profile?.stripe_customer_id && profile.plan !== "free" && (
                <form action={openBillingPortal.bind(null, locale)}>
                  <button className="text-xs border border-line rounded-lg px-3 py-1.5 hover:border-accent transition-colors">
                    Manage
                  </button>
                </form>
              )}
            </div>
          </div>

          {profile?.plan === "free" && (
            <>
              <div className="mb-3 text-xs font-medium uppercase text-ink/40">Upgrade</div>
              {stripeConfigured ? (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <PlanCard
                    title="Monthly"
                    price={prices.monthly}
                    subtitle={couponsAvailable > 0 ? "20% coupon applied at checkout" : undefined}
                    action={startCheckout.bind(null, "monthly", locale, currency)}
                  />
                  <PlanCard
                    title="Yearly"
                    price={prices.yearly}
                    subtitle={couponsAvailable > 0 ? "Save over 25% + 20% coupon" : "Save over 25%"}
                    action={startCheckout.bind(null, "yearly", locale, currency)}
                  />
                  <PlanCard
                    title="Lifetime"
                    price={prices.lifetime}
                    subtitle="Pay once, use forever"
                    action={startCheckout.bind(null, "lifetime", locale, currency)}
                  />
                </div>
              ) : (
                <div className="border border-line rounded-lg p-4 bg-surface mb-6 text-sm text-ink/50">
                  Billing isn&apos;t set up yet — check back soon.
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="mb-3 text-xs font-medium uppercase text-ink/40">Your referral link</div>
      <div className="border border-line rounded-lg p-4 bg-surface">
        <p className="text-xs text-ink/50 mb-3">
          Share this link. You and your friend each get a 20% coupon: it takes 20% off one
          payment, a month on the monthly plan or a year on the yearly plan. You earn another
          coupon every time a friend subscribes. Coupons don&apos;t apply to the lifetime plan.
        </p>
        {friendsSubscribed > 0 && (
          <p className="text-xs text-accentLight mb-3">
            {friendsSubscribed} {friendsSubscribed === 1 ? "friend has" : "friends have"} subscribed
            — {couponsAvailable} {couponsAvailable === 1 ? "coupon" : "coupons"} ready.
          </p>
        )}
        <CopyReferralLink link={referralLink} />
      </div>
    </div>
  );
}

function PlanCard({
  title,
  price,
  subtitle,
  action,
}: {
  title: string;
  price: string;
  subtitle?: string;
  action: () => void;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="w-full flex justify-between items-center border border-line rounded-lg p-4 bg-surface hover:border-accent transition-colors text-left"
      >
        <div>
          <div className="text-sm font-medium">{title}</div>
          {subtitle && <div className="text-xs text-ink/50">{subtitle}</div>}
        </div>
        <div className="text-lg font-display font-semibold text-accentLight">{price}</div>
      </button>
    </form>
  );
}