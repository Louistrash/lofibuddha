#!/usr/bin/env node
/**
 * Render missing videos from calendar posts
 * Scans calendar.json, finds posts without matching video files, renders them
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CALENDAR = join(ROOT, "public/data/calendar.json");
const VIDEOS = join(ROOT, "public/videos");

const cal = JSON.parse(readFileSync(CALENDAR, "utf-8"));
const genScript = join(__dirname, "generate-video.mjs");

// Identify posts without video files on disk
const missing = [];

for (const post of cal) {
  if (!post.video) {
    missing.push(post);
    continue;
  }
  // Check if file actually exists
  const vidPath = join(ROOT, "public", post.video.replace(/^\//, ""));
  if (!existsSync(vidPath)) {
    missing.push(post);
  }
}

console.log(`🎬 Found ${missing.length} posts without video files\n`);

if (missing.length === 0) {
  console.log("✅ All posts have videos — nothing to render.");
  process.exit(0);
}

let count = 0;
let success = 0;

for (const post of missing) {
  count++;
  const platform = post.platform === "tiktok" || post.format === "shorts" || post.format === "tiktok" 
    ? "tiktok" : "youtube";
  const size = platform === "tiktok" ? "9:16" : "16:9";
  const duration = platform === "tiktok" ? 30 : 30;
  
  const bgName = post.background 
    ? post.background.split("/").pop().replace(".png", "")
    : "no-bg";
  
  const outputFile = platform === "tiktok" 
    ? `tiktok/${bgName}-${Date.now()}.mp4`
    : `youtube/${bgName}-${Date.now()}.mp4`;
  
  const caption = (post.caption || "").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const bgPath = post.background ? join(ROOT, "public", post.background.replace(/^\//, "")) : "";
  
  console.log(`\n🎬 [${count}/${missing.length}] ${post.id}: "${post.title.slice(0, 55)}"`);
  console.log(`   Size: ${size} | BG: ${post.background || "none"} | Output: ${outputFile}`);

  const cmd = [
    "node", genScript,
    `--template zen-lofi`,
    `--size ${size}`,
    `--duration ${duration}`,
    `--caption "${caption}"`,
    `--subtitle "LofiBuddha · Mindfulness & Relaxation"`,
    bgPath ? `--background "${bgPath}"` : "",
    `--output "${outputFile}"`,
  ].filter(Boolean).join(" ");

  try {
    const result = execSync(cmd, {
      cwd: ROOT,
      timeout: 180_000,  // 3 min per video
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"]
    });

    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    
    try {
      const parsed = JSON.parse(lastLine);
      if (parsed.success) {
        const videoPath = `/videos/${parsed.output}`;
        post.video = videoPath;
        // Keep status as "draft" per user request
        success++;
        console.log(`   ✅ ${videoPath}`);
      } else {
        console.log(`   ❌ Failed: ${parsed.error}`);
      }
    } catch {
      // If last line isn't JSON, check output
      if (result.includes("✅")) {
        console.log(`   ✅ Rendered (from output)`);
        success++;
      } else {
        console.log(`   ⚠️  Unclear result, checking...`);
      }
    }
  } catch (err) {
    const stderr = err.stderr || err.message || "";
    console.log(`   ❌ Error: ${stderr.slice(0, 200)}`);
  }
}

// Save updated calendar (all statuses stay "draft")
writeFileSync(CALENDAR, JSON.stringify(cal, null, 2));
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📝 Calendar saved — ${success}/${missing.length} videos rendered`);
console.log(`📋 All posts remain at "draft" status`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
