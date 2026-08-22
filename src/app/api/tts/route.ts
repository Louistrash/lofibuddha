import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "iJkzOEXKLoZ6ZquIAnOA";

// POST /api/tts — generate speech from text (ElevenLabs)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body?.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
    }

    // Cap text length (ElevenLabs handles ~5000 chars; keep reasonable)
    const safeText = text.slice(0, 2500);

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: safeText,
        model_id: "eleven_v3",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TTS] ElevenLabs error", res.status, errText);
      return NextResponse.json(
        { error: "Speech generation failed", detail: errText.slice(0, 200) },
        { status: 502 }
      );
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[TTS]", err);
    return NextResponse.json({ error: err.message || "TTS failed" }, { status: 500 });
  }
}
