import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { getProjectRoot } from "@/lib/paths";

// GET /api/breathe/audio/[name] — stream a guided breathing voice cue
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!safeName || safeName !== name) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const filePath = join(getProjectRoot(), "data", "breathe", "audio", safeName);
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
    console.error("[Breathe Audio]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
