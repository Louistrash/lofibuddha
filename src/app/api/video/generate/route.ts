import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, size, caption, subtitle, duration, background } = body;

    if (!caption || !size) {
      return NextResponse.json(
        { error: "caption and size are required" },
        { status: 400 }
      );
    }

    const sizeMap: Record<string, string> = {
      shorts: "9:16",
      tiktok: "9:16",
      reel: "9:16",
      youtube: "16:9",
      square: "1:1",
      "9:16": "9:16",
      "16:9": "16:9",
      "1:1": "1:1",
    };

    const resolvedSize = sizeMap[size] || size;
    const outputName = `video-${resolvedSize.replace(":", "x")}-${Date.now()}.mp4`;
    const safeCaption = caption.replace(/"/g, '\\"').replace(/\n/g, "\\n");
    const safeSubtitle = (subtitle || "Mindfulness & Relaxation").replace(/"/g, '\\"');
    const safeBackground = (background || "").replace(/"/g, '\\"');

    const cmd = [
      "node",
      "scripts/generate-video.mjs",
      `--template ${template || "zen-lofi"}`,
      `--size ${resolvedSize}`,
      `--duration ${duration || 30}`,
      `--caption "${safeCaption}"`,
      `--subtitle "${safeSubtitle}"`,
      ...(safeBackground ? [`--background "${safeBackground}"`] : []),
      `--output ${outputName}`,
    ].join(" ");

    console.log("[Bodhi API] Generating video:", outputName);

    const cwd = join(process.cwd(), '..', '..');  // navigate from .next/standalone to project root
    const stdout = execSync(cmd, {
      cwd,
      timeout: 300_000,
      encoding: "utf-8",
    });

    const result = JSON.parse(stdout.split("\n").filter(Boolean).pop() || "{}");

    return NextResponse.json({
      success: result.success,
      video: result.success
        ? `/videos/${result.output}`
        : null,
      details: result,
    });
  } catch (err: any) {
    console.error("[Bodhi API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Video generation failed" },
      { status: 500 }
    );
  }
}
