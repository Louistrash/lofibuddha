"use client";

import { useEffect, useState } from "react";
import {
  Clapperboard, Music2, Camera, Globe, MapPin, Calendar,
  Download, Film, Loader2, Tv, Smartphone, Square, Play,
  Send, Edit3, Trash2, Plus, X, Check, Clock, PlaySquare,
} from "lucide-react";

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
  format?: string;
  template?: string;
  video: string;
  status: "draft" | "scheduled" | "released";
  hashtags: string;
  background?: string;
}

interface TikTokProfile {
  connected: boolean;
  displayName?: string;
  avatar?: string;
  bio?: string;
  followers?: number;
  likes?: number;
  videos?: number;
}

// ── Platform config ──

const platformUrls: Record<string, string> = {
  YouTube: "https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A",
  TikTok: "https://www.tiktok.com/@lofibuddha",
  Instagram: "https://www.instagram.com/lofibuddha",
  Facebook: "https://www.facebook.com/lofibuddha",
};

const platforms = [
  { label: "YouTube", icon: Clapperboard, color: "text-red-400" },
  { label: "TikTok", icon: Music2, color: "text-pink-400" },
  { label: "Instagram", icon: Camera, color: "text-purple-400" },
  { label: "Facebook", icon: Globe, color: "text-blue-400" },
  { label: "Pinterest", icon: MapPin, color: "text-red-300" },
];

const platformIcons: Record<string, typeof Tv> = {
  youtube: Clapperboard, shorts: Smartphone, square: Square,
};
const platformColors: Record<string, string> = {
  youtube: "text-red-400", shorts: "text-pink-400", square: "text-purple-400",
};

// ── Pre-filled calendar data ──

function getNextDays(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function generateCalendarPosts(): CalendarPost[] {
  const days = getNextDays();
  const posts: CalendarPost[] = [
    {
      id: "1", title: "Morning Yoga Flow — 10 min Gentle Stretch",
      caption: "Start your day with this gentle morning yoga flow.\nPerfect for beginners — no equipment needed.\n\n🎵 Lofi beats by lofibuddha.com",
      date: days[0], time: "08:00", platform: "youtube",
      video: "/videos/youtube/zen-lofi-youtube.mp4",
      status: "draft",
      hashtags: "#yoga #morningroutine #lofi #mindfulness #lofibuddha",
    },
    {
      id: "2", title: "Deep Focus Lofi — Study & Work Session",
      caption: "1 hour of deep focus lofi beats.\nNo interruptions, just pure concentration.\n\n🧘 lofibuddha.com",
      date: days[0], time: "12:00", platform: "youtube",
      video: "/videos/youtube/zen-lofi-youtube.mp4",
      status: "draft",
      hashtags: "#lofi #studybeats #focus #workmusic #lofibuddha",
    },
    {
      id: "3", title: "Guided Breathwork — 5 Min Reset",
      caption: "A short guided breathwork session to reset your mind.\nBreathe in... hold... breathe out.\n\n🌸 lofibuddha.com",
      date: days[1], time: "08:00", platform: "youtube",
      video: "/videos/square/zen-lofi-square.mp4",
      status: "draft",
      hashtags: "#breathwork #meditation #mindfulness #stressrelief #lofibuddha",
    },
    {
      id: "4", title: "Evening Wind Down — Lofi + Rain Sounds",
      caption: "Unwind after a long day with soft lofi and rain.\nLet your thoughts settle like sand in water.\n\n🌙 lofibuddha.com",
      date: days[2], time: "21:00", platform: "youtube",
      video: "/videos/youtube/zen-lofi-youtube.mp4",
      status: "draft",
      hashtags: "#lofi #rainsounds #sleepmusic #relaxation #lofibuddha",
    },
    {
      id: "5", title: "Lofi Mix #12 — Chillhop & Jazzhop",
      caption: "The latest lofi mix — handpicked chillhop & jazzhop beats.\nPerfect background music for any moment.\n\n🎧 lofibuddha.com",
      date: days[3], time: "10:00", platform: "youtube",
      video: "/videos/youtube/zen-lofi-youtube.mp4",
      status: "draft",
      hashtags: "#lofi #chillhop #jazzhop #mixtape #lofibuddha",
    },
    {
      id: "6", title: "Yoga for Back Pain — 15 Min Relief",
      caption: "Gentle stretches to relieve lower back pain.\nAll levels welcome. Listen to your body.\n\n🧘 lofibuddha.com",
      date: days[4], time: "08:00", platform: "youtube",
      video: "/videos/square/zen-lofi-square.mp4",
      status: "draft",
      hashtags: "#yoga #backpain #stretching #wellness #lofibuddha",
    },
    {
      id: "7", title: "Sunday Slow Down — Meditation & Journaling",
      caption: "A slow Sunday session for meditation and journaling.\nTake time for yourself today.\n\n📝 lofibuddha.com",
      date: days[5], time: "09:00", platform: "youtube",
      video: "/videos/youtube/zen-lofi-youtube.mp4",
      status: "draft",
      hashtags: "#sunday #meditation #journaling #selfcare #lofibuddha",
    },
    {
      id: "8", title: "Lofi for Sleep — Deep Rest Mix",
      caption: "Fall asleep to this calming lofi mix.\nDeep rest is the foundation of a clear mind.\n\n💤 lofibuddha.com",
      date: days[6], time: "22:00", platform: "youtube",
      video: "/videos/youtube/zen-lofi-youtube.mp4",
      status: "draft",
      hashtags: "#lofi #sleepmusic #deepsleep #rest #lofibuddha",
    },
  ];
  return posts;
}

// ── Helpers ──

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const statusBadge: Record<string, string> = {
  draft: "bg-bg-hover text-text-muted",
  scheduled: "bg-accent/10 text-accent-light",
  released: "bg-success/10 text-success",
};

// ── Component ──

export default function SocialPage() {
  // Gallery
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Calendar
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CalendarPost | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [renderingPosts, setRenderingPosts] = useState<Set<string>>(new Set());

  // TikTok connection
  const [tiktokProfile, setTiktokProfile] = useState<TikTokProfile | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(true);
  const [tiktokConnecting, setTiktokConnecting] = useState(false);

  // Direct TikTok Publishing
  const [activePublishVideo, setActivePublishVideo] = useState<VideoEntry | null>(null);
  const [publishCaption, setPublishCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // YouTube Review & Draft Upload
  const [reviewVideo, setReviewVideo] = useState<VideoEntry | null>(null);
  const [ytTitle, setYtTitle] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [ytTags, setYtTags] = useState("");
  const [ytUploading, setYtUploading] = useState(false);
  const [ytSuccess, setYtSuccess] = useState<string | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytStatus, setYtStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");

  // Load videos
  useEffect(() => {
    fetch("/api/videos/list")
      .then((r) => r.json())
      .then((data) => setVideos(data.videos || []))
      .catch(() => setVideos([]))
      .finally(() => setLoadingVideos(false));
  }, []);

  // Load calendar posts (API first, localStorage fallback)
  useEffect(() => {
    setLoadingPosts(true);
    fetch("/api/calendar/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.posts?.length) {
          setPosts(data.posts);
          localStorage.setItem("bodhi-calendar", JSON.stringify(data.posts));
        }
      })
      .catch(() => {
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem("bodhi-calendar");
          if (saved) {
            setPosts(JSON.parse(saved));
          } else {
            const defaults = generateCalendarPosts();
            setPosts(defaults);
            localStorage.setItem("bodhi-calendar", JSON.stringify(defaults));
          }
        } catch {
          setPosts(generateCalendarPosts());
        }
      })
      .finally(() => setLoadingPosts(false));
  }, []);

  // Check TikTok connection status
  useEffect(() => {
    fetch("/api/tiktok/auth?action=status")
      .then((r) => r.json())
      .then((data) => {
        if (data.connected) {
          // Fetch profile if connected
          return fetch("/api/tiktok/profile").then((r) => r.json());
        }
        return { connected: false };
      })
      .then((profile) => setTiktokProfile(profile))
      .catch(() => setTiktokProfile({ connected: false }))
      .finally(() => setTiktokLoading(false));
  }, []);

  // Check YouTube connection status
  useEffect(() => {
    fetch("/api/youtube/auth?action=status")
      .then((r) => r.json())
      .then((d) => setYtStatus(d.connected ? "connected" : "disconnected"))
      .catch(() => setYtStatus("disconnected"));
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tiktok = params.get("tiktok");
    if (tiktok === "connected") {
      setTiktokLoading(true);
      fetch("/api/tiktok/profile")
        .then((r) => r.json())
        .then((p) => setTiktokProfile(p))
        .finally(() => setTiktokLoading(false));
      window.history.replaceState({}, "", "/social");
    }
  }, []);

  const handleTikTokConnect = () => {
    setTiktokConnecting(true);
    window.location.href = "/api/tiktok/auth?action=login";
  };

  const handleTikTokDisconnect = async () => {
    setTiktokLoading(true);
    await fetch("/api/tiktok/auth?action=disconnect");
    setTiktokProfile({ connected: false });
    setTiktokLoading(false);
  };

  const savePosts = (updated: CalendarPost[]) => {
    setPosts(updated);
    localStorage.setItem("bodhi-calendar", JSON.stringify(updated));
  };

  // ── Direct TikTok Publishing Handlers ──

  const handleOpenPublish = (video: VideoEntry) => {
    setActivePublishVideo(video);
    setPublishCaption(`Quiet moments of Zen reflection. ✨🧘\n\nGenerated with lofibuddha.com\n\n#zen #meditation #lofi #mindfulness #lofibuddha`);
    setPublishSuccess(null);
    setPublishError(null);
    setPublishing(false);
  };

  const handlePublishToTikTok = async () => {
    if (!activePublishVideo) return;
    setPublishing(true);
    setPublishSuccess(null);
    setPublishError(null);

    try {
      const response = await fetch("/api/tiktok/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoPath: activePublishVideo.path,
          caption: publishCaption,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setPublishError(data.error);
      } else {
        setPublishSuccess("Successfully posted to TikTok! Video is now queueing/processing on your TikTok account.");
      }
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish video. Please check connection.");
    } finally {
      setPublishing(false);
    }
  };

  // ── YouTube Review & Draft Upload ──

  /** Slimme titel/beschrijving op basis van bestandsnaam + platform */
  const buildYouTubeMeta = (video: VideoEntry) => {
    const name = video.name.replace(/\.mp4$/, "").replace(/[-_]+/g, " ").trim();
    const title = `Lofi Buddha — ${name}`;
    const platform = video.format === "shorts" ? "shorts" : video.format === "square" ? "square" : "video";
    const description =
      `🌿 ${name} — calm sounds for ${platform === "shorts" ? "your moment of peace" : "meditation and focus"}.\n\n` +
      `Breathe in. Let go. Find your calm at lofibuddha.com.\n\n` +
      `🎧 More soundscapes & guided meditations: https://lofibuddha.com/mindfulness\n` +
      `💬 Chat with Buddha: https://lofibuddha.com/chat`;
    return { title, description, tags: ["lofi", "meditation", "mindfulness", "calm", "lofibuddha"] };
  };

  const handleOpenReview = (video: VideoEntry) => {
    setReviewVideo(video);
    const meta = buildYouTubeMeta(video);
    setYtTitle(meta.title);
    setYtDescription(meta.description);
    setYtTags(meta.tags.join(", "));
    setYtSuccess(null);
    setYtError(null);
    setYtUploading(false);
  };

  const handleUploadToYouTube = async () => {
    if (!reviewVideo) return;
    setYtUploading(true);
    setYtSuccess(null);
    setYtError(null);

    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoPath: reviewVideo.path,
          title: ytTitle,
          description: ytDescription,
          tags: ytTags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setYtError(data.error);
      } else {
        setYtSuccess(
          `✅ Uploaded as DRAFT to YouTube Studio.\n${data.url}\n\nReview & publish it there when ready.`
        );
      }
    } catch (err: any) {
      setYtError(err.message || "Failed to upload video.");
    } finally {
      setYtUploading(false);
    }
  };

  // ── Actions ──

  const handleDelete = (id: string) => {
    savePosts(posts.filter((p) => p.id !== id));
  };

  const handleEdit = (post: CalendarPost) => {
    setEditingId(post.id);
    setEditForm({ ...post });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    savePosts(posts.map((p) => (p.id === editingId ? editForm : p)));
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleRelease = (id: string) => {
    savePosts(posts.map((p) => (p.id === id ? { ...p, status: "scheduled" as const } : p)));
  };

  const handleRenderVideo = async (post: CalendarPost) => {
    setRenderingPosts((prev) => new Set(prev).add(post.id));
    try {
      const sizeMap: Record<string, string> = { youtube: "youtube", tiktok: "tiktok", shorts: "shorts", square: "square" };
      const format = sizeMap[post.format || "youtube"] || "youtube";
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: post.template || "zen-lofi",
          size: format,
          caption: post.caption,
          subtitle: post.title,
          duration: 30,
          background: post.background || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const videoPath = `/videos/${data.output}`;
        savePosts(posts.map((p) => (p.id === post.id ? { ...p, video: videoPath } : p)));
      }
    } catch (err) {
      console.error("Render failed:", err);
    } finally {
      setRenderingPosts((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    }
  };

  const handleAddPost = () => {
    const newPost: CalendarPost = {
      id: String(Date.now()),
      title: "New Post",
      caption: "Write your caption here...",
      date: new Date().toISOString().split("T")[0],
      time: "12:00",
      platform: "youtube",
      video: videos[0]?.path || "",
      status: "draft",
      hashtags: "#lofibuddha",
    };
    savePosts([newPost, ...posts]);
    setShowAdd(false);
  };

  // Group posts by date
  const grouped = posts.reduce<Record<string, CalendarPost[]>>((acc, p) => {
    (acc[p.date] ||= []).push(p);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Social Automation</h1>
        <p className="text-text-muted mt-1">
          Connect accounts, schedule posts, and publish across platforms.
        </p>
      </div>

      {/* ── Connected Platforms ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {platforms.map((p) => {
          const Icon = p.icon;
          const url = platformUrls[p.label];
          const isTikTok = p.label === "TikTok";
          const isConnected = isTikTok ? tiktokProfile?.connected : true;

          const card = (
            <div
              key={p.label}
              className={`glass p-4 flex flex-col items-center gap-3 transition-all ${
                isConnected ? "border-accent/30 cursor-default" : "opacity-60 cursor-pointer hover:border-accent/30 hover:opacity-80"
              }`}
            >
              <Icon size={24} className={p.color} />
              <span className="text-xs font-medium text-text-secondary">{p.label}</span>

              {/* TikTok profile info */}
              {isTikTok && tiktokLoading ? (
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" /> Checking...
                </span>
              ) : isTikTok && tiktokProfile?.connected ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success">Connected</span>
                  {tiktokProfile.displayName && (
                    <span className="text-[10px] text-text-muted">@{tiktokProfile.displayName}</span>
                  )}
                  {tiktokProfile.followers !== undefined && (
                    <span className="text-[10px] text-text-muted">{tiktokProfile.followers.toLocaleString()} followers</span>
                  )}
                  <button
                    onClick={handleTikTokDisconnect}
                    className="text-[10px] text-error/70 hover:text-error mt-1 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : isTikTok && !tiktokProfile?.connected ? (
                <button
                  onClick={handleTikTokConnect}
                  disabled={tiktokConnecting}
                  className="text-[10px] px-3 py-1 rounded-full bg-accent/10 text-accent-light hover:bg-accent/20 transition-all disabled:opacity-50"
                >
                  {tiktokConnecting ? "Connecting..." : "Connect TikTok"}
                </button>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success">
                  Connected
                </span>
              )}
            </div>
          );
          return isTikTok ? (
            card
          ) : url ? (
            <a key={p.label} href={url} target="_blank" rel="noopener noreferrer" className="no-underline">
              {card}
            </a>
          ) : card;
        })}
      </div>

      {/* ── Content Calendar ── */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Content Calendar
            </h2>
            <span className="text-[10px] text-text-muted">
              {posts.length} post{posts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-zen flex items-center gap-2 text-xs py-2 px-4"
          >
            <Plus size={14} />
            Add Post
          </button>
        </div>

        {/* Add new post form */}
        {showAdd && (
          <div className="bg-bg-hover rounded-xl border border-accent/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-secondary uppercase">New Post</h3>
              <button onClick={() => setShowAdd(false)} className="text-text-muted hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Title</label>
                <input
                  type="text" defaultValue="New Post"
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                  id="new-title"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Date</label>
                <input
                  type="date" defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                  id="new-date"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Time</label>
                <input
                  type="time" defaultValue="12:00"
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                  id="new-time"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted block mb-1">Video</label>
                <select
                  className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                  id="new-video"
                >
                  <option value="">No video</option>
                  {videos.map((v, i) => (
                    <option key={i} value={v.path}>{v.platform} — {v.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={handleAddPost} className="btn-zen text-xs py-1.5 px-4">
              Create
            </button>
          </div>
        )}

        {/* Calendar days */}
        {loadingPosts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-accent-light" />
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <h3 className="text-xs font-semibold text-accent-light">{formatDate(date)}</h3>
                  <span className="text-[10px] text-text-muted">
                    {grouped[date].length} post{grouped[date].length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2 pl-4 border-l border-border ml-1">
                  {grouped[date].map((post) => (
                    <div key={post.id}>
                      {editingId === post.id && editForm ? (
                        /* ── Edit Mode ── */
                        <div className="bg-bg-hover rounded-xl border border-accent/30 p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-[10px] text-text-muted block mb-1">Title</label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] text-text-muted block mb-1">Caption</label>
                              <textarea
                                rows={3}
                                value={editForm.caption}
                                onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50 resize-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-text-muted block mb-1">Date</label>
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-text-muted block mb-1">Time</label>
                              <input
                                type="time"
                                value={editForm.time}
                                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] text-text-muted block mb-1">Hashtags</label>
                              <input
                                type="text"
                                value={editForm.hashtags}
                                onChange={(e) => setEditForm({ ...editForm, hashtags: e.target.value })}
                                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={handleSaveEdit} className="btn-zen text-xs py-1.5 px-4 flex items-center gap-1">
                              <Check size={14} /> Save
                            </button>
                            <button onClick={handleCancelEdit} className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── View Mode ── */
                        <div className={`flex items-start gap-3 p-3 rounded-xl border border-border bg-bg-hover/50 hover:border-accent/20 transition-all group ${post.status === "released" ? "opacity-60" : ""}`}>
                          <div className="flex-shrink-0 mt-1">
                            <Clapperboard size={18} className="text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-text-primary truncate">{post.title}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusBadge[post.status]}`}>
                                {post.status}
                              </span>
                            </div>
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{post.caption}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-text-muted flex items-center gap-1">
                                <Clock size={10} /> {post.time}
                              </span>
                              {post.video && (
                                <span className="text-[10px] text-accent-light flex items-center gap-1">
                                  <Play size={10} /> video
                                </span>
                              )}
                              <span className="text-[10px] text-text-muted truncate">{post.hashtags}</span>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {post.status === "draft" && (
                              <button
                                onClick={() => handleRelease(post.id)}
                                className="p-1.5 rounded-lg hover:bg-accent/10 text-accent-light hover:text-accent transition-all"
                                title="Schedule for release"
                              >
                                <Send size={14} />
                              </button>
                            )}
                            {!post.video && (
                              <button
                                onClick={() => handleRenderVideo(post)}
                                disabled={renderingPosts.has(post.id)}
                                className="p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-all disabled:opacity-50"
                                title="Render video"
                              >
                                {renderingPosts.has(post.id) ? <Loader2 size={14} className="animate-spin" /> : <Film size={14} />}
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-all"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="p-1.5 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Media Gallery ── */}
      <div className="glass p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Film size={18} className="text-accent-light" />
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Media Gallery
          </h2>
          {!loadingVideos && (
            <span className="text-[10px] text-text-muted ml-2">
              {videos.length} video{videos.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingVideos ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent-light" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Film size={36} className="mx-auto text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">
              No videos yet. Generate them in the Video Studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, i) => {
              const Icon = platformIcons[video.format] || Film;
              const color = platformColors[video.format] || "text-text-secondary";
              return (
                <div
                  key={i}
                  className="bg-bg-hover rounded-xl border border-border overflow-hidden hover:border-accent/20 transition-all group"
                >
                  <div className="bg-black aspect-video flex items-center justify-center overflow-hidden relative">
                    <video
                      src={video.path}
                      controls muted preload="metadata"
                      className="max-w-full max-h-full"
                    >
                      <Play size={32} className="text-white/60" />
                    </video>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={color} />
                      <span className="text-xs text-text-secondary capitalize">{video.platform}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary truncate capitalize">{video.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {video.width}×{video.height} · {video.sizeFormatted}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <a
                        href={video.path} download
                        className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-all py-1.5 px-3 rounded-lg bg-bg-card hover:bg-bg-hover w-fit border border-border"
                      >
                        <Download size={12} /> Download
                      </a>
                      <button
                        onClick={() => handleOpenPublish(video)}
                        className="flex items-center gap-2 text-xs text-accent-light hover:text-accent transition-all py-1.5 px-3 rounded-lg bg-accent/10 hover:bg-accent/20 w-fit border border-accent/20"
                      >
                        <Send size={12} /> Publish to TikTok
                      </button>
                      <button
                        onClick={() => handleOpenReview(video)}
                        className="flex items-center gap-2 text-xs text-red-300 hover:text-red-200 transition-all py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 w-fit border border-red-400/20"
                      >
                        <PlaySquare size={12} /> Review → YouTube draft
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Direct TikTok Publish Modal ── */}
      {activePublishVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass max-w-md w-full p-6 space-y-4 relative border border-accent/20">
            <button
              onClick={() => setActivePublishVideo(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text-primary">Publish to TikTok</h3>
              <p className="text-xs text-text-muted">
                Post your lofi video directly to your connected TikTok account.
              </p>
            </div>

            {/* Video preview */}
            <div className="bg-black aspect-video rounded-xl overflow-hidden flex items-center justify-center border border-border">
              <video
                src={activePublishVideo.path}
                controls muted preload="metadata"
                className="max-h-full"
              />
            </div>

            {/* Connection Check */}
            {!tiktokProfile?.connected ? (
              <div className="bg-error/10 border border-error/20 p-4 rounded-xl space-y-3 text-center">
                <p className="text-xs text-error">TikTok account is not connected.</p>
                <button
                  onClick={() => {
                    setActivePublishVideo(null);
                    handleTikTokConnect();
                  }}
                  className="text-xs font-semibold px-4 py-2 bg-error/20 hover:bg-error/30 text-error-light rounded-lg transition-all"
                >
                  Connect Account Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-hover border border-border">
                  {tiktokProfile.avatar && (
                    <img src={tiktokProfile.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-accent/20" />
                  )}
                  <span className="text-xs font-medium text-text-primary">@{tiktokProfile.displayName}</span>
                  <span className="text-[10px] text-text-muted ml-auto">{tiktokProfile.followers?.toLocaleString()} followers</span>
                </div>

                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Video Caption & Hashtags</label>
                  <textarea
                    rows={4}
                    value={publishCaption}
                    onChange={(e) => setPublishCaption(e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-sm text-text-primary outline-none focus:border-accent/50 resize-none font-sans"
                    maxLength={150}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-text-muted">Max 150 characters (recommended for shorts)</span>
                    <span className="text-[10px] text-text-muted">{publishCaption.length}/150</span>
                  </div>
                </div>

                {publishSuccess && (
                  <div className="bg-success/15 border border-success/35 text-success text-xs p-3 rounded-xl">
                    {publishSuccess}
                  </div>
                )}

                {publishError && (
                  <div className="bg-error/15 border border-error/35 text-error text-xs p-3 rounded-xl">
                    {publishError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActivePublishVideo(null)}
                    disabled={publishing}
                    className="text-xs text-text-muted hover:text-text-primary px-4 py-2 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublishToTikTok}
                    disabled={publishing}
                    className="btn-zen text-xs py-2 px-5 flex items-center gap-2"
                  >
                    {publishing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Publish Direct
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── YouTube Review & Draft Upload Modal ── */}
      {reviewVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass max-w-2xl w-full p-6 space-y-4 relative border border-red-400/20 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setReviewVideo(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <PlaySquare size={16} className="text-red-400" /> Review → Upload as Draft
              </h3>
              <p className="text-xs text-text-muted">
                Bekijk en beluister de video, pas titel/beschrijving aan, en upload als <b>draft</b> naar YouTube Studio. Niets wordt gepubliceerd zonder jouw goedkeuring.
              </p>
            </div>

            {/* Video preview — met geluid! */}
            <div className="bg-black aspect-video rounded-xl overflow-hidden flex items-center justify-center border border-border">
              <video
                src={reviewVideo.path}
                controls
                preload="metadata"
                autoPlay
                className="max-h-full w-full"
              />
            </div>

            {/* YouTube connection check */}
            {ytStatus !== "connected" ? (
              <div className="bg-error/10 border border-error/20 p-4 rounded-xl space-y-3 text-center">
                <p className="text-xs text-error">
                  YouTube is niet verbonden. Verbind eerst je Google account om als draft te uploaden.
                </p>
                <a
                  href="/api/youtube/auth?action=login"
                  className="inline-block text-xs font-semibold px-4 py-2 bg-error/20 hover:bg-error/30 text-error-light rounded-lg transition-all"
                >
                  Connect YouTube Account
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Title */}
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Video Title</label>
                  <input
                    value={ytTitle}
                    onChange={(e) => setYtTitle(e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-sm text-text-primary outline-none focus:border-accent/50 font-sans"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Description (met deeplinks)</label>
                  <textarea
                    rows={6}
                    value={ytDescription}
                    onChange={(e) => setYtDescription(e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-sm text-text-primary outline-none focus:border-accent/50 resize-none font-sans"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Tags (komma-gescheiden)</label>
                  <input
                    value={ytTags}
                    onChange={(e) => setYtTags(e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-lg p-3 text-sm text-text-primary outline-none focus:border-accent/50 font-sans"
                  />
                </div>

                {/* Deeplink preview */}
                <div className="bg-bg-hover border border-border rounded-xl p-3">
                  <span className="text-[10px] text-text-muted block mb-1">Deeplink (automatisch uit content)</span>
                  <span className="text-xs text-accent-light break-all">
                    {/(breath|breathe|box)/i.test(ytTitle) && "https://lofibuddha.com/mindfulness/breathe"}
                    {/(sleep|night|drift|rain|unwind|evening)/i.test(ytTitle) && "https://lofibuddha.com/mindfulness/sleep"}
                    {/(relax|body scan|zen|release)/i.test(ytTitle) && "https://lofibuddha.com/mindfulness/relax"}
                    {/(focus|study|work|deep|lofi|beat)/i.test(ytTitle) && "https://lofibuddha.com/mindfulness/focus"}
                    {!/(breath|breathe|box|sleep|night|drift|rain|unwind|evening|relax|body scan|zen|release|focus|study|work|deep|lofi|beat)/i.test(ytTitle) && "https://lofibuddha.com/mindfulness"}
                  </span>
                </div>

                {ytSuccess && (
                  <div className="bg-success/15 border border-success/35 text-success text-xs p-3 rounded-xl whitespace-pre-line">
                    {ytSuccess}
                  </div>
                )}

                {ytError && (
                  <div className="bg-error/15 border border-error/35 text-error text-xs p-3 rounded-xl">
                    {ytError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReviewVideo(null)}
                    disabled={ytUploading}
                    className="text-xs text-text-muted hover:text-text-primary px-4 py-2 transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleUploadToYouTube}
                    disabled={ytUploading}
                    className="btn-zen text-xs py-2 px-5 flex items-center gap-2"
                  >
                    {ytUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <PlaySquare size={14} />
                        Upload as Draft
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
