import { createClient } from "@/lib/supabase/server";
import { startCheckout, openBillingPortal } from "@/lib/actions/billing";
import CopyReferralLink from "@/components/CopyReferralLink";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
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

  // Was this user invited to a project owned by the founder? If so, they
  // get full free access forever too — figure out who granted it, for a
  // warmer message than generic billing UI.
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
          grantedByName = owners[0].full_name;
        }
      }
    }
  }

  const hasFreeForeverAccess = isFounder || grantedByName !== null;

  if (hasFreeForeverAccess) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-display font-semibold mb-6 border-b border-line pb-4">
          Billing
        </h1>
        <div className="border border-accent/30 rounded-lg p-6 bg-gradient-to-b from-accent/10 to-transparent">
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
      </div>
    );
  }

  const { count: ownedProjects } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = `${appUrl}/signup?ref=${profile?.referral_code ?? ""}`;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-display font-semibold mb-6 border-b border-line pb-4">
        Billing
      </h1>

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

      <div className="mb-3 text-xs font-medium uppercase text-ink/40">Current plan</div>
      <div className="border border-line rounded-lg p-4 bg-surface mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium capitalize">{profile?.plan ?? "free"}</div>
            <div className="text-xs text-ink/50">
              {profile?.plan === "free"
                ? `${ownedProjects ?? 0}/1 free project used`
                : "Unlimited projects"}
            </div>
            {profile?.has_referral_discount && (
              <div className="text-xs text-accentLight mt-1">20% referral discount active</div>
            )}
          </div>
          {profile?.stripe_customer_id && profile.plan !== "free" && (
            <form action={openBillingPortal}>
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
          <div className="grid grid-cols-1 gap-3 mb-6">
            <PlanCard title="Monthly" price="$7/mo" action={startCheckout.bind(null, "monthly")} />
            <PlanCard
              title="Yearly"
              price="$60/yr"
              subtitle="2 months free"
              action={startCheckout.bind(null, "yearly")}
            />
            <PlanCard
              title="Lifetime"
              price="$149 once"
              subtitle="Pay once, use forever"
              action={startCheckout.bind(null, "lifetime")}
            />
          </div>
        </>
      )}

      <div className="mb-3 text-xs font-medium uppercase text-ink/40">Your referral link</div>
      <div className="border border-line rounded-lg p-4 bg-surface">
        <p className="text-xs text-ink/50 mb-3">
          Share this link. Anyone who signs up with it — and you — get 20% off, forever, the
          moment they subscribe.
        </p>
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