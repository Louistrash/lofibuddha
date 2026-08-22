#!/usr/bin/env node
/**
 * Genereer een geleide meditatie audio via ElevenLabs TTS.
 * Leest de segments uit src/lib/meditations.ts en bouwt:
 *   [chime 10s] segment1 [stilte] segment2 [stilte] ... 
 * Gebruik: node scripts/generate-meditation.mjs <meditation-id>
 *          node scripts/generate-meditation.mjs body-scan
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const id = process.argv[2];
const source = process.argv[3] || "meditations"; // "meditations" (default) of "focus"
if (!id) { console.error("Gebruik: node scripts/generate-meditation.mjs <id> [meditations|focus]"); process.exit(1); }

const AUDIO_DIR = join(ROOT, "data", source === "focus" ? "focus" : "meditations", "audio");
mkdirSync(AUDIO_DIR, { recursive: true });
const TMP = join(ROOT, "data", "meditations", ".tmp");
mkdirSync(TMP, { recursive: true });

const env = Object.fromEntries(
  readFileSync(join(ROOT, ".env"), "utf-8")
    .split("\n").filter(l => l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const API_KEY = env.ELEVENLABS_API_KEY;
const VOICE_ID = env.ELEVENLABS_VOICE_ID || "iJkzOEXKLoZ6ZquIAnOA";
if (!API_KEY) { console.error("❌ ELEVENLABS_API_KEY niet gevonden"); process.exit(1); }

// Parse meditations/focus-guides uit de juiste bron
const srcFile = source === "focus" ? "focus-guides.ts" : "meditations.ts";
const ts = readFileSync(join(ROOT, "src", "lib", srcFile), "utf-8");
const blockRe = /\{\s*id:\s*"([^"]+)",[\s\S]*?segments:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
let m, med = null;
while ((m = blockRe.exec(ts)) !== null) {
  if (m[1] === id) {
    const segRe = /\{\s*text:\s*"((?:[^"\\]|\\.)*)",\s*pauseAfter:\s*(\d+)\s*\}/g;
    const segments = [];
    let s;
    while ((s = segRe.exec(m[2])) !== null) {
      segments.push({ text: s[1].replace(/\\"/g, '"'), pauseAfter: Number(s[2]) });
    }
    med = { id, segments };
    break;
  }
}
if (!med) { console.error(`❌ '${id}' niet gevonden in ${srcFile}`); process.exit(1); }
console.log(`📖 ${med.segments.length} segmenten gevonden (${source})`);

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
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

// 1) Genereer elk segment
const segFiles = [];
for (let i = 0; i < med.segments.length; i++) {
  const seg = med.segments[i];
  const f = join(TMP, `${id}-seg${i}.mp3`);
  console.log(`🎙️  Segment ${i + 1}/${med.segments.length}...`);
  await tts(seg.text, f);
  segFiles.push(f);
}

// 2) Bouw de volledige meditatie: chime + segmenten met stilte ertussen
//    Chime = data/breathe/audio/chime.mp3 (10s)
const chime = join(ROOT, "data", "breathe", "audio", "chime.mp3");
const concatList = join(TMP, `${id}-list.txt`);
const parts = [];
if (existsSync(chime)) parts.push(`file '${chime}'`);
for (const [i, f] of segFiles.entries()) {
  parts.push(`file '${f}'`);
  const pause = med.segments[i].pauseAfter;
  if (pause > 0) parts.push(`file '${join(TMP, 'silence-' + pause + '.mp3')}'`);
}
// pre-make silence files
const silences = new Set(med.segments.map(s => s.pauseAfter).filter(p => p > 0));
for (const p of silences) {
  const sp = join(TMP, `silence-${p}.mp3`);
  if (!existsSync(sp)) {
    execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", `anullsrc=r=44100:cl=mono`,
      "-t", String(p), "-c:a", "libmp3lame", "-b:a", "128k", sp]);
  }
}
writeFileSync(concatList, parts.join("\n") + "\n");

const raw = join(TMP, `${id}-raw.mp3`);
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", concatList, "-c:a", "libmp3lame", "-b:a", "192k", raw]);

// 3) Normaliseer op ~-23 dB (zoals de bestaande meditaties: mean -22.5)
const out = join(AUDIO_DIR, id + ".mp3");
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", raw, "-af", "loudnorm=I=-23:TP=-1.5:LRA=11", "-c:a", "libmp3lame", "-b:a", "192k", out]);

// cleanup
for (const f of segFiles) { try { execFileSync("rm", ["-f", f]); } catch {} }
try { execFileSync("rm", ["-f", concatList, raw]); } catch {}

const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf-8" }).trim();
console.log(`✅ ${out} — ${dur}s`);
