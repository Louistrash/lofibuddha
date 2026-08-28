#!/usr/bin/env node
/**
 * Generate the affirmation audio library (one-time cost; every listen is free).
 *
 * Run: node --experimental-strip-types scripts/generate-affirmations.mjs
 *
 * Speaks every affirmation in packages/shared/src/affirmations.ts and normalizes
 * each clip to -23 LUFS. Output: data/affirmations/audio/<id>.mp3.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { AFFIRMATIONS } from "../packages/shared/src/affirmations.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AUDIO_DIR = join(ROOT, "data", "affirmations", "audio");
mkdirSync(AUDIO_DIR, { recursive: true });

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
const VOICE_ID = env.ELEVENLABS_VOICE_ID || "iJkzOEXKLoZ6ZquIAnOA";
if (!API_KEY) {
  console.error("❌ ELEVENLABS_API_KEY not found in .env");
  process.exit(1);
}

async function tts(text, outPath) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 160)}`);
  }
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

for (const a of AFFIRMATIONS) {
  const raw = join(AUDIO_DIR, `.tmp-${a.id}.mp3`);
  const out = join(AUDIO_DIR, `${a.id}.mp3`);
  process.stdout.write(`🎙️  ${a.id}… `);
  await tts(a.text, raw);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", raw,
    "-af", "loudnorm=I=-23:TP=-1.5:LRA=11",
    "-c:a", "libmp3lame", "-b:a", "192k", out,
  ]);
  try { execFileSync("rm", ["-f", raw]); } catch {}
  console.log("done");
}

console.log(`Klaar — ${AFFIRMATIONS.length} affirmaties gegenereerd.`);
