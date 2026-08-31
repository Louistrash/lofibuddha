#!/usr/bin/env node
/**
 * Genereer een geleide meditatie audio via ElevenLabs TTS.
 *
 * Gebruik: node scripts/generate-meditation.mjs <id> [meditations|focus|workshops]
 *
 * Natuurlijke timing: de hele meditatie wordt in één doorlopende take gesproken
 * (niet per zin geplakt). De intonatie loopt daardoor door en de stem neemt haar
 * eigen ademruimte bij punten en ellipses. Alleen de chime en de intro-pauze
 * worden als losse stilte toegevoegd.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const id = process.argv[2];
const source = process.argv[3] || "meditations"; // "meditations" | "focus" | "workshops"
if (!id) { console.error("Gebruik: node scripts/generate-meditation.mjs <id> [meditations|focus|workshops]"); process.exit(1); }

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

// Parse meditations/focus-guides/workshops uit packages/shared/src/.
const srcFile =
  source === "focus" ? "focus-guides.ts" :
  source === "workshops" ? "workshops.ts" :
  "meditations.ts";
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
    med = { id, introPause: Number((m[0].match(/introPause:\s*(\d+)/) || [0, 0])[1]), segments };
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
      voice_settings: { stability: 0.5, similarity_boost: 0.72, style: 0.1, use_speaker_boost: false },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

// 1) Eén doorlopende take. De ellipses en punten in de tekst geven de stem haar
//    eigen ademruimte, zodat het als één gesproken meditatie klinkt i.p.v. losse
//    fragmenten met harde stiltes. Split alleen bij de TTS-tekstlimiet (~5k chars)
//    op een zinsgrens.
const fullText = med.segments.map(s => s.text).join(" ");

function splitChunks(text, max = 4600) {
  if (text.length <= max) return [text];
  const chunks = [];
  let rest = text;
  while (rest.length > max) {
    let cut = rest.lastIndexOf(". ", max);
    if (cut < max * 0.5) cut = rest.lastIndexOf(" ", max);
    if (cut <= 0) cut = max;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}
const chunks = splitChunks(fullText);
console.log(`🎙️  ${chunks.length} take(s)…`);

const voiceFiles = [];
for (let i = 0; i < chunks.length; i++) {
  const rawF = join(TMP, `${id}-chunk${i}.mp3`);
  await tts(chunks[i], rawF);
  const f = join(TMP, `${id}-chunk${i}-norm.mp3`);
  // warme EQ + loudnorm + een zachte fade-out aan het einde van de laatste take.
  const isLast = i === chunks.length - 1;
  const filters = "highshelf=f=5500:g=-2.5:t=q,bass=g=+1.0,loudnorm=I=-23:TP=-1.5:LRA=11"
    + (isLast ? ",afade=t=out:d=0.6" : "");
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", rawF,
    "-af", filters,
    "-c:a", "libmp3lame", "-b:a", "192k", f,
  ]);
  voiceFiles.push(f);
}

// 2) Chime + intro-stilte + de doorlopende stem.
const chime = join(ROOT, "data", "breathe", "audio", "chime.mp3");
const concatList = join(TMP, `${id}-list.txt`);
const parts = [];
if (existsSync(chime)) parts.push(`file '${chime}'`);
if (med.introPause > 0) {
  const sp = join(TMP, `silence-${med.introPause}.mp3`);
  if (!existsSync(sp)) {
    execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
      "-t", String(med.introPause), "-c:a", "libmp3lame", "-b:a", "128k", sp]);
  }
  parts.push(`file '${sp}'`);
}
for (const f of voiceFiles) parts.push(`file '${f}'`);
writeFileSync(concatList, parts.join("\n") + "\n");

const raw = join(TMP, `${id}-raw.mp3`);
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", concatList, "-c:a", "libmp3lame", "-b:a", "192k", raw]);

const out = join(AUDIO_DIR, id + ".mp3");
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", raw, "-c:a", "copy", out]);

// cleanup
for (const f of voiceFiles) { try { execFileSync("rm", ["-f", f]); } catch {} }
for (let i = 0; i < chunks.length; i++) { try { execFileSync("rm", ["-f", join(TMP, `${id}-chunk${i}.mp3`)]); } catch {} }
try { execFileSync("rm", ["-f", concatList, raw]); } catch {}

const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf-8" }).trim();
console.log(`✅ ${out} — ${dur}s`);
