"use client";

import { useEffect, useState } from "react";
import {
  Film, Play, Download, Loader2, Sparkles, Calendar,
  Clapperboard, Smartphone, Square, Clock, Edit3, Check,
  Plus, Wand2,
} from "lucide-react";
import Link from "next/link";

// ── Types ──

interface VideoEntry {
  name: string; path: string; format: string;
  size: number; sizeFormatted: string;
  width: number; height: number; platform: string;
}

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

// ── Default posts (fallback) ──

function getDefaultPosts(): CalendarPost[] {
  const days: string[] = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
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

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const platformIcons: Record<string, typeof Clapperboard> = { youtube: Clapperboard, shorts: Smartphone, square: Square };
const platformColors: Record<string, string> = { youtube: "text-red-400", shorts: "text-pink-400", square: "text-purple-400" };
const statusBadge: Record<string, string> = { draft: "bg-bg-hover text-text-muted", scheduled: "bg-accent/10 text-accent-light", released: "bg-success/10 text-success" };

// ── Component ──

export default function ContentPage() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [posts, setPosts] = useState<CalendarPost[]>(getDefaultPosts());
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [generatingPost, setGeneratingPost] = useState<string | null>(null);

  // Load videos from API
  useEffect(() => {
    fetch("/api/videos/list")
      .then((r) => r.json())
      .then((data) => {
        console.log("[ContentHub] Videos loaded:", data.videos?.length);
        setVideos(data.videos || []);
      })
      .catch((e) => console.error("[ContentHub] Video load error:", e))
      .finally(() => setLoadingVideos(false));
  }, []);

  // Load calendar from API (or localStorage as backup)
  useEffect(() => {
    setLoadingPosts(true);
    fetch("/api/calendar/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.posts?.length) {
          setPosts(data.posts);
          localStorage.setItem("bodhi-calendar", JSON.stringify(data.posts));
          console.log("[ContentHub] Posts loaded from API:", data.posts.length);
        }
      })
      .catch(() => {
        // Fallback: localStorage
        try {
          const saved = localStorage.getItem("bodhi-calendar");
          if (saved) setPosts(JSON.parse(saved));
        } catch {}
      })
      .finally(() => setLoadingPosts(false));
  }, []);

  const grouped = posts.reduce<Record<string, CalendarPost[]>>((acc, p) => {
    (acc[p.date] ||= []).push(p);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  const generateVideo = async (postId: string) => {
    setGeneratingPost(postId);
    try {
      const res = await fetch("/api/calendar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, video: data.video, status: "scheduled" } : p));
        // Save to server
        fetch("/api/calendar/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(posts.map(p => p.id === postId ? { ...p, video: data.video, status: "scheduled" } : p)) });
      } else {
        alert("Generate failed: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("Generate error: " + e.message);
    }
    setGeneratingPost(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content Hub</h1>
          <p className="text-text-muted mt-1">All your generated videos, scheduled posts, and AI content in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/video" className="btn-zen flex items-center gap-2 text-xs py-2 px-4"><Film size={14} /> New Video</Link>
          <Link href="/content/generate" className="btn-zen flex items-center gap-2 text-xs py-2 px-4 bg-accent/20 hover:bg-accent/30"><Sparkles size={14} /> AI Writer</Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Videos", value: videos.length, icon: Film, color: "text-accent-light" },
          { label: "Scheduled", value: posts.filter(p => p.status === "scheduled").length, icon: Calendar, color: "text-accent-light" },
          { label: "Drafts", value: posts.filter(p => p.status === "draft").length, icon: Edit3, color: "text-text-muted" },
          { label: "Released", value: posts.filter(p => p.status === "released").length, icon: Check, color: "text-success" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass p-4 flex items-center gap-3">
              <Icon size={20} className={stat.color} />
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-[11px] text-text-muted">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Media Gallery ── */}
      <div className="glass p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Media Gallery</h2>
            {!loadingVideos && <span className="text-[10px] text-text-muted">{videos.length} videos</span>}
          </div>
          <Link href="/video" className="text-xs text-accent-light hover:text-accent transition-all flex items-center gap-1"><Plus size={12} /> Generate More</Link>
        </div>
        {loadingVideos ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-accent-light" /></div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Film size={36} className="mx-auto text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">No videos yet. Generate them in the Video Studio.</p>
            <Link href="/video" className="btn-zen inline-flex items-center gap-2 text-xs py-2 px-4 mt-2"><Film size={14} /> Open Video Studio</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, i) => {
              const Icon = platformIcons[video.format] || Film;
              const color = platformColors[video.format] || "text-text-secondary";
              return (
                <div key={i} className="bg-bg-hover rounded-xl border border-border overflow-hidden hover:border-accent/20 transition-all group">
                  <div className="bg-black aspect-video flex items-center justify-center overflow-hidden relative">
                    <video src={video.path} controls muted preload="metadata" className="max-w-full max-h-full" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={color} />
                      <span className="text-xs text-text-secondary capitalize">{video.platform}</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary truncate capitalize">{video.name}</p>
                    <p className="text-[10px] text-text-muted">{video.width}×{video.height} · {video.sizeFormatted}</p>
                    <a href={video.path} download className="flex items-center gap-2 text-xs text-accent-light hover:text-accent transition-all py-1.5 px-3 rounded-lg bg-accent/5 hover:bg-accent/10 w-fit"><Download size={12} /> Download</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content Calendar ── */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Scheduled Posts</h2>
            <span className="text-[10px] text-text-muted">{posts.length} posts</span>
          </div>
          <Link href="/social" className="text-xs text-accent-light hover:text-accent transition-all">Manage on Social →</Link>
        </div>
        {loadingPosts ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-accent-light" /></div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <h3 className="text-xs font-semibold text-accent-light">{formatDate(date)}</h3>
                  <span className="text-[10px] text-text-muted">{grouped[date].length} post{grouped[date].length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2 pl-4 border-l border-border ml-1">
                  {grouped[date].map((post) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-bg-hover/50">
                      <Clapperboard size={18} className="text-red-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-text-primary truncate">{post.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusBadge[post.status]}`}>{post.status}</span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{post.caption}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-text-muted flex items-center gap-1"><Clock size={10} /> {post.time}</span>
                          {post.video ? (
                            <span className="text-[10px] text-accent-light flex items-center gap-1"><Play size={10} /> video ready</span>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); generateVideo(post.id); }}
                              disabled={generatingPost === post.id}
                              className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all disabled:opacity-50">
                              {generatingPost === post.id ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                              {generatingPost === post.id ? "generating..." : "generate video"}
                            </button>
                          )}
                          <span className="text-[10px] text-text-muted truncate">{post.hashtags}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
