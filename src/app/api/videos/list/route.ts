import { readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { NextResponse } from "next/server";

const VIDEOS_DIR = join(process.cwd(), "public", "videos");

interface VideoEntry {
  name: string;
  path: string;
  format: string;
  size: number;
  sizeFormatted: string;
  width: number;
  height: number;
  platform: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectPlatform(dirName: string): { platform: string; width: number; height: number } {
  const map: Record<string, { platform: string; width: number; height: number }> = {
    shorts: { platform: "TikTok / Shorts", width: 1080, height: 1920 },
    youtube: { platform: "YouTube", width: 1920, height: 1080 },
    square: { platform: "Instagram / Post", width: 1080, height: 1080 },
  };
  return map[dirName] || { platform: dirName, width: 0, height: 0 };
}

export async function GET() {
  try {
    const entries: VideoEntry[] = [];

    const dirs = readdirSync(VIDEOS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());

    for (const dir of dirs) {
      const dirPath = join(VIDEOS_DIR, dir.name);
      const files = readdirSync(dirPath).filter((f) => f.endsWith(".mp4"));

      for (const file of files) {
        const filePath = join(dirPath, file);
        const stats = statSync(filePath);
        const { platform, width, height } = detectPlatform(dir.name);
        const relPath = `/videos/${dir.name}/${file}`;

        entries.push({
          name: file.replace(".mp4", "").replace(/-/g, " "),
          path: relPath,
          format: dir.name,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          width,
          height,
          platform,
        });
      }
    }

    return NextResponse.json({ videos: entries });
  } catch (err) {
    return NextResponse.json({ videos: [], error: "Failed to scan videos" }, { status: 500 });
  }
}
