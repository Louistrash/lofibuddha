import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

interface ImageEntry {
  name: string;
  path: string;
  url: string;
  size: number;
  sizeFormatted: string;
  modified: string;
  width?: number;
  height?: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function scanDir(dir: string, baseUrl: string, prefix: string): Promise<ImageEntry[]> {
  const entries: ImageEntry[] = [];
  try {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        const sub = await scanDir(fullPath, baseUrl, prefix + item.name + "/");
        entries.push(...sub);
      } else if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(item.name)) {
        const s = await stat(fullPath);
        entries.push({
          name: item.name,
          path: "/images/" + prefix + item.name,
          url: baseUrl + "/images/" + prefix + item.name,
          size: s.size,
          sizeFormatted: formatSize(s.size),
          modified: s.mtime.toISOString(),
        });
      }
    }
  } catch {}
  return entries;
}

export async function GET(request: NextRequest) {
  try {
    const publicDir = join(process.cwd(), "public", "images");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const images = await scanDir(publicDir, baseUrl, "");
    return NextResponse.json({ images, total: images.length });
  } catch (err) {
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 });
  }
}
