#!/usr/bin/env node
/**
 * Add German, French and Italian App Store listing copy for the
 * version in Prepare for Submission, and reuse the English 6.7" screenshots.
 *
 * Usage: node scripts/asc-add-eu-localizations.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_ID = "6809886537";
const LOCALES = ["de-DE", "fr-FR", "it"];
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
const store = JSON.parse(fs.readFileSync(path.join(ROOT, "mobile/store.config.json"), "utf8"));
const PRIVACY = store.apple.privacyPolicyUrl;
const SUPPORT = store.apple.supportUrl;
const MARKETING = store.apple.marketingUrl;

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
    const detail = json?.errors?.map((e) => e.detail || e.title).join("; ") || text.slice(0, 500);
    const err = new Error(`${method} ${url} → ${res.status}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

function assertCopy(locale, copy) {
  const limits = {
    title: 30,
    subtitle: 30,
    keywords: 100,
    promoText: 170,
    description: 4000,
    releaseNotes: 4000,
  };
  for (const [key, max] of Object.entries(limits)) {
    const len = [...(copy[key] || "")].length;
    if (len > max) throw new Error(`${locale} ${key} is ${len}, max ${max}`);
    console.log(locale, key, len);
  }
}

async function uploadScreenshots(token, locId) {
  const sets = await api(
    token,
    "GET",
    `https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/${locId}/appScreenshotSets`
  );
  let set = (sets.data || []).find((s) => s.attributes.screenshotDisplayType === DISPLAY);
  if (!set) {
    const created = await api(token, "POST", "https://api.appstoreconnect.apple.com/v1/appScreenshotSets", {
      data: {
        type: "appScreenshotSets",
        attributes: { screenshotDisplayType: DISPLAY },
        relationships: {
          appStoreVersionLocalization: { data: { type: "appStoreVersionLocalizations", id: locId } },
        },
      },
    });
    set = created.data;
  }
  const existing = await api(
    token,
    "GET",
    `https://api.appstoreconnect.apple.com/v1/appScreenshotSets/${set.id}/appScreenshots?limit=20`
  );
  if ((existing.data || []).length >= ORDER.length) {
    console.log("screenshots already present", existing.data.length);
    return;
  }
  for (const name of ORDER) {
    const file = fs.readFileSync(path.join(SHOT_DIR, name));
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
    console.log("uploaded", name);
  }
}

const token = jwt();
for (const locale of LOCALES) assertCopy(locale, store.apple.info[locale]);

const versions = await api(
  token,
  "GET",
  `https://api.appstoreconnect.apple.com/v1/apps/${APP_ID}/appStoreVersions?filter[platform]=IOS&limit=5`
);
const version =
  versions.data.find((v) => v.attributes.appStoreState === "PREPARE_FOR_SUBMISSION") || versions.data[0];
console.log("version", version.attributes.versionString, version.id);

const appInfos = await api(token, "GET", `https://api.appstoreconnect.apple.com/v1/apps/${APP_ID}/appInfos`);
const appInfo = appInfos.data[0];
for (const locale of LOCALES) {
  const infoLocs = await api(
    token,
    "GET",
    `https://api.appstoreconnect.apple.com/v1/appInfos/${appInfo.id}/appInfoLocalizations?limit=200`
  );
  const versionLocs = await api(
    token,
    "GET",
    `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`
  );
  console.log(
    "have",
    (versionLocs.data || []).map((l) => l.attributes.locale).join(", ")
  );
  const copy = store.apple.info[locale];
  let info = (infoLocs.data || []).find((l) => l.attributes.locale === locale);
  const infoAttrs = {
    name: copy.title,
    subtitle: copy.subtitle,
    privacyPolicyUrl: PRIVACY,
  };
  if (!info) {
    const created = await api(token, "POST", "https://api.appstoreconnect.apple.com/v1/appInfoLocalizations", {
      data: {
        type: "appInfoLocalizations",
        attributes: { locale, ...infoAttrs },
        relationships: { appInfo: { data: { type: "appInfos", id: appInfo.id } } },
      },
    });
    info = created.data;
    console.log(locale, "app info created", info.id);
  } else {
    await api(token, "PATCH", `https://api.appstoreconnect.apple.com/v1/appInfoLocalizations/${info.id}`, {
      data: { type: "appInfoLocalizations", id: info.id, attributes: infoAttrs },
    });
    console.log(locale, "app info updated", info.id);
  }

  let loc = (versionLocs.data || []).find((l) => l.attributes.locale === locale);
  const versionAttrs = {
    description: copy.description,
    keywords: copy.keywords,
    promotionalText: copy.promoText,
    supportUrl: SUPPORT,
    marketingUrl: MARKETING,
  };
  if (!loc) {
    try {
      const created = await api(token, "POST", "https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations", {
        data: {
          type: "appStoreVersionLocalizations",
          attributes: { locale, ...versionAttrs },
          relationships: { appStoreVersion: { data: { type: "appStoreVersions", id: version.id } } },
        },
      });
      loc = created.data;
      console.log(locale, "version locale created", loc.id);
    } catch (err) {
      if (err.status === 409) {
        const again = await api(
          token,
          "GET",
          `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`
        );
        loc = (again.data || []).find((l) => l.attributes.locale === locale);
        if (!loc) {
          const filtered = await api(
            token,
            "GET",
            `https://api.appstoreconnect.apple.com/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?filter[locale]=${locale}`
          );
          loc = filtered.data?.[0];
        }
        if (!loc) throw err;
        await api(token, "PATCH", `https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/${loc.id}`, {
          data: { type: "appStoreVersionLocalizations", id: loc.id, attributes: versionAttrs },
        });
        console.log(locale, "version locale updated after conflict", loc.id);
      } else if (!String(err.message).includes("whatsNew")) {
        throw err;
      } else {
        const { whatsNew, ...rest } = versionAttrs;
        const created = await api(token, "POST", "https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations", {
          data: {
            type: "appStoreVersionLocalizations",
            attributes: { locale, ...rest },
            relationships: { appStoreVersion: { data: { type: "appStoreVersions", id: version.id } } },
          },
        });
        loc = created.data;
        console.log(locale, "version locale created without whatsNew", loc.id);
      }
    }
  } else {
    await api(token, "PATCH", `https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/${loc.id}`, {
      data: { type: "appStoreVersionLocalizations", id: loc.id, attributes: versionAttrs },
    });
    console.log(locale, "version locale updated", loc.id);
  }

  await uploadScreenshots(token, loc.id);
}

console.log("done", LOCALES.join(", "));
