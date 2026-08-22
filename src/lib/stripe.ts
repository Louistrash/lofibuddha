import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_dummy", {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return _stripe;
}

export { getStripe as stripe };

export const PLANS = {
  starter: {
    name: "Starter",
    price: 5,
    tokens: 500,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  focus: {
    name: "Focus",
    price: 12,
    tokens: 2000,
    priceId: process.env.STRIPE_FOCUS_PRICE_ID,
  },
  deep: {
    name: "Deep",
    price: 25,
    tokens: -1,
    priceId: process.env.STRIPE_DEEP_PRICE_ID,
  },
};

export async function createCheckoutSession(
  plan: keyof typeof PLANS,
  userId: string,
  origin: string
) {
  const priceId = PLANS[plan].priceId;
  if (!priceId) throw new Error(`No price ID configured for plan: ${plan}`);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancel`,
    metadata: { userId, plan },
  });

  return session;
}
