import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Drip content schedule (same as webhook) ────
const DRIP_SCHEDULE: Record<string, { day: number; type: string; label: string; action?: string; courseId?: string; modules?: number[] }[]> = {
  mindful: [
    { day: 1, type: "welcome", label: "Welcome to your Mindful Path" },
    { day: 1, type: "feature", label: "Unlimited AI Buddha chat — start now", action: "https://aibuddha.net/#chat" },
    { day: 2, type: "playlist", label: "Morning Calm — Lofi playlist #1", action: "/browse" },
    { day: 3, type: "course", label: "Beginner's Mindfulness (Day 1-2)", courseId: "beginners-mindfulness", modules: [1, 2] },
    { day: 5, type: "guide", label: "4-4-4 Box Breathing technique", action: "/browse" },
    { day: 7, type: "playlist", label: "Deep Focus — Lofi playlist #2", action: "/browse" },
    { day: 9, type: "course", label: "Beginner's Mindfulness (Day 3-5)", courseId: "beginners-mindfulness", modules: [3, 4, 5] },
    { day: 12, type: "course", label: "Yoga Foundations (Day 1-3)", courseId: "yoga-foundations", modules: [1, 2, 3] },
    { day: 16, type: "course", label: "Beginner's Mindfulness (Day 6-7)", courseId: "beginners-mindfulness", modules: [6, 7] },
    { day: 19, type: "course", label: "Breathwork Essentials (Day 1-2)", courseId: "breathwork-essentials", modules: [1, 2] },
    { day: 23, type: "course", label: "Yoga Foundations (Day 4-7)", courseId: "yoga-foundations", modules: [4, 5, 6, 7] },
    { day: 26, type: "course", label: "Lofi & Deep Focus (Day 1-3)", courseId: "lofi-deep-focus", modules: [1, 2, 3] },
  ],
  enlightened: [
    { day: 1, type: "welcome", label: "The Enlightened Path awaits" },
    { day: 1, type: "intake", label: "Personal intake — tell us about your journey", action: "https://aibuddha.net/#chat" },
    { day: 1, type: "feature", label: "Personalized daily meditation is ready", action: "https://aibuddha.net/#chat" },
    { day: 3, type: "roadmap", label: "Your spiritual roadmap", action: "/account" },
    { day: 7, type: "video", label: "Guided breathwork video (10 min)", action: "/browse" },
    { day: 14, type: "session", label: "1-on-1 AI Buddha deep dive session", action: "https://aibuddha.net/#chat" },
    { day: 21, type: "playlist", label: "Custom lofi mix — generated for your mood", action: "/browse" },
    { day: 28, type: "reflection", label: "Monthly reflection template", action: "/account" },
  ],
};

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

function calculateDripDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "email parameter required" },
      { status: 400 }
    );
  }

  // Read subscriber
  let subscriber: any = null;
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
      subscriber = subscribers.find((s: any) => s.email === email);
    }
  } catch {}

  if (!subscriber) {
    // Free tier / no subscription — return zen content
    return NextResponse.json({
      tier: "zen",
      dripDay: 0,
      unlocked: [
        { day: 0, type: "feature", label: "Lofi radio — listen now", action: "/browse" },
        { day: 0, type: "feature", label: "AI Buddha chat (10/day)", action: "https://aibuddha.net/#chat" },
        { day: 0, type: "feature", label: "4-4-4 Box Breathing", action: "/browse" },
      ],
      nextUnlock: null,
    });
  }

  const dripDay = subscriber.startDate
    ? calculateDripDay(subscriber.startDate)
    : subscriber.dripDay || 0;

  const schedule = DRIP_SCHEDULE[subscriber.tier] || [];
  const unlocked = schedule.filter((item) => item.day <= dripDay);
  const nextUnlock = schedule.find((item) => item.day > dripDay) || null;

  return NextResponse.json({
    tier: subscriber.tier,
    dripDay,
    startDate: subscriber.startDate,
    unlocked,
    nextUnlock,
  });
}
