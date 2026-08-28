#!/usr/bin/env node
/**
 * Regenerate soundscapes via ElevenLabs Sound Effects API.
 * Prompts are read directly from src/lib/sounds.ts (single source of truth),
 * and generated clips are normalized with loudnorm (EBU R128) for mixer consistency.
 *
 * Usage:
 *   node scripts/regenerate-sounds.mjs --list              # show available slugs
 *   node scripts/regenerate-sounds.mjs --slug gentle-rain  # regenerate one sound
 *   node scripts/regenerate-sounds.mjs --slug gentle-rain --slug ocean-waves
 *   node scripts/regenerate-sounds.mjs --all               # regenerate all 15 (costs credits!)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AUDIO_DIR = join(ROOT, "data", "sounds", "audio");
mkdirSync(AUDIO_DIR, { recursive: true });

const env = Object.fromEntries(
  readFileSync(join(ROOT, ".env"), "utf-8")
    .split("\n")
    .filter(l => l.includes("="))
    .map(l => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const API_KEY = env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY not found in .env");
  process.exit(1);
}

// --- Parse prompts from packages/shared/src/sounds.ts (single source of truth;
//     it moved here from src/lib/ during the monorepo split) ---
const soundsTs = readFileSync(join(ROOT, "packages", "shared", "src", "sounds.ts"), "utf-8");
const SOUNDS = [];
const entryRe = /\{\s*slug:\s*"([^"]+)",\s*name:\s*"[^"]+",\s*description:\s*"[^"]*",\s*category:\s*"[^"]+",\s*prompt:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
let m;
while ((m = entryRe.exec(soundsTs)) !== null) {
  SOUNDS.push({ slug: m[1], prompt: m[2] });
}
if (SOUNDS.length === 0) {
  console.error("❌ Kon geen sounds parsen uit src/lib/sounds.ts");
  process.exit(1);
}

// --- CLI args ---
const args = process.argv.slice(2);
if (args.includes("--list")) {
  console.log("Beschikbare sounds (" + SOUNDS.length + "):");
  for (const s of SOUNDS) console.log("  " + s.slug);
  process.exit(0);
}

let targets;
if (args.includes("--all")) {
  targets = SOUNDS;
} else if (args.includes("--slug")) {
  const slugs = [];
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] === "--slug" && !args[i + 1].startsWith("--")) slugs.push(args[i + 1]);
  }
  targets = SOUNDS.filter(s => slugs.includes(s.slug));
  const missing = slugs.filter(s => !SOUNDS.some(x => x.slug === s));
  if (missing.length) {
    console.error("❌ Onbekende slugs: " + missing.join(", ") + " (zie --list)");
    process.exit(1);
  }
} else {
  console.error("Gebruik: --list | --slug <slug> [...] | --all");
  process.exit(1);
}

// --- Generate + normalize ---
async function generate(slug, text) {
  console.log(`🎧 Generating ${slug}...`);
  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, duration_seconds: 20 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const raw = join(AUDIO_DIR, `.tmp-${slug}-raw.mp3`);
  writeFileSync(raw, buf);

  // Normalize to match the rest of the library (~-30 dB mean, no clipping)
  const out = join(AUDIO_DIR, slug + ".mp3");
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", raw,
    "-af", "loudnorm=I=-23:TP=-1.5:LRA=11",
    "-c:a", "libmp3lame", "-b:a", "192k", out,
  ]);
  // NOTE: existing files are normalized to ~-30.3 dB mean; loudnorm I=-23
  // yields ~-31 dB mean, which is within ±1 dB of the library. If you want the
  // exact same target, swap the filter for: volume=<gain>dB (measure first).
  writeFileSync(raw, Buffer.alloc(0)); // keep file but zeroed; remove below
  try { execFileSync("rm", ["-f", raw]); } catch {}
  const kb = Math.round((buf.length / 1024));
  console.log(`✅ ${out} (${kb} KB raw) → genormaliseerd`);
}

for (const t of targets) {
  await generate(t.slug, t.prompt);
}
console.log("Klaar.");
