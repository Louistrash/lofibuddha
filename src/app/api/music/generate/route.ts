import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "music");

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, mood } = body;
    if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const desc: Record<string, string> = {
      morning: "Gentle piano over soft beats. Perfect for sunrise and morning yoga.",
      focus: "Minimal percussion with atmospheric pads. For deep work and concentration.",
      sleep: "Ambient textures with slow harmonies. Wind down into restful sleep.",
      yoga: "Flowing melodies with nature sounds. Grounding rhythms for your practice.",
      calm: "Soft lofi textures with subtle percussion. Your daily dose of peace.",
    };

    const bpmMap: Record<string, number> = { morning: 70, focus: 85, sleep: 55, yoga: 65, calm: 72 };
    const key = topic.toLowerCase();
    const id = "ai-" + Date.now().toString(36);

    const track = {
      id, title: topic + " Vibes", artist: "LofiBuddha", album: topic + " Sessions",
      genre: "Lofi", mood: mood || topic,
      description: desc[key] || "Curated " + topic + " beats for your daily calm.",
      duration: "3:30", fileUrl: "/music/" + id + ".mp3",
      coverUrl: "/images/generated/album-morning-calm.png",
      bpm: bpmMap[key] || 75, tags: ["lofi", key, "calm", "meditation"],
      createdAt: new Date().toISOString(),
    };

    writeFileSync(join(DATA_DIR, id + ".json"), JSON.stringify(track, null, 2));
    return NextResponse.json({ success: true, track });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
