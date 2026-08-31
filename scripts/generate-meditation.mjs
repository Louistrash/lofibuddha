#!/usr/bin/env node
/**
 * Genereer een geleide meditatie audio via ElevenLabs TTS.
 *
 * Gebruik: node scripts/generate-meditation.mjs <id> [meditations|focus|workshops]
 *
 * De hele meditatie wordt in EEN doorlopende TTS-take gesproken — dat houdt de
 * intonatie en de woorden volledig (per-zin concat sneed de audio af). Pauzes
 * komen van de interpunctie in de tekst; alleen de chime en de intro-stilte
 * worden er apart omheen gezet.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
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
  console.error("Gebruik: node scripts/generate-meditation.mjs <id> [source]");
  process.exit(1);
}

// --- .env lezen ---
const env = {};
for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const API_KEY = env.ELEVENLABS_API_KEY;
const VOICE_ID = env.ELEVENLABS_VOICE_ID || "iJkzOEXKLoZ6ZquIAnOA";
if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY ontbreekt in .env");
  process.exit(1);
}

// --- Meditatie uit de bron parsen ---
const srcFile =
  source === "focus" ? "focus-guides.ts" :
  source === "workshops" ? "workshops.ts" : "meditations.ts";
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
if (!med) {
  console.error(`Meditatie '${id}' niet gevonden in ${srcFile}`);
  process.exit(1);
}

// --- TTS (één doorlopende take) ---
const fullText = med.segments.map((s) => s.text).join(" ");
console.log(`🎙️  Eén doorlopende take (${fullText.length} tekens)…`);
const rawVoice = join(TMP, `${id}-voice.mp3`);
{
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: fullText,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.5, similarity_boost: 0.72, style: 0.1, use_speaker_boost: false },
    }),
  });
  if (!res.ok) {
    console.error(`ElevenLabs ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  writeFileSync(rawVoice, Buffer.from(await res.arrayBuffer()));
}

// --- Two-pass loudnorm + warmte-EQ ---
const probe = spawnSync("ffmpeg", [
  "-i", rawVoice,
  "-af", "loudnorm=I=-23:TP=-1.5:LRA=11:print_format=json",
  "-f", "null", "-",
], { encoding: "utf-8" });
const probeOut = (probe.stderr || "") + (probe.stdout || "");
const jm = probeOut.match(/\{[\s\S]*?"input_i"[\s\S]*?\}/);
if (!jm) throw new Error("loudnorm probe mislukt");
const lm = JSON.parse(jm[0]);

const voice = join(TMP, `${id}-voice-norm.mp3`);
execFileSync("ffmpeg", [
  "-y", "-v", "error", "-i", rawVoice,
  "-af", `highshelf=f=5500:g=-2.5:t=q,bass=g=+1.0,loudnorm=I=-23:TP=-1.5:LRA=11:measured_I=${lm.input_i}:measured_TP=${lm.input_tp}:measured_LRA=${lm.input_lra}:measured_thresh=${lm.input_thresh}:offset=${lm.target_offset}:linear=true`,
  "-ar", "44100",
  "-c:a", "libmp3lame", "-b:a", "192k", voice,
]);

// --- Chime + intro-stilte + de stem samenvoegen ---
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
parts.push(`file '${voice}'`);
writeFileSync(concatList, parts.join("\n") + "\n");

const out = join(AUDIO_DIR, id + ".mp3");
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", concatList,
  "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", out]);

// cleanup
for (const f of [rawVoice, voice, concatList]) {
  try { execFileSync("rm", ["-f", f]); } catch {}
}

console.log(`✅ ${out} — klaar.`);
