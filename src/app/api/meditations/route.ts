import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { join } from "path";
import { MEDITATIONS } from "@/lib/meditations";
import { getProjectRoot } from "@/lib/paths";

// GET /api/meditations — list guided meditations (with audio availability)
export async function GET() {
  const audioDir = join(getProjectRoot(), "data", "meditations", "audio");
  const list = MEDITATIONS.map(m => {
    const hasAudio = existsSync(join(audioDir, m.id + ".mp3"));
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      duration: m.duration,
      theme: m.theme,
      hasAudio,
      audioUrl: hasAudio ? `/api/meditations/audio/${m.id}.mp3` : null,
    };
  });
  return NextResponse.json({ meditations: list });
}
