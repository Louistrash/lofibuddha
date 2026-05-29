#!/usr/bin/env node
/**
 * Bodhi Hermes OS — Video Generation Pipeline
 * Renders HyperFrames videos from HTML/CSS templates.
 *
 * Usage:
 *   node scripts/generate-video.mjs --size 9:16 --duration 30 --caption "..." --output shorts/video.mp4
 */

import { execSync } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public", "videos");

// ── Zen Lofi Template ──────────────────────────────────────────────────────

function zenLofiHTML({ width, height, duration, caption, subtitle, backgroundImage }) {
  // Handle both literal \n and actual newlines in caption
  const safeCaption = caption
    .replace(/\\n/g, "\n")   // literal \n → real newline
    .replace(/\n/g, "<br>"); // real newline → <br>

  const bgStyle = backgroundImage
    ? `background: url('${backgroundImage}') center/cover no-repeat;`
    : `background: #0f0f0f;`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px; height: ${height}px;
    overflow: hidden;
    ${bgStyle}
    font-family: 'Georgia', 'Times New Roman', serif;
  }
  /* Background image layer */
  .bg-layer {
    position: absolute; inset: 0; z-index: 0;
    ${backgroundImage ? `
    background: url('${backgroundImage}') center/cover no-repeat;
    filter: brightness(0.25) saturate(0.5);
    ` : "display: none;"}
  }
  /* Rain canvas */
  canvas#rain { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; opacity: 0.3; }
  /* Vignette */
  .vignette {
    position: absolute; inset: 0; z-index: 2;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%);
  }
  /* Warm glow — smooth breathing */
  .glow {
    position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%);
    width: 60%; height: 40%;
    background: radial-gradient(ellipse, rgba(196,148,100,0.08), transparent 70%);
    z-index: 3;
    animation: breathe 7s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }
  @keyframes breathe {
    0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.55; transform: translate(-50%, -50%) scale(1.03); }
  }
  /* Particles */
  .particles { position: absolute; inset: 0; z-index: 4; }
  .particle {
    position: absolute; width: 2px; height: 2px;
    background: rgba(212,180,138,0.5); border-radius: 50%;
    animation: drift 6s ease-in-out infinite;
  }
  @keyframes drift {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    15% { opacity: 0.6; }
    85% { opacity: 0.6; }
    100% { transform: translateY(-400px) translateX(15px); opacity: 0; }
  }
  /* Caption wrapper with dark backdrop */
  .caption-wrap {
    position: absolute; bottom: 0; left: 0; right: 0;
    z-index: 10; text-align: center;
    padding: ${Math.round(height * 0.18)}px ${Math.round(width * 0.08)}px ${Math.round(height * 0.06)}px;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, transparent 100%);
  }
  .caption {
    color: #f0ebe0; font-size: ${Math.round(width * 0.045)}px;
    font-weight: 600; letter-spacing: 0.06em; line-height: 1.5;
    text-shadow:
      0 2px 4px rgba(0,0,0,0.95),
      0 4px 20px rgba(0,0,0,0.8),
      0 8px 40px rgba(0,0,0,0.5);
    animation: fadeSlideIn 2s ease-out;
    max-width: 90%; margin: 0 auto;
    white-space: pre-line;
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  /* Subtitle */
  .subtitle {
    color: #c4b89a; font-size: ${Math.round(width * 0.026)}px;
    font-weight: 500;
    margin-top: ${Math.round(height * 0.012)}px;
    letter-spacing: 0.15em; text-transform: uppercase;
    opacity: 0; animation: fadeSlideIn 2s 1s ease-out forwards;
    text-shadow:
      0 1px 3px rgba(0,0,0,0.9),
      0 2px 12px rgba(0,0,0,0.7);
  }
  /* Brand */
  .brand {
    position: absolute; bottom: 3%; left: 50%; transform: translateX(-50%);
    z-index: 11; color: #9a9488; font-size: ${Math.round(width * 0.022)}px;
    font-weight: 500;
    letter-spacing: 0.18em;
    opacity: 0; animation: fadeSlideIn 2s 2s ease-out forwards;
    text-shadow:
      0 1px 3px rgba(0,0,0,0.9),
      0 2px 10px rgba(0,0,0,0.6);
  }
</style>
</head>
<body data-width="${width}" data-height="${height}">
  ${backgroundImage ? '<div class="bg-layer"></div>' : ""}
  <canvas id="rain"></canvas>
  <div class="vignette"></div>
  <div class="glow"></div>
  <div class="particles" id="particles"></div>
  <div class="caption-wrap">
    <div class="caption">${safeCaption}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="brand">lofibuddha.com</div>

  <script>
    window.__hf = { duration: ${duration}, seek: function(t) {} };
    const canvas = document.getElementById('rain');
    const ctx = canvas.getContext('2d');
    canvas.width = ${width}; canvas.height = ${height};
    const drops = Array.from({length: 100}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 2 + Math.random() * 4,
      len: 5 + Math.random() * 12,
      opacity: 0.1 + Math.random() * 0.3
    }));
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(180,200,220,1)';
      ctx.lineWidth = 0.5;
      for (const d of drops) {
        ctx.beginPath(); ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.globalAlpha = d.opacity; ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();

    const pc = document.getElementById('particles');
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = (60 + Math.random() * 40) + '%';
      p.style.animationDelay = Math.random() * 6 + 's';
      p.style.animationDuration = (4 + Math.random() * 8) + 's';
      pc.appendChild(p);
    }
  </script>
</body>
</html>`;
}

// ── Size parser ─────────────────────────────────────────────────────────────

function parseSize(size) {
  const map = {
    "9:16": [1080, 1920], shorts: [1080, 1920], tiktok: [1080, 1920],
    "16:9": [1920, 1080], youtube: [1920, 1080],
    "1:1": [1080, 1080], square: [1080, 1080],
    "4:5": [1080, 1350],
  };
  return map[size] || map["9:16"];
}

// ── Render ──────────────────────────────────────────────────────────────────

async function generate(args) {
  const sizeStr = args.size || "9:16";
  const [width, height] = parseSize(sizeStr);
  const duration = parseInt(args.duration) || 30;
  const caption = args.caption || "Relax and unwind.";
  const subtitle = args.subtitle || "Mindfulness & Relaxation";
  const outputName = args.output || `video-${sizeStr.replace(":", "x")}-${Date.now()}.mp4`;
  const outputPath = resolve(join(PUBLIC, outputName));
  const bgImage = args.background || args.bg || "";
  // Resolve background image path (URL → local filesystem)
  let resolvedBg = bgImage;
  if (bgImage && bgImage.startsWith("/images/")) {
    resolvedBg = join(ROOT, "public", bgImage.replace(/^\//, ""));
  }

  mkdirSync(dirname(outputPath), { recursive: true });

  // Temp project dir for HyperFrames (unique per process to avoid race conditions)
  const tmpProject = join(PUBLIC, `.tmp-project-${process.pid}`);
  if (existsSync(tmpProject)) rmSync(tmpProject, { recursive: true });
  mkdirSync(tmpProject, { recursive: true });

  // Copy background image into temp project if provided
  let bgPath = "";
  if (resolvedBg && existsSync(resolvedBg)) {
    const ext = resolvedBg.split(".").pop();
    const destName = `bg.${ext}`;
    copyFileSync(resolvedBg, join(tmpProject, destName));
    bgPath = destName;
  }

  // Write index.html
  const html = zenLofiHTML({ width, height, duration, caption, subtitle, backgroundImage: bgPath });
  writeFileSync(join(tmpProject, "index.html"), html);

  console.log(`[Bodhi] Rendering: ${width}x${height} | ${duration}s → ${outputName}`);
  if (bgPath) console.log(`[Bodhi] Background: ${bgPath} (from ${resolvedBg})`);

  try {
    execSync(
      `npx hyperframes render "${tmpProject}" -o "${outputPath}" -f 30 --format mp4 --quality standard`,
      { cwd: ROOT, stdio: "inherit", timeout: 300_000 }
    );
    console.log(`[Bodhi] ✅ Video: ${outputPath}`);
    rmSync(tmpProject, { recursive: true });
    return { success: true, output: outputName, path: outputPath, width, height, duration };
  } catch (err) {
    console.error(`[Bodhi] ❌ Render failed:`, err.message);
    rmSync(tmpProject, { recursive: true });
    return { success: false, error: err.message };
  }
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("--")) {
      const key = process.argv[i].slice(2);
      args[key] = process.argv[i + 1] || "true";
      i++;
    }
  }
  return args;
}

const args = parseArgs();
const result = await generate(args);
console.log(JSON.stringify(result));
