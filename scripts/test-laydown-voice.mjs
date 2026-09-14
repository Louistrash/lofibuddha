#!/usr/bin/env node
/**
 * Test-opname: rustige "lay down and..." opening met de yogi-stem.
 * Schrijft het resultaat naar /tmp zodat Louis de toon/zinnen kan beoordelen
 * voordat we de 5 lange geleide meditaties schrijven.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync, spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// .env laden
const env = {};
for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
  const eq = line.indexOf("=");
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
}
const API_KEY = env.ELEVENLABS_API_KEY;
const VOICE_ID = env.ELEVENLABS_VOICE_ID;
if (!API_KEY || !VOICE_ID) {
  console.error("ELEVENLABS_API_KEY of ELEVENLABS_VOICE_ID ontbreekt");
  process.exit(1);
}

// --- De testopening ("lay down and...", rustig + warm, lange vloeiende zinnen) ---
// Regels: géén ellipsen, géén em-dashes, komma's als pauzes, softening words
// (gently, softly, perhaps, just), uitnodigende toon i.p.v. bevelen.
const TEXT = [
  "Lie down now, and let your body sink into the support beneath you. Close your eyes gently, and for a few quiet moments, let the whole day simply fall away, like soft rain settling into the earth.",
  "Feel the weight of your body growing heavier, your shoulders softening, your jaw releasing, as if every part of you is slowly remembering how to rest.",
  "There is nowhere to be now, and nothing to do. Just this breath, moving slowly in, and slowly out, and the quiet warmth of simply being here.",
  "You do not need to fix anything tonight. The day is over, and you have carried it long enough. Let it go now, softly, and let yourself be held.",
  "Allow your breath to find its own natural rhythm, slow and deep, like a gentle tide moving through you, and with every out-breath, sink a little further into stillness.",
].join(" ");

async function tts(text, outPath) {
  const payload = {
    text,
    model_id: "eleven_v3",
    voice_settings: { stability: 0.1, similarity_boost: 0.7, style: 0.95, use_speaker_boost: false },
  };
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

function normalize(inPath, outPath) {
  const probe = spawnSync("ffmpeg", ["-i", inPath, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf-8" });
  const maxDb = Number((probe.stderr || "").match(/max_volume:\s*(-?[\d.]+) dB/)?.[1] ?? -3);
  const gain = Math.min(0, -7 - maxDb);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", inPath,
    "-af", `${gain !== 0 ? `volume=${gain.toFixed(1)}dB` : "anull"}`,
    "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", outPath,
  ]);
  return { gain, maxDb };
}

const raw = "/tmp/laydown-test-raw.mp3";
const out = "/tmp/laydown-test.mp3";
console.log(`🎙️  Testopening genereren (stem ${VOICE_ID})…`);
await tts(TEXT, raw);
const { gain, maxDb } = normalize(raw, out);
execFileSync("rm", ["-f", raw]);

const dur = execFileSync("ffmpeg", ["-i", out, "-f", "null", "-"], { encoding: "utf-8" })
  .toString();
const durMatch = (() => {
  const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf-8" });
  return p.stdout.trim();
})();
const vol = spawnSync("ffmpeg", ["-i", out, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf-8" });
const mean = (vol.stderr || "").match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1];
const max = (vol.stderr || "").match(/max_volume:\s*(-?[\d.]+) dB/)?.[1];

console.log(`✅ ${out}`);
console.log(`   duur: ${durMatch}s | mean ${mean} dB | max ${max} dB | gain ${gain.toFixed(1)}dB (raw max ${maxDb}dB)`);
