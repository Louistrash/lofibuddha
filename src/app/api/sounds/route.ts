import { NextResponse } from "next/server";
import { existsSync } from "fs";
import { join } from "path";
import { SOUNDS, MODES } from "@/lib/sounds";
import { getProjectRoot } from "@/lib/paths";

// GET /api/sounds — list sound library + mixer modes
export async function GET() {
  const audioDir = join(getProjectRoot(), "data", "sounds", "audio");
  const sounds = SOUNDS.map(s => {
    const hasAudio = existsSync(join(audioDir, s.slug + ".mp3"));
    return {
      slug: s.slug,
      name: s.name,
      description: s.description,
      category: s.category,
      hasAudio,
      audioUrl: hasAudio ? `/api/sounds/audio/${s.slug}.mp3` : null,
    };
  });
  return NextResponse.json({ sounds, modes: MODES });
}
