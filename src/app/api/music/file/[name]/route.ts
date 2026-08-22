import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { getMusicFilesDir } from "@/lib/paths";

const EXT_CONTENT_TYPE: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  flac: "audio/flac",
};

// GET /api/music/file/[name] — stream an uploaded audio file
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!safeName || safeName !== name) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = join(getMusicFilesDir(), safeName);
    let info;
    try {
      info = await stat(filePath);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await readFile(filePath);
    const ext = safeName.split(".").pop()?.toLowerCase() || "mp3";
    const contentType = EXT_CONTENT_TYPE[ext] || "audio/mpeg";

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("[Music File]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
