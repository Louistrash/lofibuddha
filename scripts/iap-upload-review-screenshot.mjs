#!/usr/bin/env node
/**
 * Upload IAP review screenshot for mindful + enlightened via ASC API.
 * Usage: node scripts/iap-upload-review-screenshot.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY_ID = fs.readFileSync(path.join(ROOT, "secrets/asc-key-id.txt"), "utf8").trim();
const ISSUER = fs.readFileSync(path.join(ROOT, "secrets/asc-issuer-id.txt"), "utf8").trim();
const KEY = fs.readFileSync(path.join(ROOT, "secrets/asc-key.p8"), "utf8");
const SCREENSHOT = path.join(ROOT, "store-assets/ios/iap/review-paywall.png");
const SUBS = [
  { id: "6812415576", name: "mindful_monthly", promo: path.join(ROOT, "store-assets/ios/iap/mindful-1024.png") },
  { id: "6812419603", name: "enlightened_monthly", promo: path.join(ROOT, "store-assets/ios/iap/enlightened-1024.png") },
];

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function jwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }));
  const payload = b64url(JSON.stringify({ iss: ISSUER, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" }));
  const data = `${header}.${payload}`;
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  const sig = sign.sign({ key: KEY, dsaEncoding: "ieee-p1363" });
  return `${data}.${b64url(sig)}`;
}

async function api(token, method, url, body, headers = {}) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...headers },
    body,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text: text.slice(0, 500) };
}

async function uploadAsset(token, { endpoint, type, fileName, file, relationship }) {
  const create = await api(
    token,
    "POST",
    `https://api.appstoreconnect.apple.com/v1/${endpoint}`,
    JSON.stringify({
      data: {
        type,
        attributes: { fileName, fileSize: file.length },
        relationships: relationship,
      },
    }),
    { "Content-Type": "application/json" }
  );
  if (create.status >= 300) return create;
  const assetId = create.json.data.id;
  const ops = create.json.data.attributes.uploadOperations || [];
  for (const op of ops) {
    const headers = {};
    for (const h of op.requestHeaders || []) headers[h.name] = h.value;
    const chunk = file.subarray(op.offset, op.offset + op.length);
    const up = await fetch(op.url, { method: op.method, headers, body: chunk });
    if (!up.ok) return { status: up.status, text: "upload_chunk_failed" };
  }
  return api(
    token,
    "PATCH",
    `https://api.appstoreconnect.apple.com/v1/${endpoint}/${assetId}`,
    JSON.stringify({
      data: {
        type,
        id: assetId,
        attributes: {
          uploaded: true,
          sourceFileChecksum: crypto.createHash("md5").update(file).digest("hex"),
        },
      },
    }),
    { "Content-Type": "application/json" }
  );
}

async function uploadForSub(token, sub) {
  const { id: subId, name } = sub;
  const existing = await api(
    token,
    "GET",
    `https://api.appstoreconnect.apple.com/v1/subscriptions/${subId}?include=appStoreReviewScreenshot`
  );
  const shot = existing.json?.data?.relationships?.appStoreReviewScreenshot?.data;
  if (shot?.id) {
    const del = await api(
      token,
      "DELETE",
      `https://api.appstoreconnect.apple.com/v1/subscriptionAppStoreReviewScreenshots/${shot.id}`
    );
    console.log(name, "delete_old_screenshot", del.status);
  }

  const file = fs.readFileSync(SCREENSHOT);
  const commit = await uploadAsset(token, {
    endpoint: "subscriptionAppStoreReviewScreenshots",
    type: "subscriptionAppStoreReviewScreenshots",
    fileName: "review-paywall.png",
    file,
    relationship: { subscription: { data: { type: "subscriptions", id: subId } } },
  });
  console.log(name, "screenshot", commit.status, commit.status < 300 ? "ok" : commit.text);

  const promo = fs.readFileSync(sub.promo);
  const image = await uploadAsset(token, {
    endpoint: "subscriptionImages",
    type: "subscriptionImages",
    fileName: path.basename(sub.promo),
    file: promo,
    relationship: { subscription: { data: { type: "subscriptions", id: subId } } },
  });
  console.log(name, "promo", image.status, image.status < 300 ? "ok" : image.text);
  return commit.status < 300 && image.status < 300;
}

const token = jwt();
let ok = true;
for (const s of SUBS) {
  const r = await uploadForSub(token, s);
  ok = ok && r;
}
process.exit(ok ? 0 : 1);
