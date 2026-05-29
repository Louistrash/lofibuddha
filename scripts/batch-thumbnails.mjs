#!/usr/bin/env node
/**
 * Batch thumbnail generator — reads calendar.json and renders YT thumbnails
 * Usage: node scripts/batch-thumbnails.mjs [--limit N]
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CALENDAR = join(ROOT, "public/data/calendar.json");

const cal = JSON.parse(readFileSync(CALENDAR, "utf-8"));
const genScript = join(__dirname, "generate-thumbnail.mjs");

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 0;

// Only YouTube posts
let ytPosts = cal.filter(p => p.platform === "youtube");
if (limit) ytPosts = ytPosts.slice(0, limit);

console.log(`🎨 Generating thumbnails for ${ytPosts.length} YouTube posts\n`);

let count = 0;
let success = 0;

for (const post of ytPosts) {
  count++;
  
  // Determine subtitle based on content category
  let subtitle = "Mindfulness & Relaxation";
  const t = post.title.toLowerCase();
  if (t.includes("yoga") || t.includes("flow")) subtitle = "Gentle Yoga Practice";
  else if (t.includes("meditation") || t.includes("breath")) subtitle = "Guided Meditation";
  else if (t.includes("focus") || t.includes("study")) subtitle = "Deep Focus Session";
  else if (t.includes("sleep") || t.includes("rest")) subtitle = "Sleep & Deep Rest";
  else if (t.includes("morning") || t.includes("sunrise")) subtitle = "Peaceful Morning";
  else if (t.includes("evening") || t.includes("sunset")) subtitle = "Evening Wind Down";
  else if (t.includes("lofi") || t.includes("mix")) subtitle = "Curated Lofi Mix";

  const thumbName = `${post.id}`;
  const bg = post.background || "";
  const bgArg = bg ? `--background "${bg}"` : "";
  const titleArg = post.title.replace(/"/g, '\\"');

  console.log(`🎨 [${count}/${ytPosts.length}] ${post.id}: "${post.title.slice(0, 55)}"`);
  console.log(`   Subtitle: ${subtitle} | BG: ${bg || "none"}`);

  const cmd = [
    "node", genScript,
    `--title "${titleArg}"`,
    `--subtitle "${subtitle}"`,
    bgArg,
    `--output "${thumbName}"`,
  ].filter(Boolean).join(" ");

  try {
    const result = execSync(cmd, {
      cwd: ROOT,
      timeout: 120_000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"]
    });

    const lines = result.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const parsed = JSON.parse(lastLine);

    if (parsed.success) {
      post.thumbnail = `/thumbnails/${thumbName}.png`;
      success++;
      console.log(`   ✅ ${post.thumbnail}`);
    } else {
      console.log(`   ❌ ${parsed.error}`);
    }
  } catch (err) {
    const stderr = err.stderr || err.message || "";
    console.log(`   ❌ ${stderr.slice(0, 200)}`);
  }
}

// Save calendar with thumbnail paths
writeFileSync(CALENDAR, JSON.stringify(cal, null, 2));
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📝 Calendar saved — ${success}/${ytPosts.length} thumbnails generated`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
