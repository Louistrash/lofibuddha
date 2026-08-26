import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { corsPreflight, withCors } from "@/lib/cors";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

const PRICE_MAP: Record<string, string> = {
  zen: "", // Free tier — no Stripe checkout needed
  mindful: "price_1U8ktSB7GXjClDhqrR3xTq4O", // €1,99/month
  enlightened: "price_1U8ktTB7GXjClDhqZxNDBoY5", // €4,99/month
};

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    const { tier, email } = await request.json();
    const priceId = PRICE_MAP[tier];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    if (tier === "zen" || !priceId) {
      return withCors(request, NextResponse.json({ url: `${baseUrl}/signup?tier=zen` }));
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: { tier, source: "lofibuddha-expo" },
    });

    return withCors(request, NextResponse.json({ url: session.url }));
  } catch (err: any) {
    console.error("[Stripe Checkout]", err);
    return withCors(request, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
