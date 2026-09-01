import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Force dynamic: drip content + subscriber tier are read fresh each request.
export const dynamic = "force-dynamic";

// ── Types ──────────────────────────────────────
interface DripItem {
  day: number;
  type: string;
  title: string;
  subtitle?: string;
  body: string;
  duration?: string;
  courseId?: string;
  modules?: number[];
  action?: { label: string; url: string };
}

interface DripContent {
  title: string;
  subtitle: string;
  days: Record<string, DripItem>;
}

// ── Content cache ──────────────────────────────
let _contentCache: Record<string, DripContent> | null = null;

function loadContent(): Record<string, DripContent> {
  if (_contentCache) return _contentCache;
  const file = path.join(process.cwd(), "data", "drip-content.json");
  try {
    _contentCache = JSON.parse(fs.readFileSync(file, "utf-8"));
    return _contentCache!;
  } catch {
    return {};
  }
}

// ── Schedule (day → item keys from content) ────
const DRIP_SCHEDULE: Record<string, Record<string, { type: string; action?: string }>> = {
  mindful: {
    "1": { type: "welcome", action: "https://lofibuddha.com/chat" },
    "2": { type: "playlist", action: "/mindfulness" },
    "3": { type: "course", action: "/account" },
    "5": { type: "guide", action: "/mindfulness" },
    "7": { type: "playlist", action: "/mindfulness" },
    "9": { type: "course", action: "/account" },
    "12": { type: "course", action: "/account" },
    "16": { type: "course", action: "/account" },
    "19": { type: "course", action: "/account" },
    "23": { type: "course", action: "/account" },
    "26": { type: "course", action: "/account" },
  },
  enlightened: {
    "1": { type: "welcome", action: "/account?tab=intake" },
    "3": { type: "roadmap", action: "/account?tab=roadmap" },
    "7": { type: "video", action: "/mindfulness" },
    "14": { type: "session", action: "https://lofibuddha.com/chat" },
    "21": { type: "playlist", action: "/mindfulness" },
    "28": { type: "reflection", action: "/account?tab=reflection" },
  },
};

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

function calculateDripDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function resolveContent(tier: string, day: number): DripItem | null {
  const content = loadContent();
  const tierContent = content[tier];
  if (!tierContent) return null;
  return tierContent.days[String(day)] || null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const dayParam = searchParams.get("day");

  // ── Zen / free tier content ──────────────────
  const zenContent = {
    tier: "zen",
    dripDay: 0,
    items: [
      {
        day: 0,
        type: "feature",
        title: "Lofi Radio",
        subtitle: "24/7 calm soundscapes",
        body: "Our main Lofi stream is always free. Gentle beats, ambient textures, and nature sounds to accompany your day — whether you're working, studying, or simply breathing.",
        action: { label: "Listen now", url: "/mindfulness" },
      },
      {
        day: 0,
        type: "feature",
        title: "AI Buddha Chat",
        subtitle: "10 queries per day",
        body: "Ask AI Buddha anything — spiritual guidance, meditation tips, or simply a calming perspective on your day. Free tier includes 10 daily queries.",
        action: { label: "Chat now", url: "https://lofibuddha.com/chat" },
      },
      {
        day: 0,
        type: "feature",
        title: "4-4-4 Box Breathing",
        subtitle: "Instant calm, anywhere",
        body: "Inhale 4 seconds. Hold 4 seconds. Exhale 4 seconds. Hold 4 seconds. Our visualizer guides you through each cycle.",
        action: { label: "Try it", url: "/mindfulness" },
      },
    ],
    nextUnlock: {
      day: 1,
      title: "The Mindful Path",
      subtitle: "Upgrade to unlock full guided courses",
      action: { label: "See plans", url: "/signup" },
    },
  };

  // Single day lookup (for email content)
  if (dayParam && email) {
    const subscribers = JSON.parse(
      fs.existsSync(SUBSCRIBERS_FILE)
        ? fs.readFileSync(SUBSCRIBERS_FILE, "utf-8")
        : "[]"
    );
    const sub = subscribers.find((s: any) => s.email === email);
    if (!sub) {
      // Return zen-level content for requested day
      return NextResponse.json({
        email,
        tier: "zen",
        day: parseInt(dayParam),
        content: null,
        message: "Upgrade to unlock this content",
      });
    }

    const content = resolveContent(sub.tier, parseInt(dayParam));
    return NextResponse.json({
      email,
      tier: sub.tier,
      dripDay: sub.startDate ? calculateDripDay(sub.startDate) : sub.dripDay,
      day: parseInt(dayParam),
      content,
    });
  }

  // Full dashboard view (no email = zen)
  if (!email) {
    return NextResponse.json(zenContent);
  }

  // Full subscriber view
  let subscriber: any = null;
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
      subscriber = subscribers.find((s: any) => s.email === email);
    }
  } catch {}

  if (!subscriber) {
    return NextResponse.json(zenContent);
  }

  const dripDay = subscriber.startDate
    ? calculateDripDay(subscriber.startDate)
    : subscriber.dripDay || 0;

  const schedule = DRIP_SCHEDULE[subscriber.tier] || {};
  const content = loadContent();
  const tierContent = content[subscriber.tier];

  // Build items with full content
  const items: any[] = [];
  const unlockedDays: number[] = [];

  Object.entries(schedule).forEach(([dayStr]) => {
    const day = parseInt(dayStr);
    if (day <= dripDay) {
      const item = tierContent?.days[dayStr];
      if (item) {
        items.push(item);
        unlockedDays.push(day);
      }
    }
  });

  // Next unlock
  const nextDay = Object.keys(schedule)
    .map(Number)
    .sort((a, b) => a - b)
    .find((d) => d > dripDay);
  const nextUnlock = nextDay ? tierContent?.days[String(nextDay)] || null : null;

  return NextResponse.json({
    tier: subscriber.tier,
    title: tierContent?.title,
    subtitle: tierContent?.subtitle,
    dripDay,
    startDate: subscriber.startDate,
    unlockedDays,
    items,
    nextUnlock: nextUnlock
      ? { day: nextDay, title: nextUnlock.title }
      : null,
  });
}
