#!/usr/bin/env node
/**
 * Patch App Store localization descriptions with Terms of Use + Privacy links.
 * Required by Apple for auto-renewable subscriptions (metadata on product page).
 *
 * Usage: node scripts/asc-patch-terms-links.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_ID = "6809886537";
const KEY_ID = fs.readFileSync(path.join(ROOT, "secrets/asc-key-id.txt"), "utf8").trim();
const ISSUER = fs.readFileSync(path.join(ROOT, "secrets/asc-issuer-id.txt"), "utf8").trim();
const KEY = fs.readFileSync(path.join(ROOT, "secrets/asc-key.p8"), "utf8");
const store = JSON.parse(fs.readFileSync(path.join(ROOT, "mobile/store.config.json"), "utf8"));

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function jwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ iss: ISSUER, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" }),
  );
  const data = `${header}.${payload}`;
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  return `${data}.${b64url(sign.sign({ key: KEY, dsaEncoding: "ieee-p1363" }))}`;
}

async function api(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (res.status >= 300) {
    const detail = json?.errors?.map((e) => e.detail || e.title).join("; ") || text.slice(0, 500);
    const err = new Error(`${method} ${url} → ${res.status}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

async function main() {
  const token = jwt();
  const versions = await api(
    token,
    "GET",
    `https://api.appstoreconnect.apple.com/v1/apps/${APP_ID}/appStoreVersions?filter[platform]=IOS&limit=10`,
  );
  const version =
    versions.data?.find((v) =>
      ["WAITING_FOR_REVIEW", "PREPARE_FOR_SUBMISSION", "REJECTED", "INVALID_BINARY", "METADATA_REJECTED"].includes(
        v.attributes?.appStoreState,
      ),
    ) ||
    versions.data?.find((v) => v.attributes?.versionString === "1.1.0") ||
    versions.data?.[0];
  if (!version) throw new Error("No iOS appStoreVersion found");
  console.log("version", version.id, version.attributes?.versionString, version.attributes?.appStoreState);

  const locs = await api(
    token,
    "GET",
    `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`,
  );

  for (const loc of locs.data || []) {
    const locale = loc.attributes?.locale;
    const copy = store.apple.info[locale] || store.apple.info["en-US"];
    if (!copy?.description) {
      console.log("skip", locale, "(no local copy)");
      continue;
    }
    const current = loc.attributes?.description || "";
    if (current.includes("lofibuddha.com/legal/terms")) {
      console.log("ok", locale, "(already has terms link)");
      continue;
    }
    await api(
      token,
      "PATCH",
      `https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/${loc.id}`,
      {
        data: {
          type: "appStoreVersionLocalizations",
          id: loc.id,
          attributes: { description: copy.description },
        },
      },
    );
    console.log("patched", locale);
  }
  console.log("DONE — reply in Resolution Center and resubmit for review.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
