#!/usr/bin/env node
/**
 * Upload iPhone 6.7" App Store screenshots for the version in Prepare for Submission.
 * Usage: node scripts/asc-upload-screenshots.mjs
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
const SHOT_DIR = path.join(ROOT, "store-assets/ios/6.7");
const DISPLAY = "APP_IPHONE_67";
const ORDER = [
  "screenshot-home.png",
  "screenshot-explore.png",
  "screenshot-library.png",
  "screenshot-soundtrack.png",
  "screenshot-sleep.png",
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
    const detail = json?.errors?.map((e) => e.detail || e.title).join("; ") || text.slice(0, 400);
    throw new Error(`${method} ${url} → ${res.status}: ${detail}`);
  }
  return json;
}

const token = jwt();
const versions = await api(
  token,
  "GET",
  `https://api.appstoreconnect.apple.com/v1/apps/${APP_ID}/appStoreVersions?filter[platform]=IOS&limit=5`
);
const version =
  versions.data.find((v) => v.attributes.appStoreState === "PREPARE_FOR_SUBMISSION") ||
  versions.data[0];
if (!version) throw new Error("Geen App Store-versie gevonden");
console.log("version", version.attributes.versionString, version.attributes.appStoreState, version.id);

const locs = await api(
  token,
  "GET",
  `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`
);
const loc = locs.data.find((l) => l.attributes.locale === "en-US") || locs.data[0];
if (!loc) throw new Error("Geen lokalisatie");
console.log("locale", loc.attributes.locale, loc.id);

const sets = await api(
  token,
  "GET",
  `https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets`
);
let set = sets.data.find((s) => s.attributes.screenshotDisplayType === DISPLAY);
if (!set) {
  const created = await api(token, "POST", "https://api.appstoreconnect.apple.com/v1/appScreenshotSets", {
    data: {
      type: "appScreenshotSets",
      attributes: { screenshotDisplayType: DISPLAY },
      relationships: {
        appStoreVersionLocalization: { data: { type: "appStoreVersionLocalizations", id: loc.id } },
      },
    },
  });
  set = created.data;
  console.log("created screenshot set", set.id);
} else {
  console.log("screenshot set", set.id);
}

const existing = await api(
  token,
  "GET",
  `https://api.appstoreconnect.apple.com/v1/appScreenshotSets/${set.id}/appScreenshots?limit=20`
);
for (const shot of existing.data || []) {
  await api(token, "DELETE", `https://api.appstoreconnect.apple.com/v1/appScreenshots/${shot.id}`);
  console.log("removed old", shot.attributes?.fileName || shot.id);
}

for (const name of ORDER) {
  const filePath = path.join(SHOT_DIR, name);
  const file = fs.readFileSync(filePath);
  const created = await api(token, "POST", "https://api.appstoreconnect.apple.com/v1/appScreenshots", {
    data: {
      type: "appScreenshots",
      attributes: { fileName: name, fileSize: file.length },
      relationships: { appScreenshotSet: { data: { type: "appScreenshotSets", id: set.id } } },
    },
  });
  const shot = created.data;
  for (const op of shot.attributes.uploadOperations || []) {
    const headers = {};
    for (const h of op.requestHeaders || []) headers[h.name] = h.value;
    const chunk = file.subarray(op.offset, op.offset + op.length);
    const up = await fetch(op.url, { method: op.method, headers, body: chunk });
    if (!up.ok) throw new Error(`upload ${name} chunk ${up.status}`);
  }
  await api(token, "PATCH", `https://api.appstoreconnect.apple.com/v1/appScreenshots/${shot.id}`, {
    data: {
      type: "appScreenshots",
      id: shot.id,
      attributes: {
        uploaded: true,
        sourceFileChecksum: crypto.createHash("md5").update(file).digest("hex"),
      },
    },
  });
  console.log("uploaded", name, file.length);
}

console.log("done", DISPLAY, ORDER.length, "screenshots");
