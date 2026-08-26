#!/usr/bin/env node
/**
 * Generate every icon from the master artwork (public/lb.png).
 *
 * Run: node scripts/make-icons.mjs
 *
 * The master is 2000x2000 cream line art on transparency. Two rules drive the
 * output:
 *  - Trim the transparent margin first, then apply our own padding, so every
 *    icon is optically the same size instead of inheriting the artwork's
 *    accidental whitespace.
 *  - iOS icons may not carry alpha (they render black), so those are flattened
 *    onto the brand ink. Android adaptive foregrounds must stay transparent and
 *    fit the inner safe zone, because the launcher masks them to a circle.
 */

import sharp from "sharp";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const MASTER = resolve(ROOT, "public/lb.png");
const MARK = resolve(ROOT, "public/icon-mark.svg");
/** Circular 3D render (transparent corners) — the web favicon and app logo. */
const STATUE = resolve(ROOT, "public/bodhi-statue.png");

const INK = { r: 0x08, g: 0x07, b: 0x0c, alpha: 1 }; // brand background #08070C

/** Artwork trimmed to its ink, cached so we only decode the master once. */
let trimmedCache = null;
async function trimmed() {
  if (!trimmedCache) {
    trimmedCache = await sharp(MASTER).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  }
  return trimmedCache;
}

/**
 * @param size    output canvas in px
 * @param scale   fraction of the canvas the artwork should occupy
 * @param bg      null = transparent, otherwise flattened behind the art
 * @param tint    optional solid colour to force the ink to (monochrome icons)
 */
async function render(size, { scale = 0.82, bg = null, tint = null } = {}) {
  const inner = Math.round(size * scale);
  let art = sharp(await trimmed()).resize(inner, inner, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (tint) {
    // Keep the alpha shape, replace every colour with the tint.
    const { data, info } = await art.raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += info.channels) {
      data[i] = tint.r;
      data[i + 1] = tint.g;
      data[i + 2] = tint.b;
    }
    art = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });
  }

  const artBuf = await art.png().toBuffer();
  const pad = Math.round((size - inner) / 2);

  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: artBuf, top: pad, left: pad }]);

  // Apple rejects App Store icons that carry an alpha channel at all, even a
  // fully opaque one, so drop it whenever we composited onto a solid colour.
  const flat = bg ? canvas.flatten({ background: bg }).removeAlpha() : canvas;

  return flat.png({ compressionLevel: 9, palette: false }).toBuffer();
}

/**
 * Render the simplified mark (public/icon-mark.svg) at a small size.
 * The detailed artwork collapses into a smudge below ~48px, so favicons come
 * from the reduced sibling instead. High density first so the SVG is rasterised
 * cleanly, then downsampled.
 */
async function renderMark(size) {
  return sharp(MARK, { density: 900 })
    .resize(size, size, { fit: "contain" })
    .flatten({ background: INK })
    .removeAlpha()
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

/**
 * Web icon from the circular statue render.
 *
 * `tight` crops in on the head before resizing: at 16-48px the full
 * composition loses the face, and a measurably more readable icon matters more
 * in a browser tab than showing the whole figure.
 * Corners stay transparent so no black square appears around the circle.
 */
async function renderStatue(size, { tight = false, ring = true } = {}) {
  const meta = await sharp(STATUE).metadata();
  const S = meta.width;

  let img = sharp(STATUE);
  if (tight) {
    const w = Math.round(S * 0.74);
    img = sharp(
      await sharp(STATUE)
        .extract({ left: Math.round((S - w) / 2), top: Math.round(S * 0.1), width: w, height: w })
        .png()
        .toBuffer()
    );
  }

  const scaled = await img
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  if (!ring) return sharp(scaled).png({ compressionLevel: 9, palette: false }).toBuffer();

  // The artwork's own background is near-black, so on a dark browser tab the
  // circle dissolves into the chrome. A hairline gold edge keeps the silhouette
  // readable on light and dark tabs alike — the same trick the in-app Logo
  // component uses with colors.goldEdge.
  const w = Math.max(1, Math.round(size * 0.045));
  const r = size / 2 - w / 2;
  const edge = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" ` +
      `fill="none" stroke="#E4B872" stroke-width="${w}" stroke-opacity="0.85"/></svg>`
  );

  return sharp(scaled)
    .composite([{ input: edge }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

/** Statue flattened onto the brand ink — iOS home-screen tiles ignore alpha. */
async function renderStatueOnInk(size) {
  return sharp(await renderStatue(size))
    .flatten({ background: INK })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Solid colour square (Android adaptive background layer). */
async function solid(size, colour) {
  return sharp({ create: { width: size, height: size, channels: 4, background: colour } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Multi-resolution .ico containing PNG payloads.
 * Header: 6-byte ICONDIR, then one 16-byte ICONDIRENTRY per image.
 */
function buildIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  pngs.forEach(({ size, data }, i) => {
    const e = 16 * i;
    entries.writeUInt8(size >= 256 ? 0 : size, e + 0); // 0 means 256
    entries.writeUInt8(size >= 256 ? 0 : size, e + 1);
    entries.writeUInt8(0, e + 2); // palette size
    entries.writeUInt8(0, e + 3); // reserved
    entries.writeUInt16LE(1, e + 4); // colour planes
    entries.writeUInt16LE(32, e + 6); // bits per pixel
    entries.writeUInt32LE(data.length, e + 8);
    entries.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });

  return Buffer.concat([header, entries, ...pngs.map((p) => p.data)]);
}

async function save(relPath, buffer) {
  const full = resolve(ROOT, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, buffer);
  let before = null;
  try {
    before = null;
  } catch {}
  const kb = (buffer.length / 1024).toFixed(1);
  console.log(`  ${relPath.padEnd(48)} ${String(kb).padStart(8)} KB`);
}

const targets = [
  // ---- Web favicons (filenames match what layout.tsx and +html.tsx expect) ----
  // Web favicons: the statue render, transparent corners (no black square).
  // Small sizes crop tighter so the face survives; 180px+ shows the full circle.
  ["public/bodhi-icon-32.png", () => renderStatue(32, { tight: true })],
  ["public/bodhi-icon-48.png", () => renderStatue(48, { tight: true })],
  ["public/bodhi-icon-180.png", () => renderStatue(180)],
  ["public/bodhi-icon-192.png", () => renderStatue(192)],
  ["public/bodhi-icon-512.png", () => renderStatue(512)],
  ["public/bodhi-icon.png", () => renderStatue(512)],
  // apple-touch-icon is composited on a solid tile: iOS shows no transparency.
  ["public/apple-touch-icon.png", () => renderStatueOnInk(180)],
  // Transparent logo for use on top of existing surfaces
  ["public/lb-logo-512.png", () => render(512, { scale: 0.94 })],
  ["public/lb-logo-1024.png", () => render(1024, { scale: 0.94 })],

  // ---- Expo app icons ----
  // iOS: no alpha allowed, so flatten onto the brand ink.
  ["mobile/assets/images/icon.png", () => render(1024, { scale: 0.78, bg: INK })],
  // Splash renders on #08070C already, so keep it transparent.
  ["mobile/assets/images/splash-icon.png", () => render(1024, { scale: 0.9 })],
  ["mobile/assets/images/favicon.png", () => renderStatue(48, { tight: true })],
  // Android adaptive: launcher masks to a circle, so the art must sit inside
  // the inner ~66% safe zone or the edges get clipped.
  ["mobile/assets/images/android-icon-foreground.png", () => render(1024, { scale: 0.58 })],
  ["mobile/assets/images/android-icon-background.png", () => solid(1024, INK)],
  ["mobile/assets/images/android-icon-monochrome.png",
    () => render(1024, { scale: 0.58, tint: { r: 255, g: 255, b: 255 } })],
  // In-app logo (Logo/Wordmark clip it to a circle, so transparency is right).
  ["mobile/assets/images/logo.png", () => renderStatue(512, { ring: false })],
];

console.log("Generating icons from public/lb.png\n");
for (const [path, make] of targets) {
  await save(path, await make());
}

// favicon.ico — 16/32/48 in one file for legacy browsers and bookmarks.
const icoSizes = [16, 32, 48];
const icoPngs = [];
for (const size of icoSizes) {
  icoPngs.push({ size, data: await renderStatue(size, { tight: true }) });
}
await save("public/favicon.ico", buildIco(icoPngs));

// nginx serves the site root from mobile/dist, so every web-facing icon must
// also exist in Expo's public/ directory to survive `expo export`.
const { copyFile } = await import("node:fs/promises");
const mirrored = [
  "favicon.ico", "bodhi-icon-32.png", "bodhi-icon-48.png", "bodhi-icon-180.png",
  "bodhi-icon-192.png", "bodhi-icon-512.png", "bodhi-icon.png",
  "apple-touch-icon.png", "lb-logo-512.png", "icon-mark.svg", "bodhi-statue.png",
];
await mkdir(resolve(ROOT, "mobile/public"), { recursive: true });
for (const f of mirrored) {
  await copyFile(resolve(ROOT, "public", f), resolve(ROOT, "mobile/public", f));
}
console.log(`\nMirrored ${mirrored.length} web icons into mobile/public/`);

console.log("\nDone.");
