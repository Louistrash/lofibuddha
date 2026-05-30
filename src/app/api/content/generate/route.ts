import { NextRequest, NextResponse } from "next/server";

// Text generation: OpenAI primary
const AI_KEY = process.env.OPENAI_API_KEY || "";
const AI_BASE = "https://api.openai.com/v1";
const MODEL = "gpt-4o";

// ── Prompt templates per content type ──

const SYSTEM_PROMPTS: Record<string, string> = {
  youtube: `You are a professional content writer for a YouTube channel called LofiBuddha. 
Brand voice: calm, warm, minimal, inspirational. Topics: lofi music, yoga, mindfulness, relaxation, lifestyle.
Write detailed, engaging scripts in a warm, zen tone. Structure with timestamps. Include intro hook, body, and call-to-action.
Always start with "Welcome to lofibuddha.com" or "Welcome back to the channel."`,

  tiktok: `You are a viral TikTok script writer for LofiBuddha.
Brand voice: calm, warm, minimal, inspirational. Topics: lofi, yoga, mindfulness, relaxation.
Write short-form hooks (15-60 seconds). Grab attention in first 2 seconds. Use emotional hooks, relatable moments.
Keep it tight, visual, and shareable. No long intros.`,

  shorts: `You are a YouTube Shorts writer for LofiBuddha.
Brand voice: calm, warm, minimal, inspirational. Topics: lofi, yoga, mindfulness.
Write 15-60 second vertical Shorts. Strong hook, quick value, no fluff.
Perfect for mobile viewing. Include visual cues in [brackets].`,

  captions: `You are a social media caption writer for LofiBuddha.
Brand voice: calm, warm, minimal, inspirational. Platform: Instagram/TikTok/YouTube.
Write engaging captions with emojis, line breaks, and a clear CTA.
Keep the zen aesthetic. Include relevant hashtags.`,

  hashtags: `You are a hashtag strategist for LofiBuddha.
Generate 20-30 relevant hashtags for lofi, yoga, mindfulness, relaxation content.
Mix: 30% broad (#yoga), 40% medium (#morningyoga), 30% niche (#lofiyogaflow).
Return only the hashtags, space-separated.`,

  blog: `You are a blog writer for LofiBuddha.com.
Brand voice: calm, warm, minimal, inspirational. Topics: lofi music, yoga, mindfulness, lifestyle.
Write SEO-optimized blog posts (800-1500 words). Include H2/H3 headers, intro, body, conclusion, CTA.
Warm, personal tone. Use "you" and "we".`,

  newsletter: `You are a newsletter writer for LofiBuddha.
Brand voice: calm, warm, minimal, inspirational.
Write weekly digest newsletters. Subject line + body. Warm, personal.
Include: this week's content, a mindfulness tip, a lofi track recommendation, and a CTA.`,
};

const PROMPT_BUILDERS: Record<string, (topic: string, tone: string) => string> = {
  youtube: (topic, tone) =>
    `Write a YouTube script about: "${topic}". Tone: ${tone}.
Format:
[0:00-0:30] Hook - grab attention
[0:30-2:00] Introduction
[2:00-8:00] Main content (3-5 key points)
[8:00-9:00] Summary & reflection
[9:00-10:00] Call to action
Include B-roll suggestions in [brackets].
End with: "Join our community at lofibuddha.com"`,

  tiktok: (topic, tone) =>
    `Write a TikTok script about: "${topic}". Tone: ${tone}.
Hook (first 2 seconds): strong emotional grab
Body: 1-2 key insights or tips
Ending: call to comment/share
Keep total under 60 seconds. Visual cues in [brackets].`,

  shorts: (topic, tone) =>
    `Write a YouTube Shorts script about: "${topic}". Tone: ${tone}.
Hook: immediate visual/audio grab
Core message: one key insight
CTA: subscribe/comment
Keep total under 60 seconds. Visual cues in [brackets].`,

  captions: (topic, tone) =>
    `Write 3 Instagram/TikTok captions about: "${topic}". Tone: ${tone}.
Each caption should:
- Open with a hook line
- 2-3 lines of body
- Clear CTA
- 3-5 relevant emojis
Make them feel warm and personal.`,

  hashtags: (topic) =>
    `Generate 25 relevant hashtags for: "${topic}".
Context: LofiBuddha brand (lofi music, yoga, mindfulness, relaxation).
Mix: broad, medium, and niche hashtags.
Format: single line, space-separated, no # symbol just the words.`,

  blog: (topic, tone) =>
    `Write a blog post about: "${topic}". Tone: ${tone}.
Structure:
- SEO title & meta description
- Introduction (hook)
- H2: 3-5 main sections
- H3: sub-points
- Conclusion
- CTA: "Join our community at lofibuddha.com"
800-1500 words. Warm, personal tone.`,

  newsletter: (topic, tone) =>
    `Write a newsletter about: "${topic}". Tone: ${tone}.
Include:
- Subject line (engaging, 40-60 chars)
- Greeting
- Main content (this week's focus)
- Mindfulness tip
- Lofi track recommendation
- CTA
Keep it warm, personal, under 400 words.`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = "youtube", topic, tone = "warm and calming" } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!AI_KEY) {
      return NextResponse.json(
        { error: "No AI key configured — set OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // Build prompt
    const systemPrompt =
      SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.youtube;
    const userPrompt =
      PROMPT_BUILDERS[type]?.(topic, tone) ||
      PROMPT_BUILDERS.youtube(topic, tone);

    // Call OpenAI
    const response = await fetch(`${AI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json(
        { error: "AI generation failed", detail: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      type,
      topic,
      content,
      model: MODEL,
      tokens: data.usage,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
