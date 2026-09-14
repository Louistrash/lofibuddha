#!/usr/bin/env node
/**
 * Zachte "lay down" opening — uitnodigend i.p.v. gebiedend.
 * Stem: style 0.20 (galm-vrij).
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

// Zachte, uitnodigende opening (géén "now" als commando, géén ellipsen).
const TEXT = [
  "Whenever you are ready, let yourself come to rest, and feel your body sink, softly, into the support beneath you.",
  "Close your eyes, gently, and for a few quiet moments, allow the whole day to simply fall away, like soft rain settling into the earth.",
  "There is nowhere to be now, and nothing to do, just this breath, moving slowly in, and slowly out, and the quiet warmth of simply being here.",
  "You do not need to fix anything tonight, the day is over, and you have carried it long enough, so let it go now, softly, and let yourself be held.",
].join(" ");

async function tts(text, outPath) {
  const payload = {
    text,
    model_id: "eleven_v3",
    voice_settings: { stability: 0.1, similarity_boost: 0.7, style: 0.2, use_speaker_boost: false },
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

const raw = "/tmp/laydown-soft-raw.mp3";
const out = "/tmp/laydown-soft.mp3";
console.log("🎙️  Zachte laydown-opening (style 0.20)…");
await tts(TEXT, raw);
normalize(raw, out);
execFileSync("rm", ["-f", raw]);
const d = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf-8" });
console.log(`✅ /tmp/laydown-soft.mp3 (${d.stdout.trim()}s)`);
