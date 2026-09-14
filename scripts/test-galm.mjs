#!/usr/bin/env node
/**
 * Galm-test: zelfde originele yogi-stem (stability 0.1 / sim 0.7), maar lagere
 * style om de echo/reverb ("galm") te verminderen.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync, spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const env = {};
for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
  const eq = line.indexOf("=");
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
}
const API_KEY = env.ELEVENLABS_API_KEY;
const VOICE_ID = env.ELEVENLABS_VOICE_ID;

// Originele laydown-tekst (niet de langzamere variant).
const TEXT = [
  "Lie down now, and let your body sink into the support beneath you. Close your eyes gently, and for a few quiet moments, let the whole day simply fall away, like soft rain settling into the earth.",
  "Feel the weight of your body growing heavier, your shoulders softening, your jaw releasing, as if every part of you is slowly remembering how to rest.",
  "There is nowhere to be now, and nothing to do. Just this breath, moving slowly in, and slowly out, and the quiet warmth of simply being here.",
  "You do not need to fix anything tonight. The day is over, and you have carried it long enough. Let it go now, softly, and let yourself be held.",
  "Allow your breath to find its own natural rhythm, slow and deep, like a gentle tide moving through you, and with every out-breath, sink a little further into stillness.",
].join(" ");

const VARIANTS = [
  ["style-95", 0.95], // origineel (galm)
  ["style-45", 0.45],
  ["style-20", 0.20],
];

async function tts(text, style, outPath) {
  const payload = {
    text,
    model_id: "eleven_v3",
    voice_settings: { stability: 0.1, similarity_boost: 0.7, style, use_speaker_boost: false },
  };
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
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
}

for (const [label, style] of VARIANTS) {
  const raw = `/tmp/galm-${label}-raw.mp3`;
  const out = `/tmp/galm-${label}.mp3`;
  console.log(`🎙️  ${label} (style ${style})…`);
  await tts(TEXT, style, raw);
  normalize(raw, out);
  execFileSync("rm", ["-f", raw]);
  const d = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf-8" });
  console.log(`   ✅ /tmp/galm-${label}.mp3 (${d.stdout.trim()}s)`);
}
console.log("KLAAR");
