let stripe: any = null;

try {
  const StripeModule = require("stripe");
  const BILLING_ENABLED = process.env.BILLING_ENABLED === "true";
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

  if (BILLING_ENABLED && STRIPE_SECRET_KEY) {
    stripe = new StripeModule(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  }
} catch (e) {
  // Stripe not available
}

const BILLING_ENABLED = process.env.BILLING_ENABLED === "true";
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "";
export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export { stripe, BILLING_ENABLED };
