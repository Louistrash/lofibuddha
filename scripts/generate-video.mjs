#!/usr/bin/env node
/**
 * Bodhi Hermes OS — Video Generation Pipeline v2
 * Renders HyperFrames videos from HTML/CSS templates + optional soundscape audio.
 *
 * Usage:
 *   node scripts/generate-video.mjs --size 9:16 --duration 30 --template ocean \
 *     --caption "Soft ocean waves — let go." --audio ocean-waves --output shorts/ocean-loop.mp4
 *
 * Templates: quote-card, zen-lofi, ocean, night, temple, breathe, focus, rain
 * Sizes: 9:16 (shorts/tiktok), 16:9 (youtube), 1:1 (square), 4:5
 * Audio: --audio <slug> mixes data/sounds/audio/<slug>.mp3 (looped) into the video
 */

import { execSync } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public", "videos");
const SOUNDS_DIR = join(ROOT, "data", "sounds", "audio");

// ── Scene templates ──────────────────────────────────────────────────────────

/** Live animated scene (CSS/canvas) — shared look with the site's experience scenes */
function sceneHTML({ width, height, duration, caption, subtitle, backgroundImage, template }) {
  const safeCaption = (caption || "Relax and unwind.").replace(/\\n/g, "\n").replace(/\n/g, "<br>");
  const safeSub = (subtitle || "lofibuddha.com").replace(/"/g, "&quot;");

  // Per-template scene layer
  const sceneFn = SCENES[template] || SCENES["zen-lofi"];
  const scene = sceneFn({ width, height, duration });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px; height: ${height}px;
    overflow: hidden;
    background: #0a0f0e;
    font-family: 'Inter', sans-serif;
  }
  .bg { position: absolute; inset: 0; z-index: 0; overflow: hidden;
    background: linear-gradient(160deg, #0a0f0e 0%, #111a16 30%, #0d1217 70%, #0a0f0e 100%); }
  ${scene.css}

  /* Dark vignette */
  .vignette {
    position: absolute; inset: 0; z-index: 5;
    background: radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.72) 100%);
  }

  /* Caption */
  .caption-wrap {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 10; text-align: center;
    padding: ${Math.round(height * 0.2)}px ${Math.round(width * 0.08)}px ${Math.round(height * 0.07)}px;
    background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, transparent 100%);
  }
  .caption {
    color: #f0ebe0; font-size: ${Math.round(width * 0.048)}px;
    font-weight: 600; letter-spacing: 0.05em; line-height: 1.5;
    text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 4px 20px rgba(0,0,0,0.8), 0 8px 40px rgba(0,0,0,0.5);
    animation: fadeSlideIn 2s ease-out;
    max-width: 90%; margin: 0 auto; white-space: pre-line;
  }
  .subtitle {
    color: #c49464; font-size: ${Math.round(width * 0.024)}px;
    font-weight: 500; margin-top: ${Math.round(height * 0.014)}px;
    letter-spacing: 0.18em; text-transform: uppercase;
    opacity: 0; animation: fadeSlideIn 2s 0.9s ease-out forwards;
    text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.7);
  }
  .brand {
    position: absolute; bottom: 2.6%; left: 50%; transform: translateX(-50%);
    z-index: 11; color: #9a9488; font-size: ${Math.round(width * 0.02)}px;
    font-weight: 500; letter-spacing: 0.18em;
    opacity: 0; animation: fadeSlideIn 2s 1.8s ease-out forwards;
    text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.6);
  }

  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
</head>
<body>
<div data-composition-id="main" data-width="${width}" data-height="${height}" data-duration="${duration}" data-start="0"
     style="width:${width}px;height:${height}px;position:relative;overflow:hidden;">
  <div class="bg">${scene.html}</div>
  <div class="vignette"></div>
  <div class="caption-wrap">
    <div class="caption">${safeCaption}</div>
    <div class="subtitle">${safeSub}</div>
  </div>
  <div class="brand">lofibuddha.com</div>
</div>
<script>
  window.__hf = { duration: ${duration}, seek: function(t) {} };
  ${scene.js || ""}
</script>
</body>
</html>`;
}

// ── Scene definitions (HTML + CSS + JS per scene) ────────────────────────────

const SCENES = {
  "zen-lofi": ({ width, height }) => ({
    css: `
      canvas#rain { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; opacity: 0.35; }
      .glow { position: absolute; top: 32%; left: 50%; transform: translate(-50%, -50%); width: 60%; height: 40%;
        background: radial-gradient(ellipse, rgba(196,148,100,0.08), transparent 70%); z-index: 2;
        animation: breathe 7s cubic-bezier(0.45,0,0.55,1) infinite; }
      @keyframes breathe { 0%,100% { opacity: 0.25; transform: translate(-50%,-50%) scale(1); }
        50% { opacity: 0.55; transform: translate(-50%,-50%) scale(1.03); } }
      .particle { position: absolute; width: 2px; height: 2px; background: rgba(212,180,138,0.5); border-radius: 50%;
        animation: drift 6s ease-in-out infinite; }
      @keyframes drift { 0% { transform: translateY(0) translateX(0); opacity: 0; }
        15% { opacity: 0.6; } 85% { opacity: 0.6; } 100% { transform: translateY(-400px) translateX(15px); opacity: 0; } }
    `,
    html: `
      <canvas id="rain"></canvas>
      <div class="glow"></div>
      <div id="particles"></div>`,
    js: `
      const canvas = document.getElementById('rain');
      const ctx = canvas.getContext('2d');
      canvas.width = ${width}; canvas.height = ${height};
      let seed = 42;
      function seeded() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      const drops = Array.from({length: 90}, () => ({
        x: seeded() * canvas.width, y: seeded() * canvas.height,
        speed: 2 + seeded() * 4, len: 5 + seeded() * 12, opacity: 0.1 + seeded() * 0.3
      }));
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(180,200,220,1)'; ctx.lineWidth = 0.5;
        for (const d of drops) {
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 1, d.y + d.len);
          ctx.globalAlpha = d.opacity; ctx.stroke();
          d.y += d.speed;
          if (d.y > canvas.height) { d.y = -d.len; d.x = seeded() * canvas.width; }
        }
        ctx.globalAlpha = 1;
      }
      setInterval(draw, 33); draw();
      const pc = document.getElementById('particles');
      for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = seeded() * 100 + '%';
        p.style.top = (60 + seeded() * 40) + '%';
        p.style.animationDelay = seeded() * 6 + 's';
        p.style.animationDuration = (4 + seeded() * 8) + 's';
        pc.appendChild(p);
      }`,
  }),

  ocean: ({ width }) => ({
    css: `
      .sun { position: absolute; top: 24%; left: 50%; transform: translateX(-50%);
        width: ${Math.round(width * 0.28)}px; height: ${Math.round(width * 0.28)}px; border-radius: 50%;
        background: radial-gradient(circle, rgba(255,190,120,0.55), rgba(255,170,100,0.18) 55%, transparent 72%);
        filter: blur(2px); z-index: 1; animation: sunPulse 6s ease-in-out infinite; }
      @keyframes sunPulse { 0%,100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
        50% { opacity: 0.85; transform: translateX(-50%) scale(1.04); } }
      .sea { position: absolute; bottom: 0; left: 0; right: 0; height: 45%; z-index: 3;
        background: linear-gradient(180deg, #0e2a33 0%, #0a1e26 60%, #07151c 100%); }
      .wave { position: absolute; bottom: 0; left: -10%; width: 120%; height: 100%; z-index: 4;
        background: repeating-linear-gradient(180deg, rgba(120,190,210,0.12) 0px, rgba(120,190,210,0.12) 3px, transparent 3px, transparent 34px);
        animation: waveShift 9s linear infinite; }
      @keyframes waveShift { from { transform: translateX(0); } to { transform: translateX(60px); } }
      .foam { position: absolute; bottom: 0; left: -10%; width: 120%; height: 46%; z-index: 5;
        background: radial-gradient(ellipse at 50% 100%, rgba(220,240,245,0.16) 0%, transparent 55%);
        animation: foamMove 7s ease-in-out infinite; }
      @keyframes foamMove { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-40px); } }
      .sparkle { position: absolute; width: 3px; height: 3px; border-radius: 50%;
        background: rgba(255,220,170,0.8); box-shadow: 0 0 8px rgba(255,200,140,0.6);
        animation: twinkle 4s ease-in-out infinite; }
      @keyframes twinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.9; } }
    `,
    html: `
      <div class="sun"></div>
      <div class="sea"></div>
      <div class="wave"></div>
      <div class="foam"></div>
      <div class="sparkle" style="top:32%;left:15%;animation-delay:0.4s"></div>
      <div class="sparkle" style="top:37%;left:70%;animation-delay:1.3s"></div>
      <div class="sparkle" style="top:42%;left:38%;animation-delay:2.1s"></div>
      <div class="sparkle" style="top:46%;left:82%;animation-delay:0.9s"></div>`,
  }),

  night: ({ width }) => ({
    css: `
      .moon { position: absolute; top: 14%; right: 16%;
        width: ${Math.round(width * 0.16)}px; height: ${Math.round(width * 0.16)}px; border-radius: 50%;
        background: radial-gradient(circle at 62% 38%, #f8f4e8, #d8cfc0 65%, #b8ae9c);
        box-shadow: 0 0 60px rgba(240,230,200,0.35), 0 0 140px rgba(240,230,200,0.15);
        z-index: 2; animation: moonGlow 7s ease-in-out infinite; }
      @keyframes moonGlow { 0%,100% { box-shadow: 0 0 40px rgba(240,230,200,0.25), 0 0 100px rgba(240,230,200,0.1); }
        50% { box-shadow: 0 0 70px rgba(240,230,200,0.45), 0 0 160px rgba(240,230,200,0.2); } }
      .star { position: absolute; width: 2px; height: 2px; border-radius: 50%;
        background: #f0ead8; animation: twinkle 3.5s ease-in-out infinite; }
      @keyframes twinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
      .hill { position: absolute; bottom: 0; left: 0; right: 0; height: 34%; z-index: 3;
        background: linear-gradient(180deg, #101b16 0%, #0a120e 100%); }
      .hill::before { content: ''; position: absolute; top: -40%; left: -10%; width: 130%; height: 100%;
        background: #0c1512; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
    `,
    html: `
      <div class="moon"></div>
      <div class="star" style="top:8%;left:12%;animation-delay:0.2s"></div>
      <div class="star" style="top:12%;left:48%;animation-delay:1.1s"></div>
      <div class="star" style="top:20%;left:30%;animation-delay:0.6s"></div>
      <div class="star" style="top:28%;left:72%;animation-delay:1.7s"></div>
      <div class="star" style="top:34%;left:55%;animation-delay:0.3s"></div>
      <div class="star" style="top:6%;left:82%;animation-delay:2.2s"></div>
      <div class="star" style="top:18%;left:92%;animation-delay:1.4s"></div>
      <div class="star" style="top:38%;left:20%;animation-delay:0.9s"></div>
      <div class="hill"></div>`,
  }),

  temple: ({ width }) => ({
    css: `
      .bell { position: absolute; top: 16%; left: 50%; transform: translateX(-50%); z-index: 2;
        width: ${Math.round(width * 0.22)}px; height: ${Math.round(width * 0.22)}px;
        border-radius: 50% 50% 42% 42%;
        background: radial-gradient(circle at 50% 30%, #d8b878, #a88048 70%);
        box-shadow: 0 0 50px rgba(216,184,120,0.35), inset 0 -10px 30px rgba(0,0,0,0.35);
        animation: bellSwing 5s ease-in-out infinite; transform-origin: 50% -140%; }
      @keyframes bellSwing { 0%,100% { transform: translateX(-50%) rotate(-4deg); }
        50% { transform: translateX(-50%) rotate(4deg); } }
      .bell-glow { position: absolute; top: 18%; left: 50%; transform: translateX(-50%);
        width: 60%; height: 25%; background: radial-gradient(ellipse, rgba(216,184,120,0.18), transparent 70%);
        z-index: 1; animation: glowPulse 5s ease-in-out infinite; }
      @keyframes glowPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }
      .pillar { position: absolute; bottom: 0; width: ${Math.round(width * 0.09)}px; height: 46%;
        background: linear-gradient(180deg, #6b5a3a, #4a3d26); z-index: 3; }
      .roof { position: absolute; bottom: 46%; left: 0; right: 0; height: 7%;
        background: linear-gradient(180deg, #3a2f1c, #2a2114); z-index: 4;
        clip-path: polygon(4% 0, 96% 0, 100% 100%, 0 100%); }
      .ember { position: absolute; width: 3px; height: 3px; border-radius: 50%;
        background: rgba(255,190,120,0.9); box-shadow: 0 0 10px rgba(255,170,90,0.7);
        animation: emberRise 6s linear infinite; }
      @keyframes emberRise { 0% { transform: translateY(0); opacity: 0; }
        12% { opacity: 0.9; } 100% { transform: translateY(-600px) translateX(20px); opacity: 0; } }
    `,
    html: `
      <div class="bell-glow"></div>
      <div class="bell"></div>
      <div class="pillar" style="left:12%"></div>
      <div class="pillar" style="right:12%"></div>
      <div class="roof"></div>
      <div class="ember" style="left:22%;bottom:40%;animation-delay:0.3s"></div>
      <div class="ember" style="left:48%;bottom:36%;animation-delay:1.6s"></div>
      <div class="ember" style="left:70%;bottom:42%;animation-delay:2.8s"></div>
      <div class="ember" style="left:60%;bottom:30%;animation-delay:4.1s"></div>
      <div class="ember" style="left:35%;bottom:46%;animation-delay:5.2s"></div>`,
  }),

  breathe: ({ width }) => ({
    css: `
      .b-circle { position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%);
        width: ${Math.round(width * 0.36)}px; height: ${Math.round(width * 0.36)}px; border-radius: 50%;
        background: radial-gradient(circle, rgba(45,212,191,0.12), rgba(45,212,191,0.04) 60%, transparent 72%);
        border: 2px solid rgba(45,212,191,0.35);
        box-shadow: 0 0 70px rgba(45,212,191,0.18), inset 0 0 50px rgba(45,212,191,0.08);
        z-index: 2; animation: inhale 8s cubic-bezier(0.45,0,0.55,1) infinite; }
      @keyframes inhale {
        0% { transform: translate(-50%, -50%) scale(0.55); }
        25% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1); }
        62% { transform: translate(-50%, -50%) scale(0.55); }
        100% { transform: translate(-50%, -50%) scale(0.55); } }
      .b-ring { position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%);
        width: ${Math.round(width * 0.5)}px; height: ${Math.round(width * 0.5)}px; border-radius: 50%;
        border: 1px solid rgba(45,212,191,0.15); z-index: 1;
        animation: ringPulse 8s cubic-bezier(0.45,0,0.55,1) infinite; }
      @keyframes ringPulse { 0% { transform: translate(-50%,-50%) scale(0.7); opacity: 0.5; }
        25% { transform: translate(-50%,-50%) scale(1.05); opacity: 0.9; }
        50% { transform: translate(-50%,-50%) scale(1.05); opacity: 0.9; }
        62% { transform: translate(-50%,-50%) scale(0.7); opacity: 0.5; }
        100% { transform: translate(-50%,-50%) scale(0.7); opacity: 0.5; } }
      .b-dust { position: absolute; width: 3px; height: 3px; border-radius: 50%;
        background: rgba(45,212,191,0.7); box-shadow: 0 0 8px rgba(45,212,191,0.5);
        animation: dustDrift 5s ease-in-out infinite; }
      @keyframes dustDrift { 0%,100% { transform: translateY(0) translateX(0); opacity: 0.2; }
        50% { transform: translateY(-30px) translateX(12px); opacity: 0.8; } }
    `,
    html: `
      <div class="b-ring"></div>
      <div class="b-circle"></div>
      <div class="b-dust" style="top:26%;left:30%;animation-delay:0.5s"></div>
      <div class="b-dust" style="top:50%;left:22%;animation-delay:1.4s"></div>
      <div class="b-dust" style="top:56%;left:70%;animation-delay:2.2s"></div>
      <div class="b-dust" style="top:30%;left:74%;animation-delay:3.1s"></div>
      <div class="b-dust" style="top:44%;left:50%;animation-delay:4s"></div>`,
  }),

  focus: ({ width }) => ({
    css: `
      .f-ring { position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%);
        width: ${Math.round(width * 0.42)}px; height: ${Math.round(width * 0.42)}px; border-radius: 50%;
        border: 2px solid rgba(232,163,61,0.4); z-index: 2;
        box-shadow: 0 0 60px rgba(232,163,61,0.2);
        animation: ringSpin 12s linear infinite; }
      @keyframes ringSpin { from { transform: translate(-50%,-50%) rotate(0deg); }
        to { transform: translate(-50%,-50%) rotate(360deg); } }
      .f-ring::before { content: ''; position: absolute; top: -3px; left: 50%; transform: translateX(-50%);
        width: 8px; height: 8px; border-radius: 50%; background: #E8A33D;
        box-shadow: 0 0 14px rgba(232,163,61,0.9); }
      .f-core { position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%);
        width: ${Math.round(width * 0.14)}px; height: ${Math.round(width * 0.14)}px; border-radius: 50%;
        background: radial-gradient(circle, rgba(232,163,61,0.25), transparent 70%);
        z-index: 1; animation: corePulse 3s ease-in-out infinite; }
      @keyframes corePulse { 0%,100% { opacity: 0.4; transform: translate(-50%,-50%) scale(0.9); }
        50% { opacity: 0.9; transform: translate(-50%,-50%) scale(1.1); } }
      .f-ray { position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%);
        width: 2px; height: ${Math.round(width * 0.22)}px; background: linear-gradient(180deg, rgba(232,163,61,0.7), transparent);
        transform-origin: 50% 100%; z-index: 1; animation: raySpin 12s linear infinite reverse; }
      @keyframes raySpin { from { transform: translate(-50%,-50%) rotate(0deg); }
        to { transform: translate(-50%,-50%) rotate(360deg); } }
    `,
    html: `
      <div class="f-ring"></div>
      <div class="f-core"></div>
      <div class="f-ray"></div>`,
  }),
};

// ── Quote Card Template (unchanged, still available) ─────────────────────────

function quoteCardHTML({ width, height, duration, caption, subtitle, backgroundImage }) {
  const safeCaption = caption.replace(/\\n/g, "\n").replace(/\n/g, "<br>");
  const safeSub = (subtitle || "Mindfulness & Relaxation").replace(/"/g, "&quot;");
  const bgStyle = backgroundImage
    ? `background: url('${backgroundImage}') center/cover no-repeat;`
    : `background: linear-gradient(160deg, #0a0f0e 0%, #111a16 30%, #0d1217 70%, #0a0f0e 100%);`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${width}px; height: ${height}px; overflow: hidden; ${bgStyle} font-family: 'Inter', sans-serif; }
  .overlay { position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%); }
  .accent-dot { position: absolute; z-index: 2; width: 6px; height: 6px; border-radius: 50%; background: rgba(196,148,100,0.4); box-shadow: 0 0 12px rgba(196,148,100,0.3); }
  .quote-mark { position: absolute; top: 15%; left: 50%; transform: translateX(-50%); font-size: 120px; color: rgba(196,148,100,0.08); font-family: 'Inter', serif; line-height: 1; z-index: 2; animation: fadeInDown 2s ease-out; }
  .quote-wrap { position: absolute; top: 42%; left: 50%; transform: translate(-50%, -50%); z-index: 3; text-align: center; width: 85%; max-width: 85%; }
  .quote { color: #f0ebe0; font-size: ${Math.round(width * 0.055)}px; font-weight: 600; line-height: 1.55; letter-spacing: 0.03em;
    text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 4px 16px rgba(0,0,0,0.8), 0 8px 32px rgba(0,0,0,0.5);
    animation: fadeSlideUp 2.5s 0.3s ease-out both; white-space: pre-line; }
  .attribution { color: #c49464; font-size: ${Math.round(width * 0.035)}px; font-weight: 500; margin-top: ${Math.round(height * 0.025)}px;
    letter-spacing: 0.08em; opacity: 0; animation: fadeSlideUp 2s 1.5s ease-out forwards; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
  .bottom-line { position: absolute; bottom: 22%; left: 50%; transform: translateX(-50%); width: 80px; height: 1px; z-index: 3;
    background: linear-gradient(90deg, transparent, rgba(196,148,100,0.5), transparent); opacity: 0; animation: fadeSlideUp 2s 1.8s ease-out forwards; }
  .brand { position: absolute; bottom: 8%; left: 50%; transform: translateX(-50%); z-index: 4; color: rgba(200,180,150,0.5);
    font-size: ${Math.round(width * 0.024)}px; font-weight: 500; letter-spacing: 0.2em; opacity: 0; animation: fadeSlideUp 2s 2.2s ease-out forwards; text-shadow: 0 1px 3px rgba(0,0,0,0.7); }
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeInDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
</style>
</head>
<body>
<div data-composition-id="main" data-width="${width}" data-height="${height}" data-duration="${duration}" data-start="0"
     style="width:${width}px;height:${height}px;position:relative;overflow:hidden;">
  <div class="overlay"></div>
  <div class="accent-dot" style="top:12%;left:18%;"></div>
  <div class="accent-dot" style="top:10%;right:22%;"></div>
  <div class="accent-dot" style="bottom:30%;left:25%;"></div>
  <div class="accent-dot" style="bottom:28%;right:20%;"></div>
  <div class="quote-mark">"</div>
  <div class="quote-wrap">
    <div class="quote">${safeCaption}</div>
    <div class="attribution">— Buddha</div>
  </div>
  <div class="bottom-line"></div>
  <div class="brand">lofibuddha.com</div>
</div>
<script>
  window.__hf = { duration: ${duration}, seek: function(t) {} };
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
  const template = args.template || "zen-lofi";
  const bgImage = args.background || args.bg || "";
  const audioSlug = args.audio || "";
  const audioVol = parseFloat(args.audiovol) || 0.85;

  let resolvedBg = bgImage;
  if (bgImage && bgImage.startsWith("/images/")) {
    resolvedBg = join(ROOT, "public", bgImage.replace(/^\//, ""));
  }

  mkdirSync(dirname(outputPath), { recursive: true });

  const tmpProject = join(PUBLIC, `.tmp-project-${process.pid}`);
  if (existsSync(tmpProject)) rmSync(tmpProject, { recursive: true });
  mkdirSync(tmpProject, { recursive: true });

  let bgPath = "";
  if (resolvedBg && existsSync(resolvedBg)) {
    const ext = resolvedBg.split(".").pop();
    const destName = `bg.${ext}`;
    copyFileSync(resolvedBg, join(tmpProject, destName));
    bgPath = destName;
  }

  // Template: quote-card of scene template
  const html = template === "quote-card"
    ? quoteCardHTML({ width, height, duration, caption, subtitle, backgroundImage: bgPath })
    : sceneHTML({ width, height, duration, caption, subtitle, backgroundImage: bgPath, template });
  writeFileSync(join(tmpProject, "index.html"), html);

  console.log(`[Bodhi] Rendering: ${width}x${height} | ${duration}s | template:${template} → ${outputName}`);
  if (bgPath) console.log(`[Bodhi] Background: ${bgPath}`);
  if (audioSlug) console.log(`[Bodhi] Audio: ${audioSlug}.mp3 (vol ${audioVol})`);

  const renderCmd =
    `/usr/bin/npx --yes hyperframes render "${tmpProject}" -o "${outputPath}" -f 30 --format mp4 --quality standard`;

  try {
    execSync(renderCmd, { cwd: ROOT, stdio: "inherit", timeout: 300_000 });

    // Optional: mix soundscape audio (loop to video duration)
    if (audioSlug) {
      const audioPath = join(SOUNDS_DIR, `${audioSlug}.mp3`);
      if (!existsSync(audioPath)) {
        console.error(`[Bodhi] ⚠️ Soundscape niet gevonden: ${audioSlug}.mp3 — video zonder audio`);
      } else {
        const mixedPath = outputPath.replace(/\.mp4$/, "-audio.mp4");
        const mixCmd =
          `ffmpeg -y -v error -i "${outputPath}" -i "${audioPath}" ` +
          `-filter_complex "[1:a]volume=${audioVol},aloop=loop=-1:size=2e9,atrim=duration=${duration}[a]" ` +
          `-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 128k -t ${duration} "${mixedPath}"`;
        execSync(mixCmd, { cwd: ROOT, stdio: "inherit", timeout: 120_000 });
        rmSync(outputPath);
        copyFileSync(mixedPath, outputPath);
        rmSync(mixedPath);
        console.log(`[Bodhi] 🎵 Audio gemixed (${audioSlug}) → ${outputName}`);
      }
    }

    console.log(`[Bodhi] ✅ Video: ${outputPath}`);
    rmSync(tmpProject, { recursive: true });
    return { success: true, output: outputName, path: outputPath, width, height, duration, template, audio: audioSlug || null };
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
