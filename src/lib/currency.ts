// Which currency each visitor is charged in, and how prices are displayed.
// The amounts here must match the prices you set in Stripe (EUR is the
// default currency of each price, USD is added as a second currency).

export type BillingCurrency = "eur" | "usd";

// European countries are charged in EUR, everyone else in USD.
// Edit this list any time.
const EUR_COUNTRIES = new Set([
  // EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // EEA, Switzerland, UK
  "IS", "LI", "NO", "CH", "GB",
  // Other European markets
  "UA", "RS", "AL", "BA", "ME", "MK", "MD",
]);

export function getBillingCurrency(country: string | null | undefined): BillingCurrency {
  if (!country) return "eur";
  return EUR_COUNTRIES.has(country.toUpperCase()) ? "eur" : "usd";
}

export const PLAN_PRICES: Record<
  BillingCurrency,
  { monthly: string; yearly: string; lifetime: string }
> = {
  eur: { monthly: "€6.99/mo", yearly: "€60/yr", lifetime: "€150 once" },
  usd: { monthly: "$8/mo", yearly: "$70/yr", lifetime: "$170 once" },
};