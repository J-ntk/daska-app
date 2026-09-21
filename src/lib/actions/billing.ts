"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import type { BillingCurrency } from "@/lib/currency";
import { getReferralCouponId } from "@/lib/referral";

const PRICE_IDS: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
  yearly: process.env.STRIPE_PRICE_YEARLY ?? "",
  lifetime: process.env.STRIPE_PRICE_LIFETIME ?? "",
};

export async function startCheckout(
  planType: "monthly" | "yearly" | "lifetime",
  locale: string,
  currency: BillingCurrency = "eur"
) {
  // Guard first, before touching Stripe or Supabase at all — if this ever
  // gets called before Stripe is configured, fail gracefully back to the
  // Billing page instead of crashing with an unhandled error.
  if (!process.env.STRIPE_SECRET_KEY || !PRICE_IDS[planType]) {
    redirect(`/${locale}/app/billing?error=not_configured`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, has_referral_discount")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isSubscription = planType !== "lifetime";

  // Referral coupon: 20% off this first payment if the person has an unused
  // coupon. Monthly and yearly only, never lifetime. It's marked as spent by
  // the webhook once the payment goes through.
  let couponId: string | null = null;
  if (isSubscription) {
    const { count: couponsAvailable } = await supabase
      .from("referral_credits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("used_at", null);
    if ((couponsAvailable ?? 0) > 0) couponId = await getReferralCouponId();
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: PRICE_IDS[planType], quantity: 1 }],
    // Charge in the currency the billing page showed (each price has EUR and USD).
    currency: currency === "usd" ? "usd" : "eur",
    discounts: couponId ? [{ coupon: couponId }] : undefined,
    success_url: `${appUrl}/${locale}/app/billing?success=1`,
    cancel_url: `${appUrl}/${locale}/app/billing?canceled=1`,
    metadata: { user_id: user.id, plan_type: planType, credit_applied: couponId ? "1" : "0" },
  });

  if (!session.url) throw new Error("Couldn't create checkout session");
  redirect(session.url);
}

export async function openBillingPortal(locale: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) throw new Error("No billing account yet");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/${locale}/app/billing`,
  });

  redirect(session.url);
}