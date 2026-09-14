#!/usr/bin/env node
/**
 * Test-varianten voor een diepere, warmere, dichterbijere, langzamere yogi-stem.
 * Genereert 4 settings-varianten van dezelfde laydown-tekst.
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

// Langzamere tekst: meer komma's en kortere clauses voor een ademend, rustig tempo.
const TEXT = [
  "Lie down now, and let your body sink, gently, into the support beneath you. Close your eyes softly, and for a few quiet moments, let the whole day simply fall away, like soft rain, settling into the earth.",
  "Feel the weight of your body, growing heavier, and heavier. Your shoulders, softening. Your jaw, releasing. As if every part of you, is slowly remembering, how to rest.",
  "There is nowhere to be now. And nothing, to do. Just this breath, moving slowly in. And slowly out. And the quiet warmth, of simply, being here.",
  "You do not need to fix anything, tonight. The day is over. And you have carried it, long enough. Let it go now, softly. And let yourself, be held.",
  "Allow your breath, to find its own, natural rhythm. Slow. And deep. Like a gentle tide, moving through you. And with every out-breath, sink a little further, into stillness.",
].join(" ");

// 4 settings-varianten: (label, voice_settings)
const VARIANTS = [
  ["baseline", { stability: 0.1, similarity_boost: 0.7, style: 0.95, use_speaker_boost: false }],
  ["warm", { stability: 0.35, similarity_boost: 0.72, style: 0.55, use_speaker_boost: false }],
  ["deep-close", { stability: 0.5, similarity_boost: 0.82, style: 0.35, use_speaker_boost: false }],
  ["calm", { stability: 0.6, similarity_boost: 0.78, style: 0.25, use_speaker_boost: false }],
];

async function tts(text, settings, outPath) {
  const payload = {
    text,
    model_id: "eleven_v3",
    voice_settings: settings,
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

for (const [label, settings] of VARIANTS) {
  const raw = `/tmp/laydown-${label}-raw.mp3`;
  const out = `/tmp/laydown-${label}.mp3`;
  console.log(`🎙️  ${label} (stability ${settings.stability}, sim ${settings.similarity_boost}, style ${settings.style})…`);
  await tts(TEXT, settings, raw);
  normalize(raw, out);
  execFileSync("rm", ["-f", raw]);
  const d = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf-8" });
  console.log(`   ✅ /tmp/laydown-${label}.mp3 (${d.stdout.trim()}s)`);
}
console.log("KLAAR");
