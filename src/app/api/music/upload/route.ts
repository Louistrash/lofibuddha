import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getMusicFilesDir, getMusicDataDir } from "@/lib/paths";

const ALLOWED_TYPES = [
  "audio/mpeg", "audio/mp3",
  "audio/wav", "audio/x-wav", "audio/wave",
  "audio/ogg", "application/ogg",
  "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac",
  "audio/flac", "audio/x-flac",
];

const EXT_CONTENT_TYPE: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  flac: "audio/flac",
};

// POST /api/music/upload — upload an audio file (multipart/form-data)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = ((formData.get("title") as string) || "").trim();
    const mood = ((formData.get("mood") as string) || "calm").trim();
    const tagsRaw = ((formData.get("tags") as string) || "").trim();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: MP3, WAV, OGG, M4A, FLAC" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 50MB" }, { status: 400 });
    }

    const filesDir = getMusicFilesDir();
    const dataDir = getMusicDataDir();
    await mkdir(filesDir, { recursive: true });
    await mkdir(dataDir, { recursive: true });

    const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
    const id = "track-" + Date.now().toString(36);
    const filename = `${id}.${ext}`;

    const bytes = await file.arrayBuffer();
    await writeFile(join(filesDir, filename), Buffer.from(bytes));

    const fileUrl = `/api/music/file/${filename}`;
    const fallbackTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
    const tags = tagsRaw
      ? tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
      : [mood.toLowerCase(), "ambient"];

    const track = {
      id,
      title: title || fallbackTitle,
      artist: "LofiBuddha",
      album: "Ambient Worlds",
      genre: "Ambient",
      mood: mood.toLowerCase(),
      description: "",
      duration: "0:00",
      fileUrl,
      coverUrl: "",
      bpm: 0,
      tags,
      contentType: EXT_CONTENT_TYPE[ext] || "audio/mpeg",
      createdAt: new Date().toISOString(),
    };

    await writeFile(join(dataDir, id + ".json"), JSON.stringify(track, null, 2));

    return NextResponse.json({ success: true, url: fileUrl, track }, { status: 201 });
  } catch (err: any) {
    console.error("[Music Upload]", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
