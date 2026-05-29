#!/usr/bin/env node
/**
 * Bodhi Hermes OS — YouTube Thumbnail Generator
 * Renders 1280×720 thumbnails via HyperFrames, extracts frame as PNG.
 *
 * Usage:
 *   node scripts/generate-thumbnail.mjs --title "..." --subtitle "..." --background "..." --output "..."
 */
import { execSync } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const THUMBS = join(PUBLIC, "thumbnails");
mkdirSync(THUMBS, { recursive: true });

// ── Args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : "";
}
const title = getArg("--title") || "LofiBuddha";
const subtitle = getArg("--subtitle") || "Mindfulness & Relaxation";
const backgroundImage = getArg("--background") || "";
const fileName = getArg("--output") || "thumbnail";

// Resolve background path
let bgAbs = "";
if (backgroundImage) {
  bgAbs = backgroundImage.startsWith("/")
    ? join(ROOT, backgroundImage)
    : join(ROOT, "public/images/generated", backgroundImage);
  if (!existsSync(bgAbs)) bgAbs = backgroundImage;
}

// ── Thumbnail HTML Template ───────────────────────────────────────────────

function thumbnailHTML({ title, subtitle, bgPath }) {
  const safeTitle = title.replace(/"/g, "&quot;");
  const safeSub = subtitle.replace(/"/g, "&quot;");

  const bgStyle = bgPath
    ? `background: url('file://${bgPath}') center/cover no-repeat;`
    : `background: linear-gradient(135deg, #0d1f1a 0%, #1a0f0a 50%, #0a1514 100%);`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1280px; height: 720px;
    overflow: hidden;
    ${bgStyle}
    font-family: 'Georgia', 'Times New Roman', serif;
  }

  /* Dark overlay */
  .overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(
      180deg,
      rgba(0,0,0,0.15) 0%,
      rgba(0,0,0,0.45) 50%,
      rgba(0,0,0,0.75) 100%
    );
  }

  /* Gold accent line */
  .accent-line {
    position: absolute; top: 65%; left: 50%; transform: translateX(-50%);
    width: 120px; height: 3px; z-index: 2;
    background: linear-gradient(90deg, transparent, #c49464, transparent);
    border-radius: 2px;
  }

  /* Bodhi icon / emoji */
  .emoji-accent {
    position: absolute; top: 42%; left: 50%; transform: translate(-50%, -50%);
    font-size: 64px; z-index: 2;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));
  }

  /* Title */
  .title-wrap {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    z-index: 3; text-align: center; width: 90%;
    margin-top: 20px;
  }
  .title {
    color: #f0ebe0;
    font-size: 52px; font-weight: 700;
    letter-spacing: 0.04em; line-height: 1.2;
    text-shadow:
      0 2px 4px rgba(0,0,0,0.95),
      0 4px 16px rgba(0,0,0,0.8),
      0 8px 32px rgba(0,0,0,0.6);
    max-width: 100%;
  }

  /* Subtitle */
  .subtitle {
    color: #c4b89a;
    font-size: 22px; font-weight: 500;
    margin-top: 16px;
    letter-spacing: 0.12em; text-transform: uppercase;
    text-shadow:
      0 1px 3px rgba(0,0,0,0.9),
      0 2px 12px rgba(0,0,0,0.6);
  }

  /* Brand bottom-right */
  .brand {
    position: absolute; bottom: 4%; right: 5%; z-index: 4;
    color: rgba(200,180,150,0.7);
    font-size: 16px; font-weight: 500;
    letter-spacing: 0.15em;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  }

  /* Corner decorative element */
  .corner-tl, .corner-br {
    position: absolute; z-index: 3;
    width: 60px; height: 60px;
    border-color: rgba(196,148,100,0.25);
    border-style: solid;
  }
  .corner-tl { top: 5%; left: 5%; border-width: 2px 0 0 2px; }
  .corner-br { bottom: 5%; right: 5%; border-width: 0 2px 2px 0; }

  /* Category badge */
  .badge {
    position: absolute; top: 8%; left: 50%; transform: translateX(-50%); z-index: 3;
    color: #c49464; font-size: 13px; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    padding: 6px 20px;
    border: 1px solid rgba(196,148,100,0.3);
    border-radius: 20px;
    background: rgba(0,0,0,0.4);
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  }
</style>
</head>
<body>
<div data-composition-id="main" data-width="1280" data-height="720" data-duration="2" data-start="0"
     style="width:1280px;height:720px;position:relative;overflow:hidden;">
  <div class="overlay"></div>
  <div class="corner-tl"></div>
  <div class="corner-br"></div>
  <div class="accent-line"></div>
  <div class="emoji-accent">🧘</div>
  <div class="badge">YOGA &amp; MINDFULNESS</div>
  <div class="title-wrap">
    <div class="title">${safeTitle}</div>
    <div class="subtitle">${safeSub}</div>
  </div>
  <div class="brand">lofibuddha.com</div>
</div>
</body>
</html>`;
}

// ── Render ────────────────────────────────────────────────────────────────

const html = thumbnailHTML({ title, subtitle, bgPath: bgAbs });

// Create tmp project
const tmpName = `thumb-${fileName.replace(/[^a-zA-Z0-9_-]/g, "")}-${Date.now()}`;
const tmpDir = join(ROOT, "public", "videos", ".tmp");
mkdirSync(tmpDir, { recursive: true });
const projDir = join(tmpDir, tmpName);
mkdirSync(projDir, { recursive: true });

const htmlPath = join(projDir, "index.html");
writeFileSync(htmlPath, html);

// Also copy background to tmp dir
if (bgAbs && existsSync(bgAbs)) {
  execSync(`cp "${bgAbs}" "${projDir}/bg.png"`, { stdio: "pipe" });
}

try {
  // Render 2 seconds at 1 fps (2 frames total, very fast)
  const tmpOutput = join(tmpDir, `${tmpName}.mp4`);
  execSync(
    `npx hyperframes render "${projDir}" -o "${tmpOutput}" -f 1 --format mp4 --quality standard --width 1280 --height 720`,
    { cwd: ROOT, timeout: 120_000, stdio: "pipe" }
  );

  // Extract first frame as PNG
  const pngPath = join(THUMBS, `${fileName}.png`);
  execSync(
    `ffmpeg -y -i "${tmpOutput}" -vframes 1 -q:v 2 "${pngPath}"`,
    { timeout: 30_000, stdio: "pipe" }
  );

  // Cleanup
  rmSync(projDir, { recursive: true, force: true });
  try { rmSync(tmpOutput, { force: true }); } catch {}

  console.log(JSON.stringify({
    success: true,
    output: `thumbnails/${fileName}.png`,
    path: pngPath
  }));
} catch (err) {
  console.log(JSON.stringify({
    success: false,
    error: err.message || "Unknown error"
  }));
  process.exit(1);
}
