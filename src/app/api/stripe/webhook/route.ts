import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";
import { getReferralCouponId } from "@/lib/referral";

// Subscription statuses that keep or give Pro, and ones that remove it.
// Anything else (e.g. "incomplete", "paused") leaves the plan untouched.
const GRANT_STATUSES = new Set(["active", "trialing", "past_due"]);
const REVOKE_STATUSES = new Set(["canceled", "unpaid", "incomplete_expired"]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    // Delayed payment methods (e.g. bank debits) complete the session before
    // the money arrives. Wait for checkout.session.async_payment_succeeded.
    if (session.payment_status === "unpaid") {
      return NextResponse.json({ received: true });
    }

    const userId = session.metadata?.user_id;
    const planType = session.metadata?.plan_type;

    if (userId) {
      const plan = planType === "lifetime" ? "lifetime" : "pro";

      const { error: updateError } = await admin
        .from("profiles")
        .update({
          plan,
          stripe_subscription_id:
            typeof session.subscription === "string" ? session.subscription : null,
          subscription_status: planType === "lifetime" ? null : "active",
        })
        .eq("id", userId);

      // Returning 500 makes Stripe retry the event instead of losing it.
      if (updateError) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      // The buyer used a referral coupon at checkout: mark it as spent.
      if (session.metadata?.credit_applied === "1") {
        const { error: spendError } = await admin.rpc("spend_referral_credit", {
          p_user: userId,
          p_ref: session.id,
        });
        if (spendError) {
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
      }

      // First purchase by an invited friend: their inviter earns one coupon.
      const { data: referredProfile } = await admin
        .from("profiles")
        .select("referred_by")
        .eq("id", userId)
        .maybeSingle();

      if (referredProfile?.referred_by) {
        const { data: referrer } = await admin
          .from("profiles")
          .select("id, is_founder")
          .eq("id", referredProfile.referred_by)
          .maybeSingle();

        if (referrer && !referrer.is_founder) {
          // friend_id is unique, so a retried event or a later purchase by the
          // same friend hits a duplicate (23505) and earns nothing extra.
          const { error: creditError } = await admin
            .from("referral_credits")
            .insert({ user_id: referrer.id, kind: "friend", friend_id: userId });
          if (creditError && creditError.code !== "23505") {
            return NextResponse.json({ error: "Database error" }, { status: 500 });
          }
        }
      }
    }
  }

  // Renewals: if the customer has an unused referral coupon, take 20% off this
  // invoice. The invoice is still a draft when this event arrives.
  if (event.type === "invoice.created") {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.billing_reason === "subscription_cycle" && invoice.status === "draft") {
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

      if (customerId) {
        const { data: buyer } = await admin
          .from("profiles")
          .select("id, plan")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (buyer && buyer.plan !== "lifetime") {
          const { data: spent, error: spendError } = await admin.rpc("spend_referral_credit", {
            p_user: buyer.id,
            p_ref: invoice.id,
          });
          if (spendError) {
            return NextResponse.json({ error: "Database error" }, { status: 500 });
          }

          if (spent) {
            try {
              await getStripe().invoices.update(invoice.id as string, {
                discounts: [{ coupon: await getReferralCouponId() }],
              });
            } catch {
              // Retry: the coupon is already spent for this invoice, so the
              // retry only re-applies the discount.
              return NextResponse.json({ error: "Stripe error" }, { status: 500 });
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

    // Stripe's SDK types for this field have shifted across versions
    // (top-level vs per-item billing period). Cast past it rather than
    // chase the exact type each time the installed package updates.
    const subAny = sub as any;
    const periodEndUnix: number | undefined =
      subAny.current_period_end ?? subAny.items?.data?.[0]?.current_period_end;

    const { data: current } = await admin
      .from("profiles")
      .select("id, plan")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (current) {
      const update: Record<string, unknown> = {
        subscription_status: status,
        subscription_period_end: periodEndUnix
          ? new Date(periodEndUnix * 1000).toISOString()
          : null,
      };

      // A lifetime plan is never changed by subscription events.
      if (current.plan !== "lifetime") {
        if (GRANT_STATUSES.has(status)) update.plan = "pro";
        else if (REVOKE_STATUSES.has(status)) update.plan = "free";
      }

      const { error: updateError } = await admin
        .from("profiles")
        .update(update)
        .eq("id", current.id);

      if (updateError) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}