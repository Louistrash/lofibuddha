#!/usr/bin/env node
/**
 * Test: "spitting"-stem oplossen. De per-zin multilingual_v2 + stability 0.1
 * leest ritmisch/staccato. Test: hogere stability + eleven_v3 single-take.
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

const SEGS = [
  "Whenever you are ready, let yourself come to rest, and feel your body sink, softly, into the bed beneath you. You have done enough today, and now there is nothing left to do, except to let go.",
  "Close your eyes, gently, and for a few quiet moments, allow the whole day to simply fall away, like soft rain settling into the earth, one drop at a time.",
  "Feel your breath, moving slowly in, and slowly out, with no effort at all. The body knows how to breathe, and it does not need you to steer it, not anymore.",
];

async function tts(text, opts, outPath) {
  const payload = {
    text,
    model_id: opts.model || "eleven_v3",
    voice_settings: { stability: opts.stability ?? 0.1, similarity_boost: 0.7, style: 0.2, use_speaker_boost: false },
  };
  if (opts.previousText) payload.previous_text = opts.previousText;
  if (opts.nextText) payload.next_text = opts.nextText;
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

// Variant A: multilingual_v2 per-zin, hogere stability 0.4
{
  const parts = [];
  const tmp = "/tmp/spit-a-raw.mp3";
  for (let i = 0; i < SEGS.length; i++) {
    const seg = `/tmp/spit-a-seg-${i}.mp3`;
    await tts(SEGS[i], { model: "eleven_multilingual_v2", stability: 0.4, previousText: i > 0 ? SEGS[i - 1] : undefined, nextText: i < SEGS.length - 1 ? SEGS[i + 1] : undefined }, seg);
    parts.push(seg);
  }
  // concat
  const list = "/tmp/spit-a-list.txt";
  writeFileSync(list, parts.map((p) => `file '${p}'`).join("\n") + "\n");
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", tmp]);
  normalize(tmp, "/tmp/spit-a.mp3");
  execFileSync("rm", ["-f", ...parts, list, tmp]);
  console.log("✅ A: multilingual_v2 stability 0.4 → /tmp/spit-a.mp3");
}

// Variant B: eleven_v3 single-take, stability 0.1 (het model dat eerder goed klonk)
{
  const text = SEGS.join(" ");
  const raw = "/tmp/spit-b-raw.mp3";
  await tts(text, { model: "eleven_v3", stability: 0.1 }, raw);
  normalize(raw, "/tmp/spit-b.mp3");
  execFileSync("rm", ["-f", raw]);
  console.log("✅ B: eleven_v3 single-take stability 0.1 → /tmp/spit-b.mp3");
}

// Variant C: eleven_v3 single-take, stability 0.25
{
  const text = SEGS.join(" ");
  const raw = "/tmp/spit-c-raw.mp3";
  await tts(text, { model: "eleven_v3", stability: 0.25 }, raw);
  normalize(raw, "/tmp/spit-c.mp3");
  execFileSync("rm", ["-f", raw]);
  console.log("✅ C: eleven_v3 single-take stability 0.25 → /tmp/spit-c.mp3");
}

console.log("KLAAR");
