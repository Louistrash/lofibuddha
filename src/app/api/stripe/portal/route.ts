import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId required" },
        { status: 400 }
      );
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/success`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("[Stripe Portal]", err);
    // If no portal configuration exists, return a helpful error
    if (err.type === "StripeInvalidRequestError" && err.message?.includes("No configuration")) {
      return NextResponse.json(
        {
          error:
            "Customer portal not yet configured. Please contact support to manage your subscription.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
