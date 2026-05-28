"use client";

import { Play, Clock, Calendar, Headphones, Sparkles, ArrowRight, Moon, Music2 } from "lucide-react";
import Link from "next/link";

const episodes = [
  {
    ep: "#12",
    title: "The Art of Doing Nothing",
    desc: "Why rest is productive and how to embrace stillness in a world obsessed with hustle.",
    duration: "32 min",
    date: "Jun 12, 2026",
    category: "Mindfulness",
    color: "border-purple-400/30",
    icon: "🧘",
  },
  {
    ep: "#11",
    title: "Morning Routines That Actually Stick",
    desc: "Practical tips for building a morning practice that doesn't feel like a chore.",
    duration: "28 min",
    date: "Jun 5, 2026",
    category: "Habits",
    color: "border-amber-400/30",
    icon: "🌅",
  },
  {
    ep: "#10",
    title: "Creativity & Stillness — Finding Flow in Quiet",
    desc: "How silence and space fuel creative breakthroughs. Feat. artist Maya Chen.",
    duration: "41 min",
    date: "May 29, 2026",
    category: "Creativity",
    color: "border-blue-400/30",
    icon: "🎨",
  },
  {
    ep: "#9",
    title: "Breathwork Basics — A Beginner's Guide",
    desc: "Simple breathing techniques to reduce anxiety, improve focus, and sleep better.",
    duration: "24 min",
    date: "May 22, 2026",
    category: "Breathwork",
    color: "border-emerald-400/30",
    icon: "🫁",
  },
  {
    ep: "#8",
    title: "Yoga for People Who 'Can't Do Yoga'",
    desc: "Breaking down the barriers. No flexibility required. Just show up.",
    duration: "35 min",
    date: "May 15, 2026",
    category: "Yoga",
    color: "border-pink-400/30",
    icon: "🧘‍♀️",
  },
  {
    ep: "#7",
    title: "The Science of Lofi Music & Focus",
    desc: "Why lofi beats help you concentrate — the neuroscience behind the chill.",
    duration: "30 min",
    date: "May 8, 2026",
    category: "Science",
    color: "border-red-400/30",
    icon: "🔬",
  },
  {
    ep: "#6",
    title: "Digital Detox — 7 Days Without Screens",
    desc: "What happened when our host disconnected for a week. Lessons and takeaways.",
    duration: "38 min",
    date: "May 1, 2026",
    category: "Lifestyle",
    color: "border-teal-400/30",
    icon: "📵",
  },
  {
    ep: "#5",
    title: "Building a Meditation Practice That Lasts",
    desc: "From 2 minutes to 20 — a realistic path to a consistent meditation habit.",
    duration: "26 min",
    date: "Apr 24, 2026",
    category: "Meditation",
    color: "border-indigo-400/30",
    icon: "🧠",
  },
];

const platforms = [
  { label: "Spotify", href: "https://open.spotify.com/", color: "text-green-400", bg: "bg-green-400/10" },
  { label: "Apple Podcasts", href: "https://podcasts.apple.com/", color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A", color: "text-red-400", bg: "bg-red-400/10" },
  { label: "Overcast", href: "https://overcast.fm/", color: "text-orange-400", bg: "bg-orange-400/10" },
  { label: "Pocket Casts", href: "https://pocketcasts.com/", color: "text-pink-400", bg: "bg-pink-400/10" },
];

export default function PodcastPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-text-primary font-semibold">
            <Moon size={20} className="text-accent-light" /> LofiBuddha
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Browse</Link>
            <Link href="/#pricing" className="btn-zen text-sm py-2 px-4">Upgrade</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm">
            <Headphones size={14} /> The Mindful Creative
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Weekly conversations about mindfulness, creativity & intentional living</h1>
          <p className="text-text-muted max-w-xl mx-auto">
            New episodes every Monday. Available wherever you get your podcasts.
          </p>
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap justify-center gap-3">
          {platforms.map((p) => (
            <a key={p.label} href={p.href} target="_blank" rel="noopener"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${p.bg} ${p.color} hover:scale-105`}>
              <Headphones size={14} /> Listen on {p.label}
            </a>
          ))}
        </div>

        {/* Episodes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Episodes</h2>
            <span className="text-[10px] text-text-muted">{episodes.length} episodes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {episodes.map((ep) => (
              <div key={ep.ep} className={`glass p-5 space-y-3 border ${ep.color} hover:border-accent/30 transition-all cursor-pointer group`}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{ep.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-purple-400 font-semibold">{ep.ep}</span>
                      <span className="text-[10px] text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{ep.category}</span>
                    </div>
                    <h3 className="font-semibold text-text-primary text-sm mt-1 group-hover:text-accent-light transition-colors">{ep.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{ep.desc}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted pt-1">
                  <span className="flex items-center gap-1"><Clock size={11} /> {ep.duration}</span>
                  <span>{ep.date}</span>
                  <button className="ml-auto flex items-center gap-1 text-accent-light hover:text-accent transition-colors text-xs font-medium">
                    <Play size={12} /> Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="glass p-8 text-center space-y-4 bg-gradient-to-b from-accent/5 to-transparent border-accent/20">
          <Sparkles size={24} className="mx-auto text-accent-light" />
          <h2 className="text-xl font-bold text-text-primary">Never miss an episode</h2>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Get new episodes delivered straight to your inbox, plus exclusive behind-the-scenes content.
          </p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input type="email" placeholder="your@email.com"
              className="flex-1 bg-bg-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50" />
            <button className="btn-zen text-sm px-5 py-2.5 flex-shrink-0">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
