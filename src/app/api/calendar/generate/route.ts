import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

const CALENDAR_PATH = join(process.cwd(), "public", "data", "calendar.json");

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    const raw = await readFile(CALENDAR_PATH, "utf-8");
    const posts = JSON.parse(raw);
    const post = posts.find((p: any) => p.id === postId);
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const size = post.format === "shorts" ? "9:16" : "16:9";
    const outputName = `gen-${postId}-${Date.now()}.mp4`;
    const bg = post.background || "";

    // Build command
    const safeCaption = post.caption.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const safeSubtitle = "LofiBuddha · Mindfulness & Relaxation";

    let cmd = [
      "node", "scripts/generate-video.mjs",
      `--template ${post.template || "zen-lofi"}`,
      `--size ${size}`,
      `--duration 30`,
      `--caption "${safeCaption}"`,
      `--subtitle "${safeSubtitle}"`,
      `--output ${outputName}`,
    ];
    
    if (bg) cmd.push(`--background "${bg}"`);

    console.log("[Calendar] Generating video for:", postId);

    const stdout = execSync(cmd.join(" "), {
      cwd: join(process.cwd()),
      timeout: 300_000,
      encoding: "utf-8",
    });

    const lines = stdout.trim().split("\n");
    const parsed = JSON.parse(lines[lines.length - 1]);

    if (parsed.success) {
      const videoPath = `/videos/${parsed.output}`;
      post.video = videoPath;
      post.status = "scheduled";
      await writeFile(CALENDAR_PATH, JSON.stringify(posts, null, 2));

      return NextResponse.json({
        success: true,
        post,
        video: videoPath,
        details: parsed,
      });
    } else {
      return NextResponse.json({ error: parsed.error }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[Calendar] Generate error:", err);
    return NextResponse.json(
      { error: err.message || "Generation failed" },
      { status: 500 }
    );
  }
}
