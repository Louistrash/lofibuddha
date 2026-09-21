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
async function tts(text, outPath, opts = {}) {
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!VOICE_ID || !API_KEY) throw new Error("ELEVENLABS_API_KEY / VOICE_ID ontbreken in .env");

  const stability = opts.stability ?? 0.6; // hoger = rustiger / minder intonatie
  const style = opts.style ?? 0.05; // lager = minder nadruk / klemtoon

  // with-timestamps → audio + per-karakter alignment (voor woord-sync).
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: { stability, similarity_boost: 0.75, style, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TTS failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const audio = Buffer.from(data.audio_base64, "base64");
  writeFileSync(outPath, audio);
  if (audio.length < 1000) throw new Error("TTS output te klein");
  return data.alignment || data.normalized_alignment || null;
}

// Groepeer karakter-alignment tot woorden: [{ w, t }] met t = starttijd (sec, relatief aan stem).
function wordsFromAlignment(alignment) {
  if (!alignment || !Array.isArray(alignment.characters)) return null;
  const chars = alignment.characters;
  const starts = alignment.character_start_times_seconds || [];
  const words = [];
  let cur = "", start = null;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === " " || c === "\n") {
      if (cur) { words.push({ w: cur, t: start ?? 0 }); cur = ""; start = null; }
    } else {
      if (cur === "") start = starts[i] ?? 0;
      cur += c;
    }
  }
  if (cur) words.push({ w: cur, t: start ?? 0 });
  return words;
}

function durationOf(p) {
  return parseFloat(shOut(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${p}"`));
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const a = parseArgs();
  const text = a.text || "Breathe in slowly. This moment is enough.";
  const title = a.title || "Daily Calm";
  const musicSlug = a.music || "temple-rain";
  const template = a.template || "mandala-breathe";
  const musicVol = parseFloat(a.musicvol) || 0.45;
  const musicSeek = parseFloat(a["music-seek"]) || 0; // skip stille intro (s), bv. temple-rain → 45
  const chimeSec = parseFloat(a.chime) || 0; // chime-seconden aan begin (0 = uit)
  const voiceDelay = parseFloat(a.voicedelay) || (chimeSec > 0 ? 2.0 : 0);
  const wordOffset = parseFloat(a["word-offset"]) || 0.3; // extra vertraging tekst t.o.v. stem (s)
  const stability = parseFloat(a.stability) || 0.6; // hoger = rustiger / minder intonatie
  const style = parseFloat(a.style) || 0.05; // lager = minder nadruk / klemtoon
  const targetDur = parseFloat(a.duration) || 0; // 0 = auto (voice + delay + 2s)
  const upload = a.upload === "true" || a.upload === "1";

  const musicPath = join(MUSIC_DIR, `${musicSlug}.mp3`);
  if (!existsSync(musicPath)) {
    console.error(`✗ Music track niet gevonden: ${musicPath}`);
    process.exit(1);
  }
  const chimePath = join(ROOT, "data", "breathe", "audio", "chime.mp3");
  if (chimeSec > 0 && !existsSync(chimePath)) {
    console.error(`✗ Chime niet gevonden: ${chimePath}`);
    process.exit(1);
  }

  mkdirSync(TMP, { recursive: true });
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const voicePath = join(TMP, `${slug}-voice.mp3`);
  const mixPath = join(SOUNDS_DIR, `short-${slug}.mp3`);

  console.log(`\n🎙️  TTS: "${text}"`);
  const alignment = await tts(text, voicePath, { stability, style });
  const voiceDur = durationOf(voicePath);
  let timingsPath = "";
  const voiceWords = wordsFromAlignment(alignment);
  if (voiceWords && voiceWords.length) {
    timingsPath = join(TMP, `${slug}-timings.json`);
    writeFileSync(timingsPath, JSON.stringify(voiceWords.map((x) => ({ w: x.w, t: +(voiceDelay + x.t + wordOffset).toFixed(2) }))));
    console.log(`   🔊 woord-sync: ${voiceWords.length} woorden getimed (delay ${voiceDelay}s + offset ${wordOffset}s)`);
  }
  const videoDur = targetDur > 0 ? targetDur : Math.round((voiceDelay + voiceDur + 2.0) * 10) / 10;
  console.log(`   voice ${voiceDur.toFixed(2)}s | chime ${chimeSec}s | delay ${voiceDelay}s → video ${videoDur}s`);

  // Mix: chime (begin) + voice (na delay) + music (geducked, geloopt) → combined
  console.log(`🎵 Mix chime + voice + ${musicSlug} (music vol ${musicVol})`);
  const voiceDelayMs = Math.round(voiceDelay * 1000);
  const filterParts = [
    `[0:a]adelay=${voiceDelayMs}|${voiceDelayMs}[v]`,
    `[1:a]atrim=start=${musicSeek},asetpts=PTS-STARTPTS,volume=${musicVol},aloop=loop=-1:size=2e9,atrim=0:${videoDur},afade=t=out:st=${Math.max(0, videoDur - 1.4)}:d=1.4[m]`,
  ];
  let chimeArg = "";
  let mixInputs = "[v][m]";
  let nInputs = 2;
  if (chimeSec > 0) {
    filterParts.push(`[2:a]volume=0.7,atrim=0:${chimeSec},afade=t=out:st=${Math.max(0, chimeSec - 1.4)}:d=1.4[c]`);
    mixInputs = "[v][m][c]";
    nInputs = 3;
    chimeArg = `-i "${chimePath}"`;
  }
  sh(
    `ffmpeg -y -v error -i "${voicePath}" -i "${musicPath}" ${chimeArg} ` +
    `-filter_complex "${filterParts.join(";")};${mixInputs}amix=inputs=${nInputs}:duration=longest:normalize=0:dropout_transition=3,alimiter=limit=0.95[a]" ` +
    `-map "[a]" -ar 44100 -c:a libmp3lame -b:a 192k "${mixPath}"`
  );

  console.log(`🎬 Render ${template} (9:16) → public/videos/`);
  const outName = `short-${slug}.mp4`;
  const timingsFlag = timingsPath ? ` --word-timings "${timingsPath}"` : "";
  sh(
    `node scripts/generate-video.mjs --template ${template} --size 9:16 ` +
    `--duration ${videoDur} --caption "${text.replace(/"/g, '\\"')}" ` +
    `--subtitle "lofibuddha.com" --audio short-${slug} --audiovol 1.0 ` +
    `${timingsFlag} --output ${outName}`
  );

  const finalPath = join(ROOT, "public", "videos", outName);
  console.log(`\n✅ Short: ${finalPath}`);
  console.log(JSON.stringify({ success: true, output: outName, path: finalPath, duration: videoDur, music: musicSlug, title, chime: chimeSec > 0 }));

  if (upload) {
    console.log("\n📤 Upload naar YouTube (private)...");
    // Via de bestaande API-route (die zelf het kanaal bepaalt).
    sh(`node -e "fetch('http://127.0.0.1:3000/api/youtube', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({videoPath:'/videos/${outName}',title:'${title}'})}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d)))"`);
  }
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
