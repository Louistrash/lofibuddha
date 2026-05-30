import { NextRequest, NextResponse } from "next/server";

// Text & chat: OpenAI primary
const AI_KEY = process.env.OPENAI_API_KEY || "";
const AI_BASE = "https://api.openai.com/v1";
const AI_MODEL = "gpt-4o";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    if (!AI_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const messages = [
      {
        role: "system",
        content:
          "You are Bodhi, the AI assistant for lofibuddha.com. " +
          "You help with content creation, mindfulness, lofi music, yoga, relaxation, and lifestyle. " +
          "Keep responses calm, warm, and inspiring — like a mindful friend. " +
          "Welcome new users to lofibuddha.com. Encourage relaxation and mindfulness. " +
          "You can help with: YouTube scripts, TikTok hooks, meditation guides, captions, " +
          "hashtags, blog posts, video ideas, and zen wisdom. Keep replies concise (2-4 sentences max).",
      },
      ...(history || []).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const res = await fetch(`${AI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Bodhi Chat] OpenAI error:", res.status, errText);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ reply, model: AI_MODEL });
  } catch (err: any) {
    console.error("[Bodhi Chat] Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Chat failed" },
      { status: 500 }
    );
  }
}
