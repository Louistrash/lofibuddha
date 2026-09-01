#!/usr/bin/env node
/**
 * Genereer een geleide meditatie/workshop audio via ElevenLabs TTS.
 *
 * Gebruik:
 *   node scripts/generate-meditation.mjs <id> [meditations|focus|workshops] [--pauses]
 *
 * Default: de hele tekst wordt als één doorlopende take ingesproken (floating
 * stem), daarna alleen piek-normalisatie naar -7 dB. Geen de-esser, geen
 * loudnorm, geen fades — dat brak eerder de audio (woorden werden afgekapt /
 * stem klonk "oud").
 *
 * Met `--pauses`: elke segment wordt apart ingesproken (zelfde floating stem)
 * en de `pauseAfter`-stiltes worden ertussen geplakt. Voor slaap-workshops,
 * waar de lange stiltes essentieel zijn om in weg te zakken. De piek-
 * normalisatie gebeurt per segment zodat alle zinnen even luid zijn.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync, spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const id = process.argv[2];
const source = process.argv[3] || "meditations"; // "meditations" | "focus" | "workshops"
const usePauses = process.argv.includes("--pauses");
const AUDIO_DIR = join(ROOT, "data", source === "focus" ? "focus" : "meditations", "audio");
const TMP = join(AUDIO_DIR, ".tmp");
mkdirSync(TMP, { recursive: true });

if (!id) {
  console.error("Geef een id op: node scripts/generate-meditation.mjs <id> [meditations|focus|workshops] [--pauses]");
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

// --- TTS: floating stem (stability 0.1 / style 0.95) ---
async function tts(text, outPath) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.1, similarity_boost: 0.7, style: 0.95, use_speaker_boost: false },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 200)}`);
  }
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

// --- Peak-normalisatie: alleen verlagen naar -7 dB piek, nooit verhogen ---
function normalize(inPath, outPath) {
  const probe = spawnSync("ffmpeg", ["-i", inPath, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf-8" });
  const maxMatch = (probe.stderr || "").match(/max_volume:\s*(-?[\d.]+) dB/);
  const maxDb = maxMatch ? Number(maxMatch[1]) : -3;
  const gain = Math.min(0, -7 - maxDb);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", inPath,
    "-af", `${gain !== 0 ? `volume=${gain.toFixed(1)}dB` : "anull"}`,
    "-ar", "44100",
    "-c:a", "libmp3lame", "-b:a", "192k", outPath,
  ]);
  return gain;
}

// --- Stilte genereren (anullsrc) ---
function makeSilence(dur, outPath) {
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
    "-t", String(dur), "-c:a", "libmp3lame", "-b:a", "128k", outPath,
  ]);
}

const chime = join(ROOT, "data", "breathe", "audio", "chime.mp3");
const parts = [];
if (existsSync(chime) && !med.noChime) parts.push(`file '${chime}'`);
if (med.introPause > 0) {
  const sp = join(TMP, `silence-${med.introPause}.mp3`);
  if (!existsSync(sp)) makeSilence(med.introPause, sp);
  parts.push(`file '${sp}'`);
}

const cleanup = [];

if (usePauses) {
  console.log(`🎙️  Per-segment (${med.segments.length} zinnen) met pauzes (stem ${VOICE_ID})…`);
  for (let i = 0; i < med.segments.length; i++) {
    const seg = med.segments[i];
    const raw = join(TMP, `${id}-raw-${i}.mp3`);
    const norm = join(TMP, `${id}-norm-${i}.mp3`);
    await tts(seg.text, raw);
    const gain = normalize(raw, norm);
    parts.push(`file '${norm}'`);
    cleanup.push(raw, norm);
    if (seg.pauseAfter > 0) {
      const sil = join(TMP, `${id}-silence-${i}.mp3`);
      makeSilence(seg.pauseAfter, sil);
      parts.push(`file '${sil}'`);
      cleanup.push(sil);
    }
    console.log(`   zin ${i + 1}/${med.segments.length} (gain ${gain.toFixed(1)}dB)`);
  }
} else {
  console.log(`🎙️  Eén doorlopende take (stem ${VOICE_ID})…`);
  const fullText = med.segments.map((s) => s.text).join(" ");
  const raw = join(TMP, `${id}-raw.mp3`);
  await tts(fullText, raw);
  const norm = join(TMP, `${id}-norm.mp3`);
  const gain = normalize(raw, norm);
  console.log(`   gain ${gain.toFixed(1)}dB`);
  parts.push(`file '${norm}'`);
  cleanup.push(raw, norm);
}

const concatList = join(TMP, `${id}-list.txt`);
writeFileSync(concatList, parts.join("\n") + "\n");

const out = join(AUDIO_DIR, id + ".mp3");
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", concatList, "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", out]);

// cleanup
for (const f of cleanup) { try { execFileSync("rm", ["-f", f]); } catch {} }
try { execFileSync("rm", ["-f", concatList]); } catch {}

console.log(`✅ ${out}`);
