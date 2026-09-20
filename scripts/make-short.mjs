#!/usr/bin/env node
/**
 * make-short.mjs — LofiBuddha YouTube Short pipeline.
 *
 * Inspirerende gesproken tekst (ElevenLabs TTS) + Temple LoFi music
 * → 9:16 vertical short via de bestaande HyperFrames-renderer.
 *
 * Usage:
 *   node scripts/make-short.mjs \
 *     --text "Breathe in slowly. This moment is enough." \
 *     --title "Breathe" \
 *     --music temple-rain-hall \
 *     --template ancient-temple \
 *     [--upload]
 *
 * Zonder --upload wordt de video alleen lokaal gegenereerd (public/videos/).
 * Upload gaat alleen naar het JUISTE kanaal (Lo-Fi Buddha) — check eerst
 * scripts/check-channel.mjs.
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MUSIC_DIR = join(ROOT, "data", "music", "tracks");
const SOUNDS_DIR = join(ROOT, "data", "sounds", "audio");
const TMP = join(ROOT, "data", "shorts", "tmp");

// ── .env parser (geen dependency) ───────────────────────────────────────────
function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

function parseArgs() {
  const a = {};
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("--")) {
      a[process.argv[i].slice(2)] = process.argv[i + 1] || "true";
      i++;
    }
  }
  return a;
}

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, stdio: "inherit", timeout: 300_000 });
}

function shOut(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf-8", timeout: 60_000 }).trim();
}

// ── ElevenLabs TTS ───────────────────────────────────────────────────────────
async function tts(text, outPath) {
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!VOICE_ID || !API_KEY) throw new Error("ELEVENLABS_API_KEY / VOICE_ID ontbreken in .env");

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
    const body = await res.text();
    throw new Error(`TTS failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  if (buf.length < 1000) throw new Error("TTS output te klein");
}

function durationOf(p) {
  return parseFloat(shOut(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${p}"`));
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const a = parseArgs();
  const text = a.text || "Breathe in slowly. This moment is enough.";
  const title = a.title || "Daily Calm";
  const musicSlug = a.music || "temple-rain-hall";
  const template = a.template || "ancient-temple";
  const musicVol = parseFloat(a.musicvol) || 0.28;
  const tail = parseFloat(a.tail) || 1.6; // stilte/fade na de stem
  const upload = a.upload === "true" || a.upload === "1";

  const musicPath = join(MUSIC_DIR, `${musicSlug}.mp3`);
  if (!existsSync(musicPath)) {
    console.error(`✗ Music track niet gevonden: ${musicPath}`);
    process.exit(1);
  }

  mkdirSync(TMP, { recursive: true });
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const voicePath = join(TMP, `${slug}-voice.mp3`);
  const mixPath = join(SOUNDS_DIR, `short-${slug}.mp3`);

  console.log(`\n🎙️  TTS: "${text}"`);
  await tts(text, voicePath);
  const voiceDur = durationOf(voicePath);
  const videoDur = Math.round((voiceDur + tail) * 10) / 10;
  console.log(`   voice ${voiceDur.toFixed(2)}s → video ${videoDur}s`);

  // Mix: voice (vol 1.0) + music (geducked, geloopt) → combined
  console.log(`🎵 Mix voice + ${musicSlug} (music vol ${musicVol})`);
  sh(
    `ffmpeg -y -v error -i "${voicePath}" -i "${musicPath}" ` +
    `-filter_complex "[1:a]volume=${musicVol},aloop=loop=-1:size=2e9,atrim=0:${videoDur},afade=t=out:st=${Math.max(0, videoDur - 1.2)}:d=1.2[m];` +
    `[0:a]adelay=0|0[v];[v][m]amix=inputs=2:duration=longest:normalize=0:dropout_transition=2,alimiter=limit=0.95[a]" ` +
    `-map "[a]" -ar 44100 -c:a libmp3lame -b:a 192k "${mixPath}"`
  );

  console.log(`🎬 Render ${template} (9:16) → public/videos/`);
  const outName = `short-${slug}.mp4`;
  sh(
    `node scripts/generate-video.mjs --template ${template} --size 9:16 ` +
    `--duration ${videoDur} --caption "${text.replace(/"/g, '\\"')}" ` +
    `--subtitle "lofibuddha.com" --audio short-${slug} --audiovol 1.0 --output ${outName}`
  );

  const finalPath = join(ROOT, "public", "videos", outName);
  console.log(`\n✅ Short: ${finalPath}`);
  console.log(JSON.stringify({ success: true, output: outName, path: finalPath, duration: videoDur, music: musicSlug, title }));

  if (upload) {
    console.log("\n📤 Upload naar YouTube (private)...");
    // Via de bestaande API-route (die zelf het kanaal bepaalt).
    sh(`node -e "fetch('http://127.0.0.1:3000/api/youtube', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({videoPath:'/videos/${outName}',title:'${title}'})}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d)))"`);
  }
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
