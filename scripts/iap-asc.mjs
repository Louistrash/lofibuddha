#!/usr/bin/env node
/**
 * App Store Connect subscription helper for LofiBuddha IAPs.
 *
 * Requires env (or files under secrets/):
 *   ASC_KEY_ID
 *   ASC_ISSUER_ID
 *   ASC_PRIVATE_KEY_PATH  (path to AuthKey_XXXX.p8)
 *   ASC_APP_ID=6809886537
 *
 * Usage:
 *   node scripts/iap-asc.mjs ensure
 *   node scripts/iap-asc.mjs verify
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const APP_ID = process.env.ASC_APP_ID || "6809886537";
const KEY_ID = process.env.ASC_KEY_ID || "";
const ISSUER_ID = process.env.ASC_ISSUER_ID || "";
const KEY_PATH =
  process.env.ASC_PRIVATE_KEY_PATH ||
  [
    path.join(ROOT, "secrets/AuthKey.p8"),
    path.join(ROOT, "mobile/AuthKey.p8"),
    path.join(ROOT, "secrets/asc.p8"),
  ].find((p) => fs.existsSync(p)) ||
  "";

const GROUP_NAME = "LofiBuddha Premium";
const PRODUCTS = [
  {
    productId: "mindful_monthly",
    name: "Mindful Monthly",
    reviewNote: "Mindful tier — workshops, premium meditations, soundtracks.",
    locales: {
      en: {
        name: "Mindful",
        description: "Workshops, premium meditations, and soundtracks.",
      },
      nl: {
        name: "Mindful",
        description: "Workshops, premium meditaties en soundtracks.",
      },
    },
    // Customer prices we must hit
    eur: 1.99,
    usd: 1.99,
  },
  {
    productId: "enlightened_monthly",
    name: "Enlightened Monthly",
    reviewNote: "Enlightened tier — everything including courses.",
    locales: {
      en: {
        name: "Enlightened",
        // ASC subscription description max 55 chars
        description: "Courses, workshops, and all premium content.",
      },
      nl: {
        name: "Enlightened",
        description: "Courses, workshops en alle premium content.",
      },
    },
    eur: 4.99,
    usd: 4.99,
  },
];

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function requireCreds() {
  if (!KEY_ID || !ISSUER_ID || !KEY_PATH || !fs.existsSync(KEY_PATH)) {
    const missing = [];
    if (!KEY_ID) missing.push("ASC_KEY_ID");
    if (!ISSUER_ID) missing.push("ASC_ISSUER_ID");
    if (!KEY_PATH || !fs.existsSync(KEY_PATH)) missing.push("ASC_PRIVATE_KEY_PATH (.p8)");
    throw new Error(
      `Missing App Store Connect API credentials: ${missing.join(", ")}. ` +
        `Place the .p8 under secrets/ or set ASC_PRIVATE_KEY_PATH.`,
    );
  }
}

function makeJwt() {
  requireCreds();
  const privateKey = fs.readFileSync(KEY_PATH, "utf8");
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: ISSUER_ID,
      iat: now,
      exp: now + 20 * 60,
      aud: "appstoreconnect-v1",
    }),
  );
  const unsigned = `${header}.${payload}`;
  const sig = crypto.sign("sha256", Buffer.from(unsigned), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
  return `${unsigned}.${b64url(sig)}`;
}

async function api(method, urlPath, body) {
  const token = makeJwt();
  const res = await fetch(`https://api.appstoreconnect.apple.com${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function findOrCreateGroup() {
  const listed = await api(
    "GET",
    `/v1/apps/${APP_ID}/subscriptionGroups?limit=200`,
  );
  if (!listed.ok) throw new Error(`list groups: ${JSON.stringify(listed.data)}`);
  const existing = (listed.data?.data || []).find(
    (g) => g.attributes?.referenceName === GROUP_NAME,
  );
  if (existing) return existing;

  const created = await api("POST", "/v1/subscriptionGroups", {
    data: {
      type: "subscriptionGroups",
      attributes: { referenceName: GROUP_NAME },
      relationships: {
        app: { data: { type: "apps", id: APP_ID } },
      },
    },
  });
  if (!created.ok) throw new Error(`create group: ${JSON.stringify(created.data)}`);
  return created.data.data;
}

async function listGroupSubscriptions(groupId) {
  const res = await api(
    "GET",
    `/v1/subscriptionGroups/${groupId}/subscriptions?limit=200`,
  );
  if (!res.ok) throw new Error(`list subs: ${JSON.stringify(res.data)}`);
  return res.data?.data || [];
}

async function createSubscription(groupId, product) {
  return api("POST", "/v1/subscriptions", {
    data: {
      type: "subscriptions",
      attributes: {
        name: product.name,
        productId: product.productId,
        subscriptionPeriod: "ONE_MONTH",
        familySharable: false,
        reviewNote: product.reviewNote,
        groupLevel: 1,
      },
      relationships: {
        group: { data: { type: "subscriptionGroups", id: groupId } },
      },
    },
  });
}

async function ensureLocalizations(subscriptionId, product) {
  const existing = await api(
    "GET",
    `/v1/subscriptions/${subscriptionId}/subscriptionLocalizations`,
  );
  const have = new Set(
    (existing.data?.data || []).map((l) => l.attributes?.locale),
  );
  const results = [];
  for (const [locale, copy] of Object.entries(product.locales)) {
    if (have.has(locale)) {
      results.push({ locale, action: "exists" });
      continue;
    }
    const created = await api("POST", "/v1/subscriptionLocalizations", {
      data: {
        type: "subscriptionLocalizations",
        attributes: {
          locale,
          name: copy.name,
          description: copy.description,
        },
        relationships: {
          subscription: { data: { type: "subscriptions", id: subscriptionId } },
        },
      },
    });
    results.push({
      locale,
      action: created.ok ? "created" : "failed",
      status: created.status,
      error: created.ok ? null : created.data,
    });
  }
  return results;
}

function priceFromCustomerPrice(customerPrice) {
  // Apple price points use customerPrice as string like "1.99"
  return Number(customerPrice).toFixed(2);
}

async function findPricePointId(subscriptionId, territory, targetPrice) {
  let url = `/v1/subscriptions/${subscriptionId}/pricePoints?filter[territory]=${territory}&limit=200&include=territory`;
  const wanted = priceFromCustomerPrice(targetPrice);
  while (url) {
    const res = await api("GET", url.replace("https://api.appstoreconnect.apple.com", ""));
    if (!res.ok) throw new Error(`pricePoints ${territory}: ${JSON.stringify(res.data)}`);
    for (const pp of res.data?.data || []) {
      if (priceFromCustomerPrice(pp.attributes?.customerPrice) === wanted) {
        return pp.id;
      }
    }
    const next = res.data?.links?.next;
    url = next || null;
  }
  return null;
}

async function ensurePrice(subscriptionId, territory, targetPrice) {
  const pricePointId = await findPricePointId(subscriptionId, territory, targetPrice);
  if (!pricePointId) {
    return { territory, ok: false, error: `No price point for ${targetPrice} in ${territory}` };
  }

  // Check current prices
  const current = await api(
    "GET",
    `/v1/subscriptions/${subscriptionId}/prices?filter[territory]=${territory}&limit=50&include=subscriptionPricePoint`,
  );
  const existing = (current.data?.data || []).find((p) => {
    const relId = p.relationships?.subscriptionPricePoint?.data?.id;
    return relId === pricePointId && !p.attributes?.endDate;
  });
  if (existing) {
    return { territory, ok: true, action: "exists", pricePointId, customerPrice: targetPrice };
  }

  const created = await api("POST", "/v1/subscriptionPrices", {
    data: {
      type: "subscriptionPrices",
      attributes: { startDate: null },
      relationships: {
        subscription: { data: { type: "subscriptions", id: subscriptionId } },
        subscriptionPricePoint: {
          data: { type: "subscriptionPricePoints", id: pricePointId },
        },
      },
    },
  });
  return {
    territory,
    ok: created.ok,
    action: created.ok ? "created" : "failed",
    pricePointId,
    customerPrice: targetPrice,
    error: created.ok ? null : created.data,
  };
}

async function ensure() {
  const group = await findOrCreateGroup();
  const existing = await listGroupSubscriptions(group.id);
  const byProductId = Object.fromEntries(
    existing.map((s) => [s.attributes?.productId, s]),
  );

  const report = { group: { id: group.id, name: group.attributes?.referenceName }, subscriptions: [] };

  for (const product of PRODUCTS) {
    let sub = byProductId[product.productId];
    let action = "exists";
    if (!sub) {
      const created = await createSubscription(group.id, product);
      if (!created.ok) {
        report.subscriptions.push({
          productId: product.productId,
          action: "create_failed",
          error: created.data,
        });
        continue;
      }
      sub = created.data.data;
      action = "created";
    }

    const locs = await ensureLocalizations(sub.id, product);
    const eur = await ensurePrice(sub.id, "NLD", product.eur);
    const usd = await ensurePrice(sub.id, "USA", product.usd);

    report.subscriptions.push({
      productId: product.productId,
      id: sub.id,
      action,
      groupLevel: sub.attributes?.groupLevel,
      state: sub.attributes?.state,
      localizations: locs,
      prices: { EUR_NLD: eur, USD_USA: usd },
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

async function verify() {
  const groupList = await api("GET", `/v1/apps/${APP_ID}/subscriptionGroups?limit=200`);
  if (!groupList.ok) throw new Error(JSON.stringify(groupList.data));
  const group = (groupList.data?.data || []).find(
    (g) => g.attributes?.referenceName === GROUP_NAME,
  );
  if (!group) {
    console.log(JSON.stringify({ ok: false, error: "Group not found" }, null, 2));
    return;
  }
  const subs = await listGroupSubscriptions(group.id);
  const report = [];
  for (const product of PRODUCTS) {
    const sub = subs.find((s) => s.attributes?.productId === product.productId);
    if (!sub) {
      report.push({ productId: product.productId, ok: false, error: "missing" });
      continue;
    }
    const prices = await api(
      "GET",
      `/v1/subscriptions/${sub.id}/prices?include=subscriptionPricePoint,territory&limit=200`,
    );
    const locs = await api(
      "GET",
      `/v1/subscriptions/${sub.id}/subscriptionLocalizations`,
    );
    const priceRows = [];
    for (const p of prices.data?.data || []) {
      const ppId = p.relationships?.subscriptionPricePoint?.data?.id;
      const pp = (prices.data?.included || []).find((i) => i.id === ppId);
      const terrId = p.relationships?.territory?.data?.id;
      priceRows.push({
        territory: terrId,
        customerPrice: pp?.attributes?.customerPrice,
        proceeds: pp?.attributes?.proceeds,
      });
    }
    const eur = priceRows.find((r) => r.territory === "NLD");
    const usd = priceRows.find((r) => r.territory === "USA");
    report.push({
      productId: product.productId,
      ok: true,
      checks: {
        productIdExact: sub.attributes?.productId === product.productId,
        groupLevel1: sub.attributes?.groupLevel === 1,
        eurExact: Number(eur?.customerPrice) === product.eur,
        usdExact: Number(usd?.customerPrice) === product.usd,
        hasEn: (locs.data?.data || []).some((l) => l.attributes?.locale === "en"),
        hasNl: (locs.data?.data || []).some((l) => l.attributes?.locale === "nl"),
      },
      state: sub.attributes?.state,
      prices: { NLD: eur, USA: usd },
      locales: (locs.data?.data || []).map((l) => l.attributes?.locale),
    });
  }
  console.log(JSON.stringify({ group: GROUP_NAME, subscriptions: report }, null, 2));
}

const cmd = process.argv[2] || "verify";
const fn = { ensure, verify }[cmd];
if (!fn) {
  console.error("Usage: node scripts/iap-asc.mjs [ensure|verify]");
  process.exit(1);
}
fn().catch((e) => {
  console.error(String(e.message || e));
  process.exit(1);
});
