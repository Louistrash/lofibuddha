import { NextRequest, NextResponse } from "next/server";
import { affirmationOfTheDay } from "@/lib/affirmations";
import { getProjectRoot } from "@/lib/paths";
import { corsPreflight, withCors } from "@/lib/cors";
import { stat } from "fs/promises";
import { join } from "path";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

/**
 * GET /api/affirmations/today — the day's affirmation, stable per UTC day,
 * with its audio URL if the clip exists.
 */
export async function GET(request: NextRequest) {
  const affirmation = affirmationOfTheDay();
  const audioPath = join(
    getProjectRoot(),
    "data",
    "affirmations",
    "audio",
    `${affirmation.id}.mp3`
  );

  let hasAudio = false;
  try {
    await stat(audioPath);
    hasAudio = true;
  } catch {}

  return withCors(
    request,
    NextResponse.json({
      id: affirmation.id,
      text: affirmation.text,
      theme: affirmation.theme,
      audioUrl: hasAudio ? `/api/affirmations/audio/${affirmation.id}.mp3` : null,
    })
  );
}
