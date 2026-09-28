#!/usr/bin/env node
/**
 * Google Play subscription helper for LofiBuddha IAPs.
 * Usage:
 *   node scripts/iap-play.mjs list
 *   node scripts/iap-play.mjs ensure
 *   node scripts/iap-play.mjs verify
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SA_PATH = path.join(ROOT, "mobile/google-service-account.json");
const PACKAGE = "com.lofibuddha.app";
const REGIONS_VERSION = "2025/01";
const SCOPE = "https://www.googleapis.com/auth/androidpublisher";

const PRODUCTS = [
  {
    productId: "mindful_monthly",
    titleEn: "Mindful",
    titleNl: "Mindful",
    descEn: "Workshops, premium meditations, and soundtracks.",
    descNl: "Workshops, premium meditaties en soundtracks.",
    benefitsEn: ["Workshops", "Premium meditations", "Soundtracks"],
    benefitsNl: ["Workshops", "Premium meditaties", "Soundtracks"],
    eur: { units: "1", nanos: 990_000_000 },
    usd: { units: "1", nanos: 990_000_000 },
  },
  {
    productId: "enlightened_monthly",
    titleEn: "Enlightened",
    titleNl: "Enlightened",
    descEn: "Everything — courses, workshops, and all premium content.",
    descNl: "Alles — courses, workshops en alle premium content.",
    benefitsEn: ["Everything in Mindful", "Full course library", "All premium content"],
    benefitsNl: ["Alles in Mindful", "Volledige coursebibliotheek", "Alle premium content"],
    eur: { units: "4", nanos: 990_000_000 },
    usd: { units: "4", nanos: 990_000_000 },
  },
];

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken() {
  const sa = JSON.parse(fs.readFileSync(SA_PATH, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), sa.private_key);
  const jwt = `${unsigned}.${b64url(sig)}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`token: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function api(token, method, urlPath, body) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3${urlPath}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

function money(units, nanos, currency) {
  return { currencyCode: currency, units: String(units), nanos };
}

function subscriptionBody(p) {
  return {
    packageName: PACKAGE,
    productId: p.productId,
    listings: [
      {
        languageCode: "en-US",
        title: p.titleEn,
        description: p.descEn,
        benefits: p.benefitsEn,
      },
      {
        languageCode: "nl-NL",
        title: p.titleNl,
        description: p.descNl,
        benefits: p.benefitsNl,
      },
    ],
    basePlans: [
      {
        basePlanId: "monthly",
        autoRenewingBasePlanType: {
          billingPeriodDuration: "P1M",
          resubscribeState: "RESUBSCRIBE_STATE_ACTIVE",
          prorationMode: "SUBSCRIPTION_PRORATION_MODE_CHARGE_ON_NEXT_BILLING_DATE",
        },
        regionalConfigs: [
          {
            regionCode: "NL",
            newSubscriberAvailability: true,
            price: money(p.eur.units, p.eur.nanos, "EUR"),
          },
          {
            regionCode: "US",
            newSubscriberAvailability: true,
            price: money(p.usd.units, p.usd.nanos, "USD"),
          },
        ],
        otherRegionsConfig: {
          usdPrice: money(p.usd.units, p.usd.nanos, "USD"),
          eurPrice: money(p.eur.units, p.eur.nanos, "EUR"),
          newSubscriberAvailability: true,
        },
      },
    ],
  };
}

function formatPrice(m) {
  if (!m) return null;
  const units = Number(m.units || 0);
  const nanos = Number(m.nanos || 0);
  const value = units + nanos / 1e9;
  return `${m.currencyCode} ${value.toFixed(2)}`;
}

async function listSubs(token) {
  return api(token, "GET", `/applications/${PACKAGE}/subscriptions`);
}

async function getSub(token, productId) {
  return api(token, "GET", `/applications/${PACKAGE}/subscriptions/${productId}`);
}

async function createSub(token, product) {
  const q = new URLSearchParams({
    productId: product.productId,
    "regionsVersion.version": REGIONS_VERSION,
  });
  return api(
    token,
    "POST",
    `/applications/${PACKAGE}/subscriptions?${q}`,
    subscriptionBody(product),
  );
}

async function activateBasePlan(token, productId, basePlanId = "monthly") {
  return api(
    token,
    "POST",
    `/applications/${PACKAGE}/subscriptions/${productId}/basePlans/${basePlanId}:activate`,
    {},
  );
}

function summarize(sub) {
  const bp = (sub.basePlans || [])[0] || {};
  const regions = Object.fromEntries(
    (bp.regionalConfigs || []).map((r) => [r.regionCode, formatPrice(r.price)]),
  );
  return {
    productId: sub.productId,
    basePlanId: bp.basePlanId,
    state: bp.state,
    prices: regions,
    otherRegions: bp.otherRegionsConfig
      ? {
          usd: formatPrice(bp.otherRegionsConfig.usdPrice),
          eur: formatPrice(bp.otherRegionsConfig.eurPrice),
        }
      : null,
    listings: (sub.listings || []).map((l) => l.languageCode),
  };
}

async function ensure() {
  const token = await getAccessToken();
  const results = [];
  for (const p of PRODUCTS) {
    const existing = await getSub(token, p.productId);
    if (existing.ok) {
      const act = await activateBasePlan(token, p.productId);
      results.push({
        action: "exists",
        productId: p.productId,
        summary: summarize(existing.data),
        activate: { status: act.status, ok: act.ok, error: act.ok ? null : act.data },
      });
      continue;
    }
    if (existing.status !== 404) {
      results.push({
        action: "get_failed",
        productId: p.productId,
        status: existing.status,
        error: existing.data,
      });
      continue;
    }
    const created = await createSub(token, p);
    if (!created.ok) {
      results.push({
        action: "create_failed",
        productId: p.productId,
        status: created.status,
        error: created.data,
      });
      continue;
    }
    const act = await activateBasePlan(token, p.productId);
    results.push({
      action: "created",
      productId: p.productId,
      summary: summarize(created.data),
      activate: { status: act.status, ok: act.ok, error: act.ok ? null : act.data },
    });
  }
  console.log(JSON.stringify(results, null, 2));
}

async function verify() {
  const token = await getAccessToken();
  const report = [];
  for (const p of PRODUCTS) {
    const res = await getSub(token, p.productId);
    if (!res.ok) {
      report.push({ productId: p.productId, ok: false, status: res.status, error: res.data });
      continue;
    }
    const s = summarize(res.data);
    const eurOk = s.prices.NL === "EUR 1.99" || s.prices.NL === "EUR 4.99"
      ? (p.productId === "mindful_monthly" ? s.prices.NL === "EUR 1.99" : s.prices.NL === "EUR 4.99")
      : false;
    const usdOk =
      p.productId === "mindful_monthly"
        ? s.prices.US === "USD 1.99"
        : s.prices.US === "USD 4.99";
    report.push({
      productId: p.productId,
      ok: true,
      checks: {
        productIdExact: s.productId === p.productId,
        eurExact: eurOk,
        usdExact: usdOk,
        basePlanMonthly: s.basePlanId === "monthly",
        state: s.state,
      },
      summary: s,
    });
  }
  console.log(JSON.stringify(report, null, 2));
}

async function list() {
  const token = await getAccessToken();
  const res = await listSubs(token);
  console.log(JSON.stringify(res, null, 2));
}

const cmd = process.argv[2] || "list";
const fn = { list, ensure, verify }[cmd];
if (!fn) {
  console.error("Usage: node scripts/iap-play.mjs [list|ensure|verify]");
  process.exit(1);
}
fn().catch((e) => {
  console.error(e);
  process.exit(1);
});
