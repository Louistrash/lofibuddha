#!/usr/bin/env node
/**
 * Build branded PDFs from the drip-content markdown guides.
 *
 * Run: node scripts/build-pdfs.mjs [slug ...]   # default: all six
 *
 * Converts data/drip-content/*.md to a dark "Mindfulness OS"-style PDF via
 * headless Chromium, and writes data/drip-content/pdf/<slug>.pdf.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DIR = join(ROOT, "data", "drip-content");
const OUT_DIR = join(SRC_DIR, "pdf");
mkdirSync(OUT_DIR, { recursive: true });

// --- palette (keep in sync with packages/shared/src/design-tokens.ts) ---
const C = {
  bg: "#08070C",
  surface: "#101019",
  ink: "#F6F2EA",
  muted: "#9A94A6",
  gold: "#E4B872",
  goldDeep: "#B89258",
  saffron: "#F5A24C",
  line: "rgba(230,225,215,0.10)",
};

const MANDALA = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke="${C.gold}" stroke-opacity="0.5">
    <circle cx="50" cy="50" r="46" stroke-width="0.6"/>
    <circle cx="50" cy="50" r="36" stroke-width="0.5"/>
    <circle cx="50" cy="50" r="26" stroke-width="0.5"/>
    <circle cx="50" cy="50" r="16" stroke-width="0.5"/>
    <circle cx="50" cy="50" r="7" stroke-width="0.5"/>
  </g>
  <g stroke="${C.gold}" stroke-opacity="0.55" stroke-width="0.5">
    ${Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const x1 = 50 + Math.cos(a) * 16, y1 = 50 + Math.sin(a) * 16;
      const x2 = 50 + Math.cos(a) * 46, y2 = 50 + Math.sin(a) * 46;
      return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
    }).join("")}
  </g>
  <circle cx="50" cy="50" r="3" fill="${C.gold}"/>
</svg>`;

// --- minimal markdown → HTML (enough for the guides: #, ##, ###, **, -, ---) ---
function mdToHtml(md) {
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (t) => esc(t).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  const lines = md.split(/\r?\n/);
  let html = "";
  let listOpen = false;

  const closeList = () => { if (listOpen) { html += "</ul>"; listOpen = false; } };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) { closeList(); html += `<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`; }
    else if (/^##\s+/.test(line)) { closeList(); html += `<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`; }
    else if (/^#\s+/.test(line)) { closeList(); html += `<h1>${inline(line.replace(/^#\s+/, ""))}</h1>`; }
    else if (/^---+$/.test(line.trim())) { closeList(); html += `<hr/>`; }
    else if (/^[-*]\s+/.test(line.trim())) {
      if (!listOpen) { html += "<ul>"; listOpen = true; }
      html += `<li>${inline(line.trim().replace(/^[-*]\s+/, ""))}</li>`;
    }
    else if (line.trim() === "") { closeList(); }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return html;
}

function renderPdf(slug, html) {
  const htmlPath = join(OUT_DIR, `.${slug}.html`);
  const pdfPath = join(OUT_DIR, `${slug}.pdf`);
  writeFileSync(htmlPath, html, "utf-8");
  execFileSync("chromium", [
    "--headless", "--disable-gpu", "--no-sandbox",
    "--no-pdf-header-footer",
    "--virtual-time-budget=6000",
    `--print-to-pdf=${pdfPath}`,
    htmlPath,
  ], { stdio: "ignore" });
  execFileSync("rm", ["-f", htmlPath]);
  return pdfPath;
}

function buildPdf(slug) {
  const srcPath = join(SRC_DIR, `${slug}.md`);
  if (!existsSync(srcPath)) { console.log(`⚠️  ${slug}.md niet gevonden`); return null; }
  const md = readFileSync(srcPath, "utf-8");

  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : slug;
  const subtitle = "LofiBuddha — a guide for your practice";

  const body = mdToHtml(md.replace(/^#\s+.*$/m, "").replace(/^\n+/, ""));

  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;800&display=swap');
  @page { margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Manrope', -apple-system, sans-serif; background: ${C.bg}; color: ${C.ink}; }
  .cover { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at 50% 42%, #15131f 0%, ${C.bg} 70%); }
  .cover .brand { letter-spacing: 0.32em; text-transform: uppercase; font-size: 11px; color: ${C.muted}; }
  .cover svg { width: 180px; height: 180px; margin: 28px 0; }
  .cover h1 { font-size: 34px; font-weight: 800; margin: 0 40px; color: ${C.ink}; }
  .cover .sub { font-size: 13px; color: ${C.muted}; margin-top: 14px; }
  .cover .rule { width: 44px; height: 2px; background: ${C.gold}; margin-top: 26px; border-radius: 2px; }
  .content { padding: 60px 64px 80px; }
  h1, h2, h3 { color: ${C.gold}; font-weight: 800; line-height: 1.25; }
  h2 { font-size: 22px; margin: 34px 0 14px; padding-bottom: 10px; border-bottom: 1px solid ${C.line}; }
  h3 { font-size: 16px; margin: 24px 0 8px; color: ${C.saffron}; }
  p { font-size: 12.5px; line-height: 1.7; color: ${C.ink}; margin: 10px 0; }
  strong { color: ${C.gold}; font-weight: 600; }
  ul { margin: 10px 0; padding-left: 20px; }
  li { font-size: 12.5px; line-height: 1.7; color: ${C.ink}; margin: 5px 0; }
  li::marker { color: ${C.gold}; }
  hr { border: none; height: 1px; background: ${C.line}; margin: 28px 0; }
</style></head><body>
  <div class="cover">
    <div class="brand">LofiBuddha</div>
    ${MANDALA}
    <h1>${title}</h1>
    <div class="sub">${subtitle}</div>
    <div class="rule"></div>
  </div>
  <div class="content">${body}</div>
</body></html>`;

  return renderPdf(slug, html);
}

const slugs = process.argv.slice(2);
const targets = slugs.length
  ? slugs
  : readdirSync(SRC_DIR).filter((f) => f.endsWith(".md")).map((f) => basename(f, ".md"));

for (const slug of targets) {
  try {
    const out = buildPdf(slug);
    if (out) console.log(`✅ ${slug}.pdf`);
  } catch (e) {
    console.error(`❌ ${slug}: ${e.message}`);
  }
}
console.log("Klaar.");
