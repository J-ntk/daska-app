import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const planType = session.metadata?.plan_type;

    if (userId) {
      const plan = planType === "lifetime" ? "lifetime" : "pro";

      await admin
        .from("profiles")
        .update({
          plan,
          stripe_subscription_id:
            typeof session.subscription === "string" ? session.subscription : null,
          subscription_status: planType === "lifetime" ? null : "active",
        })
        .eq("id", userId);

      // Reward whoever referred this user (if anyone, and they're not the
      // founder — founder-referred users are already free, nothing to reward)
      const { data: referredProfile } = await admin
        .from("profiles")
        .select("referred_by")
        .eq("id", userId)
        .maybeSingle();

      if (referredProfile?.referred_by) {
        const { data: referrer } = await admin
          .from("profiles")
          .select("id, is_founder, stripe_subscription_id, has_referral_discount")
          .eq("id", referredProfile.referred_by)
          .maybeSingle();

        if (referrer && !referrer.is_founder) {
          if (!referrer.has_referral_discount) {
            await admin
              .from("profiles")
              .update({ has_referral_discount: true })
              .eq("id", referrer.id);
          }
          // If the referrer already has an active subscription, apply the
          // discount going forward immediately. If not, has_referral_discount
          // will apply it automatically the next time they check out.
          if (referrer.stripe_subscription_id && process.env.STRIPE_COUPON_REFERRAL) {
            try {
              await stripe.subscriptions.update(referrer.stripe_subscription_id, {
                discounts: [{ coupon: process.env.STRIPE_COUPON_REFERRAL }],
              });
            } catch {
              // non-fatal — has_referral_discount is already set for next time
            }
          }
        }
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;

    // Newer Stripe API versions moved the billing period onto each
    // subscription item rather than the subscription itself.
    const periodEndUnix =
      (sub as any).current_period_end ?? sub.items.data[0]?.current_period_end;

    await admin
      .from("profiles")
      .update({
        subscription_status: status,
        subscription_period_end: periodEndUnix
          ? new Date(periodEndUnix * 1000).toISOString()
          : null,
        plan: status === "canceled" || status === "unpaid" ? "free" : "pro",
      })
      .eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ received: true });
}