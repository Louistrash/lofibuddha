import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

const PRICE_MAP: Record<string, string> = {
  zen: "price_zen_monthly", // Replace with actual Stripe price IDs
  master: "price_master_monthly",
};

export async function POST(request: NextRequest) {
  try {
    const { tier, email } = await request.json();
    const priceId = PRICE_MAP[tier] || PRICE_MAP.zen;

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: { tier, source: "bodhi-landing" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[Stripe Checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
