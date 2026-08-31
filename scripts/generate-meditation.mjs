#!/usr/bin/env node
/**
 * Genereer een geleide meditatie audio via ElevenLabs TTS.
 *
 * Gebruik: node scripts/generate-meditation.mjs <id> [meditations|focus|workshops]
 *
 * Simpel en robuust: de hele meditatie wordt in één take ingesproken, daarna
 * alleen een de-esser (tegen sibilantie) en een piek-normalisatie (voorkomt
 * clipping). Geen loudnorm, geen fades, geen per-zin concat — dat brak de audio.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync, spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const id = process.argv[2];
const source = process.argv[3] || "meditations"; // "meditations" | "focus" | "workshops"
const AUDIO_DIR = join(ROOT, "data", source === "focus" ? "focus" : "meditations", "audio");
const TMP = join(AUDIO_DIR, ".tmp");
mkdirSync(TMP, { recursive: true });

if (!id) {
  console.error("Geef een id op: node scripts/generate-meditation.mjs <id>");
  process.exit(1);
}

// --- .env laden (ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID) ---
const env = {};
for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
  const eq = line.indexOf("=");
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
}
const API_KEY = env.ELEVENLABS_API_KEY;
const VOICE_ID = env.ELEVENLABS_VOICE_ID;
if (!API_KEY || !VOICE_ID) {
  console.error("ELEVENLABS_API_KEY of ELEVENLABS_VOICE_ID ontbreekt in .env");
  process.exit(1);
}

// --- Parse de meditatie uit packages/shared ---
const srcFile = source === "focus" ? "focus-guides.ts" : source === "workshops" ? "workshops.ts" : "meditations.ts";
const ts = readFileSync(join(ROOT, "packages", "shared", "src", srcFile), "utf-8");
const blockRe = /\{\s*id:\s*"([^"]+)",[\s\S]*?segments:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
let m, med = null;
while ((m = blockRe.exec(ts)) !== null) {
  if (m[1] === id) {
    const segRe = /\{\s*text:\s*"((?:[^"\\]|\\.)*)",\s*pauseAfter:\s*(\d+)\s*,?\s*\}/g;
    const segments = [];
    let s;
    while ((s = segRe.exec(m[2])) !== null) {
      segments.push({ text: s[1].replace(/\\"/g, '"'), pauseAfter: Number(s[2]) });
    }
    med = {
      id,
      introPause: Number((m[0].match(/introPause:\s*(\d+)/) || [0, 0])[1]),
      noChime: /noChime:\s*true/.test(m[0]),
      segments,
    };
    break;
  }
}
if (!med || med.segments.length === 0) {
  console.error(`Meditatie '${id}' niet gevonden (of geen segments).`);
  process.exit(1);
}

// --- TTS: één doorlopende take ---
async function tts(text, outPath) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.5, similarity_boost: 0.72, style: 0.1, use_speaker_boost: false },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 200)}`);
  }
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

console.log(`🎙️  Eén doorlopende take (stem ${VOICE_ID})…`);
const fullText = med.segments.map((s) => s.text).join(" ");
const raw = join(TMP, `${id}-raw.mp3`);
await tts(fullText, raw);

// --- Peak-normalisatie: alleen verlagen om clipping te voorkomen ---
const probe = spawnSync("ffmpeg", ["-i", raw, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf-8" });
const maxMatch = (probe.stderr || "").match(/max_volume:\s*(-?[\d.]+) dB/);
const maxDb = maxMatch ? Number(maxMatch[1]) : -3;
const gain = Math.min(0, -3 - maxDb); // nooit verhogen, alleen terugdraaien naar -3dB piek
console.log(`   piek ${maxDb}dB → gain ${gain.toFixed(1)}dB`);

const norm = join(TMP, `${id}-norm.mp3`);
execFileSync("ffmpeg", [
  "-y", "-v", "error", "-i", raw,
  "-af", `highshelf=f=6000:g=-4.5:t=q,lowpass=f=14000${gain !== 0 ? `,volume=${gain.toFixed(1)}dB` : ""}`,
  "-ar", "44100",
  "-c:a", "libmp3lame", "-b:a", "192k", norm,
]);

// --- Chime (optioneel) + intro-stilte + de stem ---
const chime = join(ROOT, "data", "breathe", "audio", "chime.mp3");
const concatList = join(TMP, `${id}-list.txt`);
const parts = [];
if (existsSync(chime) && !med.noChime) parts.push(`file '${chime}'`);
if (med.introPause > 0) {
  const sp = join(TMP, `silence-${med.introPause}.mp3`);
  if (!existsSync(sp)) {
    execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
      "-t", String(med.introPause), "-c:a", "libmp3lame", "-b:a", "128k", sp]);
  }
  parts.push(`file '${sp}'`);
}
parts.push(`file '${norm}'`);
writeFileSync(concatList, parts.join("\n") + "\n");

const out = join(AUDIO_DIR, id + ".mp3");
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", concatList, "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", out]);

// cleanup
try { execFileSync("rm", ["-f", raw, norm, concatList]); } catch {}

console.log(`✅ ${out}`);
