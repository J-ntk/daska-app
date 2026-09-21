import { getStripe } from "@/lib/stripe";

// A referral coupon is 20% off ONE payment (one month on the monthly plan,
// one year on the yearly plan). It never applies to the lifetime plan.
export const REFERRAL_PERCENT = 20;

// Returns the ID of the one-time 20% coupon, creating it in Stripe the first
// time it's needed.
export async function getReferralCouponId(): Promise<string> {
  const stripe = getStripe();
  const id = `daska_referral_${REFERRAL_PERCENT}_once`;

  try {
    const existing = await stripe.coupons.retrieve(id);
    return existing.id;
  } catch (err: any) {
    if (err?.code !== "resource_missing") throw err;
  }

  try {
    const created = await stripe.coupons.create({
      id,
      percent_off: REFERRAL_PERCENT,
      duration: "once",
      name: `Referral coupon ${REFERRAL_PERCENT}% off`,
    });
    return created.id;
  } catch (err: any) {
    // Two requests created it at the same moment — just use the existing one.
    if (err?.code === "resource_already_exists") return id;
    throw err;
  }
}