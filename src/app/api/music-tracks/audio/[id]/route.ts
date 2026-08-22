import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { getProjectRoot } from "@/lib/paths";

// GET /api/music-tracks/audio/[id] — stream a generated music track
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const safeId = id.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!safeId || safeId !== id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const filePath = join(getProjectRoot(), "data", "music", "tracks", safeId);
    let info;
    try {
      info = await stat(filePath);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(info.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("[Music Track Audio]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
