import { NextRequest, NextResponse } from "next/server";

interface CalendarPost {
  id: string;
  title: string;
  caption: string;
  date: string;
  time: string;
  platform: string;
  video: string;
  status: "draft" | "scheduled" | "released";
  hashtags: string;
}

function getDefaultPosts(): CalendarPost[] {
  const days: string[] = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push(d.toISOString().split("T")[0]);
  }
  return [
    { id: "1", title: "Morning Yoga Flow — 10 min Gentle Stretch", caption: "Start your day with this gentle morning yoga flow.\nPerfect for beginners.\n\n🎵 lofibuddha.com", date: days[0], time: "08:00", platform: "youtube", video: "/videos/youtube/zen-lofi-youtube.mp4", status: "draft", hashtags: "#yoga #morningroutine #lofi #mindfulness #lofibuddha" },
    { id: "2", title: "Deep Focus Lofi — Study & Work Session", caption: "1 hour of deep focus lofi beats.\nNo interruptions.\n\n🧘 lofibuddha.com", date: days[0], time: "12:00", platform: "youtube", video: "/videos/youtube/zen-lofi-youtube.mp4", status: "draft", hashtags: "#lofi #studybeats #focus #workmusic #lofibuddha" },
    { id: "3", title: "Guided Breathwork — 5 Min Reset", caption: "Breathe in... hold... breathe out.\n\n🌸 lofibuddha.com", date: days[1], time: "08:00", platform: "youtube", video: "/videos/square/zen-lofi-square.mp4", status: "draft", hashtags: "#breathwork #meditation #mindfulness #lofibuddha" },
    { id: "4", title: "Evening Wind Down — Lofi + Rain Sounds", caption: "Unwind after a long day with soft lofi and rain.\n\n🌙 lofibuddha.com", date: days[2], time: "21:00", platform: "youtube", video: "/videos/youtube/zen-lofi-youtube.mp4", status: "scheduled", hashtags: "#lofi #rainsounds #sleepmusic #relaxation #lofibuddha" },
    { id: "5", title: "Lofi Mix #12 — Chillhop & Jazzhop", caption: "Handpicked chillhop & jazzhop beats.\n\n🎧 lofibuddha.com", date: days[3], time: "10:00", platform: "youtube", video: "/videos/youtube/zen-lofi-youtube.mp4", status: "draft", hashtags: "#lofi #chillhop #jazzhop #mixtape #lofibuddha" },
    { id: "6", title: "Yoga for Back Pain — 15 Min Relief", caption: "Gentle stretches to relieve lower back pain.\n\n🧘 lofibuddha.com", date: days[4], time: "08:00", platform: "youtube", video: "/videos/square/zen-lofi-square.mp4", status: "scheduled", hashtags: "#yoga #backpain #stretching #wellness #lofibuddha" },
    { id: "7", title: "Sunday Slow Down — Meditation & Journaling", caption: "A slow Sunday session. Take time for yourself.\n\n📝 lofibuddha.com", date: days[5], time: "09:00", platform: "youtube", video: "/videos/youtube/zen-lofi-youtube.mp4", status: "draft", hashtags: "#sunday #meditation #journaling #selfcare #lofibuddha" },
    { id: "8", title: "Lofi for Sleep — Deep Rest Mix", caption: "Deep rest is the foundation of a clear mind.\n\n💤 lofibuddha.com", date: days[7], time: "22:00", platform: "youtube", video: "/videos/youtube/zen-lofi-youtube.mp4", status: "released", hashtags: "#lofi #sleepmusic #deepsleep #rest #lofibuddha" },
  ];
}

export async function GET() {
  const posts = getDefaultPosts();
  return NextResponse.json({ posts });
}
