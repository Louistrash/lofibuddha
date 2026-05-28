"use client";

import { Play, Clock, Music, Sun, Moon, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const freeContent = [
  {
    title: "Morning Yoga Flow",
    type: "Yoga",
    duration: "10 min",
    icon: Sun,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    desc: "Gentle morning stretches to start your day with clarity and calm.",
    video: "/videos/youtube/v1.mp4",
  },
  {
    title: "Deep Focus Lofi",
    type: "Music",
    duration: "60 min",
    icon: Music,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    desc: "Uninterrupted lofi beats for deep work and concentration.",
    video: "/videos/youtube/v2.mp4",
  },
  {
    title: "Evening Wind Down",
    type: "Meditation",
    duration: "15 min",
    icon: Moon,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    desc: "Soft lofi and guided relaxation to ease into a restful night.",
    video: "/videos/youtube/v5.mp4",
  },
  {
    title: "Guided Breathwork",
    type: "Breathwork",
    duration: "5 min",
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    desc: "A short breathwork session to reset your mind in minutes.",
    video: "/videos/youtube/v6.mp4",
  },
  {
    title: "Sunday Slow Down",
    type: "Journaling",
    duration: "20 min",
    icon: Moon,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    desc: "Meditation and journaling prompts for a reflective weekend morning.",
    video: "/videos/youtube/v7.mp4",
  },
  {
    title: "Lofi Mix #12",
    type: "Music",
    duration: "45 min",
    icon: Music,
    color: "text-red-400",
    bg: "bg-red-400/10",
    desc: "Handpicked chillhop and jazzhop — perfect background for any moment.",
    video: "/videos/youtube/zen-lofi-youtube.mp4",
  },
];

const premiumTeaser = [
  { title: "Sleep Stories", desc: "Narrated meditations to guide you into deep, restful sleep.", icon: Moon },
  { title: "Live Workshops", desc: "Monthly live sessions with our mindfulness teachers.", icon: Sun },
  { title: "Custom Playlists", desc: "AI-curated playlists that adapt to your mood and energy.", icon: Music },
];

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-text-primary font-semibold">
            <Moon size={20} className="text-accent-light" />
            LofiBuddha
          </Link>
          <Link href="/#pricing" className="btn-zen text-sm py-2 px-4">
            Upgrade
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Free Content</h1>
          <p className="text-text-muted mt-2">
            Start your journey with these handpicked sessions. No account needed.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {freeContent.map((item) => (
            <div key={item.title} className="glass overflow-hidden hover:border-accent/20 transition-all group">
              {/* Video preview */}
              <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
                <video
                  src={item.video}
                  controls
                  muted
                  preload="metadata"
                  className="max-w-full max-h-full"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon size={14} className={item.color} />
                  </div>
                  <span className="text-xs text-text-muted">{item.type}</span>
                  <span className="text-xs text-text-muted flex items-center gap-1 ml-auto">
                    <Clock size={11} /> {item.duration}
                  </span>
                </div>
                <h3 className="font-semibold text-text-primary">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                <button className="flex items-center gap-1.5 text-sm text-accent-light hover:text-accent transition-colors group/btn">
                  <Play size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  Play now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Teaser */}
        <div className="glass p-8 text-center space-y-6 bg-gradient-to-b from-accent/5 to-transparent border-accent/20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-light text-sm">
            <Sparkles size={14} />
            Premium
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Unlock the full experience</h2>
          <p className="text-text-muted max-w-lg mx-auto">
            Unlimited access to all content, live sessions, AI-powered recommendations, and more.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {premiumTeaser.map((p) => (
              <div key={p.title} className="bg-bg-hover rounded-xl p-4 text-center space-y-2">
                <p.icon size={20} className="mx-auto text-accent-light" />
                <p className="text-sm font-medium text-text-primary">{p.title}</p>
                <p className="text-xs text-text-muted">{p.desc}</p>
              </div>
            ))}
          </div>

          <Link
            href="/#pricing"
            className="btn-zen inline-flex items-center gap-2 px-6 py-3"
          >
            View Plans
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
