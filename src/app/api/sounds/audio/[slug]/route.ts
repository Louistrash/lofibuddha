import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { getProjectRoot } from "@/lib/paths";

// GET /api/sounds/audio/[slug] — stream a soundscape audio file
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const safeSlug = slug.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!safeSlug || safeSlug !== slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const filePath = join(getProjectRoot(), "data", "sounds", "audio", safeSlug);
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
    console.error("[Sound Audio]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
