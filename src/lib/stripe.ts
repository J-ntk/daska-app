import Stripe from "stripe";

// Lazily instantiated so the module can be imported (e.g. during Next.js's
// build-time page data collection) even before STRIPE_SECRET_KEY is set —
// it only actually needs the key once a Stripe call is made at runtime.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set — add it in your env vars first.");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}