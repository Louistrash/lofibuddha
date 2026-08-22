import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { join } from "path";
import { MUSIC_TRACKS } from "@/lib/music";
import { getProjectRoot } from "@/lib/paths";

// GET /api/music-tracks — list generated music tracks
export async function GET() {
  const audioDir = join(getProjectRoot(), "data", "music", "tracks");
  const tracks = MUSIC_TRACKS.map(t => {
    const hasAudio = existsSync(join(audioDir, t.id + ".mp3"));
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      duration: t.duration,
      mood: t.mood,
      hasAudio,
      audioUrl: hasAudio ? `/api/music-tracks/audio/${t.id}.mp3` : null,
    };
  });
  return NextResponse.json({ tracks });
}
