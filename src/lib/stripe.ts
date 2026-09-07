import Stripe from "stripe";

// No apiVersion pinned on purpose — the installed "stripe" package version
// dictates its own default/type-checked version literal, so hardcoding a
// string here breaks every time the package updates. Omitting it just uses
// whatever that package version's default is.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);