#!/usr/bin/env node
/**
 * Make a soundscape ~3x longer by generating three distinct 20s takes of the
 * same prompt and crossfading them together. ElevenLabs sound-generation caps
 * at ~20s, so a single clip has to loop client-side and reads as repetitive
 * within seconds. Three separate takes (the API is non-deterministic) blended
 * with a 2s crossfade give ~56s of variation — the loop point stays, but it now
 * comes once a minute instead of every 20s.
 *
 * Usage:
 *   node scripts/extend-sounds.mjs --slug gentle-rain
 *   node scripts/extend-sounds.mjs --slug gentle-rain --slug ocean-waves
 *   node scripts/extend-sounds.mjs --all          # every loop-able sound (costs credits)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AUDIO_DIR = join(ROOT, "data", "sounds", "audio");
const TMP = join(AUDIO_DIR, ".tmp-extend");
mkdirSync(TMP, { recursive: true });

const env = Object.fromEntries(
  readFileSync(join(ROOT, ".env"), "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const API_KEY = env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY not found in .env");
  process.exit(1);
}

const soundsTs = readFileSync(join(ROOT, "packages", "shared", "src", "sounds.ts"), "utf-8");
const SOUNDS = [];
const entryRe = /\{\s*slug:\s*"([^"]+)",\s*name:\s*"[^"]+",\s*description:\s*"[^"]*",\s*category:\s*"[^"]+",\s*prompt:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
let m;
while ((m = entryRe.exec(soundsTs)) !== null) {
  SOUNDS.push({ slug: m[1], prompt: m[2] });
}
if (SOUNDS.length === 0) {
  console.error("❌ Could not parse sounds.ts");
  process.exit(1);
}

const args = process.argv.slice(2);
let targets;
if (args.includes("--all")) {
  // Loop-able, continuous ambience. Skip the pure noises (already steady) and
  // the discrete chant/bowl hits, which crossfade poorly.
  const SKIP = new Set(["brown-noise", "pink-noise", "singing-bowls", "temple-chanting", "meditate", "focus", "sleep"]);
  targets = SOUNDS.filter((s) => !SKIP.has(s.slug));
} else if (args.includes("--slug")) {
  const slugs = [];
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] === "--slug" && !args[i + 1].startsWith("--")) slugs.push(args[i + 1]);
  }
  targets = SOUNDS.filter((s) => slugs.includes(s.slug));
  const missing = slugs.filter((s) => !SOUNDS.some((x) => x.slug === s));
  if (missing.length) {
    console.error("❌ Unknown slugs: " + missing.join(", "));
    process.exit(1);
  }
} else {
  console.error("Usage: --slug <slug> [...] | --all");
  process.exit(1);
}

async function generateVariant(slug, prompt, i) {
  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text: prompt, duration_seconds: 20 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 200)}`);
  }
  const f = join(TMP, `${slug}-v${i}.mp3`);
  writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  return f;
}

async function extend(slug, prompt) {
  console.log(`🎧 ${slug}: generating 3 takes…`);
  const v = [];
  for (let i = 0; i < 3; i++) {
    v.push(await generateVariant(slug, prompt, i));
    console.log(`   take ${i + 1}/3`);
  }

  const out = join(AUDIO_DIR, `${slug}.mp3`);
  // Back up the current 20s file before overwriting.
  if (existsSync(out)) {
    const bak = join(AUDIO_DIR, `.backup-${slug}.mp3`);
    copyFileSync(out, bak);
  }

  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-i", v[0], "-i", v[1], "-i", v[2],
    "-filter_complex",
    "[0:a][1:a]acrossfade=d=2:c1=tri:c2=tri[a1];" +
    "[a1][2:a]acrossfade=d=2:c1=tri:c2=tri[merged];" +
    "[merged]loudnorm=I=-23:TP=-1.5:LRA=11[out]",
    "-map", "[out]",
    "-c:a", "libmp3lame", "-b:a", "192k",
    out,
  ]);

  for (const f of v) { try { execFileSync("rm", ["-f", f]); } catch {} }

  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf-8" }).trim();
  console.log(`✅ ${out} — ${Math.round(Number(dur))}s`);
}

for (const t of targets) {
  await extend(t.slug, t.prompt);
}
console.log("Klaar.");
