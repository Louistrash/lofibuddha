import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

const TIER_NAMES: Record<string, string> = {
  zen: "Zen Beginner",
  mindful: "Mindful Path",
  enlightened: "Enlightened Path",
};

const TIER_PRICES: Record<string, string> = {
  zen: "Free",
  mindful: "€4,99/month",
  enlightened: "€12,99/month",
};

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const tier = session.metadata?.tier || "unknown";
    const customerId = session.customer as string;

    return NextResponse.json({
      tier,
      tierName: TIER_NAMES[tier] || tier,
      tierPrice: TIER_PRICES[tier] || "",
      email: session.customer_email || session.customer_details?.email || "",
      customerId,
      subscriptionId: session.subscription as string,
    });
  } catch (err: any) {
    console.error("[Stripe Session]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
