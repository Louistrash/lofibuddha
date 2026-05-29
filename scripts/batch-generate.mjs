#!/usr/bin/env node
/**
 * Batch video generator — reads calendar.json and renders all videos
 * Usage: node scripts/batch-generate.mjs [--yt-only|--tt-only|--limit N]
 */
import { execSync } from "child_process";

const CALENDAR = "public/data/calendar.json";
const fs = await import("fs");

const data = JSON.parse(fs.readFileSync(CALENDAR, "utf-8"));
const args = process.argv.slice(2);

const ttOnly = args.includes("--tt-only");
const ytOnly = args.includes("--yt-only");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 0;

let posts = data;
if (ttOnly) posts = posts.filter(p => p.platform === "tiktok" || p.format === "shorts");
if (ytOnly) posts = posts.filter(p => p.platform === "youtube");

// Skip posts that already have a video assigned
let remaining = posts.filter(p => p.status === "draft");
if (limit) remaining = remaining.slice(0, limit);

console.log(`📦 Calendar: ${posts.length} posts, ${remaining.length} to render\n`);

let count = 0;
for (const post of remaining) {
  count++;
  const size = post.format === "shorts" ? "9:16" : "16:9";
  const output = `batch-${post.id}-${Date.now()}.mp4`;
  const bg = post.background || "";
  
  console.log(`\n🎬 [${count}/${remaining.length}] ${post.id}: "${post.title.slice(0, 50)}"`);
  console.log(`   Format: ${size} | BG: ${bg}`);
  
  // Skip if no background image
  if (!bg) {
    console.log(`   ⏭️ Skipping — no background image`);
    continue;
  }

  const cmd = [
    "node", "scripts/generate-video.mjs",
    `--template ${post.template || "zen-lofi"}`,
    `--size ${size}`,
    `--duration 30`,
    `--caption "${post.caption.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
    `--subtitle "LofiBuddha · Mindfulness & Relaxation"`,
    `--background "${bg}"`,
    `--output ${output}`,
  ].join(" ");

  console.log(`   Rendering...`);
  try {
    const result = execSync(cmd, { 
      cwd: process.cwd(), 
      timeout: 300_000, 
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    
    // Parse result from last line
    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const parsed = JSON.parse(lastLine);
    
    if (parsed.success) {
      const videoPath = `/videos/${parsed.output}`;
      post.video = videoPath;
      post.status = "scheduled";
      console.log(`   ✅ ${videoPath}`);
    } else {
      console.log(`   ❌ Failed: ${parsed.error}`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
}

// Save updated calendar
fs.writeFileSync(CALENDAR, JSON.stringify(data, null, 2));
console.log(`\n✅ Done! ${count} rendered. Calendar saved.`);
