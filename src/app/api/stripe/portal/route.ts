import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import { corsPreflight, withCors } from "@/lib/cors";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let customerId = body.customerId as string | undefined;
    const email = String(body.email || "").toLowerCase().trim();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    if (!customerId && email && fs.existsSync(SUBSCRIBERS_FILE)) {
      try {
        const list = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf8"));
        const sub = list.find((s: any) => s.email?.toLowerCase() === email);
        customerId = sub?.stripeCustomerId;
      } catch {}
    }

    if (!customerId) {
      return withCors(
        request,
        NextResponse.json({ error: "customerId or known subscriber email required" }, { status: 400 })
      );
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/success`,
    });

    return withCors(request, NextResponse.json({ url: portalSession.url }));
  } catch (err: any) {
    console.error("[Stripe Portal]", err);
    if (err.type === "StripeInvalidRequestError" && err.message?.includes("No configuration")) {
      return withCors(
        request,
        NextResponse.json(
          {
            error:
              "Your subscription portal is being prepared. It will be available shortly — please check back or contact support@lofibuddha.com.",
          },
          { status: 400 }
        )
      );
    }
    return withCors(request, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
