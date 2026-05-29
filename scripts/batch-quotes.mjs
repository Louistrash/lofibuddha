#!/usr/bin/env node
/**
 * Batch quote card generator — renders quote-card template for TikTok quote posts
 * Usage: node scripts/batch-quotes.mjs [--limit N]
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CALENDAR = join(ROOT, "public/data/calendar.json");
const VIDEOS = join(ROOT, "public/videos");

const cal = JSON.parse(readFileSync(CALENDAR, "utf-8"));
const genScript = join(__dirname, "generate-video.mjs");

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 0;

// Find TikTok posts with Buddha quotes or wisdom content
const quoteKeywords = ["buddha", "peace", "within", "moment", "quiet", "stillness", 
  "let go", "slow", "reminder", "mantra", "silence", "nothing", "art of", "exactly where"];
  
let quotePosts = cal.filter(p => {
  if (p.platform !== "tiktok") return false;
  const text = (p.title + " " + p.caption).toLowerCase();
  return quoteKeywords.some(kw => text.includes(kw));
});

if (limit) quotePosts = quotePosts.slice(0, limit);

console.log(`💬 Found ${quotePosts.length} TikTok quote posts for quote-card template\n`);

let count = 0;
let success = 0;

for (const post of quotePosts) {
  count++;
  
  const bg = post.background || "";
  const bgArg = bg ? `--background "${bg}"` : "";
  const caption = (post.caption || "").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const quoteLine = post.title.replace(/"/g, '\\"');
  const outputFile = `tiktok/quote-${post.id}-${Date.now()}.mp4`;

  console.log(`💬 [${count}/${quotePosts.length}] ${post.id}: "${post.title.slice(0, 50)}"`);
  console.log(`   Template: quote-card | BG: ${bg || "none"}`);

  const cmd = [
    "node", genScript,
    `--template quote-card`,
    `--size 9:16`,
    `--duration 12`,
    `--caption "${caption}"`,
    `--subtitle "${quoteLine}"`,
    bgArg,
    `--output "${outputFile}"`,
  ].filter(Boolean).join(" ");

  try {
    const result = execSync(cmd, {
      cwd: ROOT,
      timeout: 180_000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"]
    });

    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const parsed = JSON.parse(lastLine);

    if (parsed.success) {
      // Replace video with quoted variant
      post.video = `/videos/${parsed.output}`;
      // Also note it used quote-card template
      post.template = "quote-card";
      success++;
      console.log(`   ✅ /videos/${parsed.output}`);
    } else {
      console.log(`   ❌ ${parsed.error}`);
    }
  } catch (err) {
    const stderr = err.stderr || err.message || "";
    console.log(`   ❌ ${stderr.slice(0, 200)}`);
  }
}

writeFileSync(CALENDAR, JSON.stringify(cal, null, 2));
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📝 Calendar saved — ${success}/${quotePosts.length} quote cards rendered`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
