// ── Weekly Playlist Curator ────────────────────
// GET /api/playlist?week=N → returns playlist for that week
// Organizes audio files from /public/audio/ into themed weekly playlists

import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const AUDIO_DIR = join(process.cwd(), "public", "audio");

interface Track {
  name: string;
  path: string;
  mood: string;
}

// Mood-based playlists
const WEEKLY_THEMES = [
  { week: 1, mood: "Morning Calm", tracks: ["ochtend", "yoga", "focus"] },
  { week: 2, mood: "Deep Focus", tracks: ["focus", "focus", "ochtend"] },
  { week: 3, mood: "Sunset Yoga", tracks: ["yoga", "avond", "focus"] },
  { week: 4, mood: "Sleep & Restore", tracks: ["slaap", "avond", "yoga"] },
];

async function scanAudioFiles(): Promise<Track[]> {
  const tracks: Track[] = [];
  try {
    const dirs = await readdir(AUDIO_DIR, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      const weekDir = join(AUDIO_DIR, dir.name);
      const files = await readdir(weekDir);
      for (const file of files) {
        if (file.endsWith(".mp3") || file.endsWith(".ogg") || file.endsWith(".wav")) {
          const mood = file.replace(/\.(mp3|ogg|wav)$/, "");
          tracks.push({
            name: `${mood} — Week ${dir.name.replace("week-", "")}`,
            path: `/audio/${dir.name}/${file}`,
            mood,
          });
        }
      }
    }
  } catch {}
  return tracks;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weekParam = searchParams.get("week");
  const week = weekParam ? parseInt(weekParam) : 1;

  const allTracks = await scanAudioFiles();
  const theme = WEEKLY_THEMES[(week - 1) % WEEKLY_THEMES.length];

  // Find matching tracks for this week's theme
  const playlist = theme.tracks
    .map((mood) => allTracks.find((t) => t.mood === mood))
    .filter(Boolean) as Track[];

  // Deduplicate
  const seen = new Set<string>();
  const unique = playlist.filter((t) => {
    if (seen.has(t.path)) return false;
    seen.add(t.path);
    return true;
  });

  return NextResponse.json({
    week,
    theme: theme.mood,
    tracks: unique,
    totalTracks: allTracks.length,
    allMoods: [...new Set(allTracks.map((t) => t.mood))],
  });
}
