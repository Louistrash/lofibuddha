import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { corsPreflight, withCors } from "@/lib/cors";
import {
  DEFAULT_CURRENCY,
  TIER_PRICE_IDS,
  currencyForCountry,
  currencyFromClientHints,
  isCurrency,
  type Currency,
} from "@/lib/pricing";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-06-30.basil" as any,
  });
}

const PRICE_MAP: Record<string, string> = {
  zen: "", // Free tier — no Stripe checkout needed
  mindful: TIER_PRICE_IDS.mindful, // 1.99 EUR / 1.99 USD
  enlightened: TIER_PRICE_IDS.enlightened, // 4.99 EUR / 4.99 USD
};

/**
 * Country decides the billing currency. Edge/CDN geo headers win when present;
 * otherwise the client's locale/timezone hints are used. The client may not
 * simply pick a currency — that would let anyone choose the cheaper one once
 * the price points diverge.
 */
function resolveCurrency(request: NextRequest, hints: {
  locale?: string | null;
  timeZone?: string | null;
  country?: string | null;
}): { currency: Currency; source: string } {
  const geo =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-geo-country");

  if (geo && geo.toUpperCase() !== "XX") {
    return { currency: currencyForCountry(geo), source: `geo:${geo.toUpperCase()}` };
  }

  if (hints.country) {
    return { currency: currencyForCountry(hints.country), source: `client-country:${hints.country}` };
  }

  const fromHints = currencyFromClientHints(hints);
  return { currency: fromHints, source: `hints:${hints.locale || hints.timeZone || "none"}` };
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, email, locale, timeZone, country } = body ?? {};
    const priceId = PRICE_MAP[tier];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    if (tier === "zen" || !priceId) {
      return withCors(request, NextResponse.json({ url: `${baseUrl}/signup?tier=zen` }));
    }

    const { currency, source } = resolveCurrency(request, { locale, timeZone, country });

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: { tier, source: "lofibuddha-expo", currency, currency_source: source },
    };

    // Only send a currency when it differs from the price default; Stripe rejects
    // a currency the price has no currency_option for.
    if (isCurrency(currency) && currency !== DEFAULT_CURRENCY) {
      params.currency = currency;
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await getStripe().checkout.sessions.create(params);
    } catch (err: any) {
      // A missing currency_option must never block a sale — retry in the default.
      if (params.currency) {
        console.warn("[Stripe Checkout] currency", params.currency, "rejected, falling back:", err?.message);
        delete params.currency;
        params.metadata = { ...params.metadata, currency: DEFAULT_CURRENCY, currency_fallback: "1" };
        session = await getStripe().checkout.sessions.create(params);
      } else {
        throw err;
      }
    }

    return withCors(request, NextResponse.json({ url: session.url, currency }));
  } catch (err: any) {
    console.error("[Stripe Checkout]", err);
    return withCors(request, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
