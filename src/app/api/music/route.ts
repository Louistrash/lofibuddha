import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync, renameSync, unlinkSync } from "fs";
import { join } from "path";
import { getMusicDataDir, getMusicFilesDir } from "@/lib/paths";

const DATA_DIR = getMusicDataDir();

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  description: string;
  duration: string;
  fileUrl: string;
  coverUrl: string;
  bpm: number;
  tags: string[];
  createdAt: string;
}

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function getTracks(): Track[] {
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
  return files.map(f => JSON.parse(readFileSync(join(DATA_DIR, f), "utf-8")) as Track)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// DELETE /api/music?id=xxx — remove a track (metadata + file)
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const metaPath = join(DATA_DIR, id + ".json");
    if (existsSync(metaPath)) {
      let fileUrl = "";
      try {
        const track = JSON.parse(readFileSync(metaPath, "utf-8")) as Track;
        fileUrl = track.fileUrl || "";
      } catch {}
      unlinkSync(metaPath);
      // Remove the underlying audio file if it lives in our files dir
      if (fileUrl) {
        const name = fileUrl.split("/").pop() || "";
        const filePath = join(getMusicFilesDir(), name);
        if (existsSync(filePath)) unlinkSync(filePath);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/music — list all tracks
export async function GET() {
  return NextResponse.json({ tracks: getTracks() });
}

// POST /api/music — create new track
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, artist, album, genre, mood, description, duration, bpm, tags, coverUrl } = body;
    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    const id = "track-" + Date.now().toString(36);
    const track: Track = {
      id, title,
      artist: artist || "LofiBuddha",
      album: album || "Daily Calm",
      genre: genre || "Lofi",
      mood: mood || "Calm",
      description: description || "",
      duration: duration || "3:00",
      fileUrl: `/music/${id}.mp3`,
      coverUrl: coverUrl || "/images/generated/album-morning-calm.png",
      bpm: bpm || 75,
      tags: tags || ["lofi", "calm", "meditation"],
      createdAt: new Date().toISOString(),
    };
    writeFileSync(join(DATA_DIR, id + ".json"), JSON.stringify(track, null, 2));
    return NextResponse.json({ success: true, track }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/music — generate track description via AI
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, mood } = body;
    if (!topic) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }
    // AI-generated track metadata
    const id = "ai-" + Date.now().toString(36);
    const descriptions: Record<string, string> = {
      "morning": "Gentle piano over soft beats. Perfect for sunrise meditation and morning yoga flows.",
      "focus": "Minimal percussion with atmospheric pads. Designed for deep work and concentration.",
      "sleep": "Ambient textures with slow-moving harmonies. Wind down into restful sleep.",
      "yoga": "Flowing melodies with nature sounds. Support your practice with grounding rhythms.",
    };
    const moods: Record<string, number> = {
      "morning": 70, "focus": 85, "sleep": 55, "yoga": 65,
    };

    const track: Track = {
      id, title: topic + " Vibes",
      artist: "LofiBuddha",
      album: topic + " Sessions",
      genre: "Lofi",
      mood: mood || topic,
      description: descriptions[topic.toLowerCase()] || `Curated ${topic} beats for your daily calm.`,
      duration: "3:30",
      fileUrl: `/music/${id}.mp3`,
      coverUrl: `/images/generated/album-${topic.toLowerCase().replace(/\s+/g, "-")}.png`,
      bpm: moods[topic.toLowerCase()] || 75,
      tags: ["lofi", topic.toLowerCase(), "calm", "meditation"],
      createdAt: new Date().toISOString(),
    };
    writeFileSync(join(DATA_DIR, id + ".json"), JSON.stringify(track, null, 2));
    return NextResponse.json({ success: true, track });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
