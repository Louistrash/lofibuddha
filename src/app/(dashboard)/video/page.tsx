"use client";

import { useState, useRef, useEffect } from "react";
import {
  Video, Play, Clock, Film, Wand2, Monitor,
  Loader2, Download, CheckCircle2, Smartphone, Tv, Square, Image as ImageIcon,
} from "lucide-react";

type Size = "shorts" | "youtube" | "square";
type Status = "idle" | "rendering" | "done" | "error";

interface VideoResult {
  success: boolean;
  video?: string;
  details?: { width: number; height: number; duration: number };
  error?: string;
}

const sizes: { key: Size; label: string; dims: string; icon: typeof Smartphone; desc: string }[] = [
  { key: "shorts", label: "Shorts / TikTok", dims: "1080×1920", icon: Smartphone, desc: "9:16 vertical" },
  { key: "youtube", label: "YouTube", dims: "1920×1080", icon: Tv, desc: "16:9 landscape" },
  { key: "square", label: "Instagram / Post", dims: "1080×1080", icon: Square, desc: "1:1 square" },
];

const templates = [
  { key: "zen-lofi", label: "Zen Lofi", desc: "Rain + warm glow + floating particles", icon: Wand2 },
  { key: "meditation", label: "Meditation", desc: "Slow breathing + ambient light", icon: Play },
  { key: "study", label: "Study Beats", desc: "Cozy room + soft focus", icon: Monitor },
  { key: "quotes", label: "Quote Short", desc: "Minimal text + cinematic zoom", icon: Film },
];

export default function VideoPage() {
  const [size, setSize] = useState<Size>("shorts");
  const [duration, setDuration] = useState(30);
  const [caption, setCaption] = useState("Relax and unwind.\nYour mind deserves silence.");
  const [subtitle, setSubtitle] = useState("Mindfulness & Relaxation");
  const [template, setTemplate] = useState("zen-lofi");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState("");
  const [background, setBackground] = useState("");
  const [bgImages, setBgImages] = useState<{name:string; path:string; url:string}[]>([]);

  const handleGenerate = async () => {
    setStatus("rendering");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size, duration, caption, subtitle, template, background }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStatus("done");
      } else {
        setError(data.error || "Unknown error");
        setStatus("error");
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  const loadBgImages = async () => {
    try {
      const res = await fetch("/api/images/list");
      const data = await res.json();
      setBgImages(data.images || []);
    } catch { setBgImages([]); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Video Studio</h1>
        <p className="text-text-muted mt-1">
          HyperFrames-powered generation — HTML to MP4 with animations, rain, particles & zen effects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Controls ── */}
        <div className="glass p-5 space-y-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Settings</h2>

          {/* Size selector */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSize(s.key)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    size === s.key
                      ? "border-accent bg-accent/10 text-accent-light"
                      : "border-border bg-bg-hover text-text-muted hover:border-accent/30"
                  }`}
                >
                  <s.icon size={18} className="mx-auto mb-1" />
                  <span className="text-[11px] font-medium block">{s.label}</span>
                  <span className="text-[9px] opacity-60">{s.dims}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">
              Duration: <span className="text-accent-light">{duration}s</span>
            </label>
            <input
              type="range"
              min={10}
              max={120}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>10s</span><span>60s</span><span>120s</span>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">Caption</label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Your video caption..."
              className="w-full bg-bg-hover border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 resize-none"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">Subtitle (brand tagline)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Mindfulness & Relaxation"
              className="w-full bg-bg-hover border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
            />
          </div>

          {/* Background Image Picker */}
          <div>
            <label className="text-xs text-text-muted mb-2 block">
              Background Image <span className="text-accent-light">(from gallery)</span>
            </label>
            {bgImages.length === 0 ? (
              <button onClick={loadBgImages}
                className="w-full p-3 rounded-xl border border-dashed border-border text-xs text-text-muted hover:border-accent/40 hover:text-text-secondary transition-all">
                <ImageIcon size={14} className="inline mr-1" /> Load images from gallery
              </button>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                <button
                  onClick={() => setBackground("")}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                    !background ? "border-accent bg-accent/10" : "border-border bg-bg-hover hover:border-accent/30"
                  }`}>
                  <span className="text-[9px] text-text-muted text-center">None</span>
                </button>
                {bgImages.slice(0, 8).map((img) => (
                  <button key={img.path}
                    onClick={() => setBackground(img.path)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden transition-all ${
                      background === img.path ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40"
                    }`}>
                    <img src={img.path} alt={img.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={status === "rendering"}
            className="btn-zen flex items-center gap-2 px-6 py-3 w-full justify-center disabled:opacity-50"
          >
            {status === "rendering" ? (
              <><Loader2 size={18} className="animate-spin" /> Rendering...</>
            ) : (
              <><Wand2 size={18} /> Generate Video</>
            )}
          </button>

          {/* Error */}
          {error && (
            <p className="text-xs text-error bg-error/5 p-3 rounded-xl">{error}</p>
          )}
        </div>

        {/* ── Right: Preview / Result ── */}
        <div className="glass p-5 space-y-4 flex flex-col">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Preview</h2>

          {status === "idle" && (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              <div className="text-center space-y-3">
                <Video size={48} className="mx-auto opacity-30" />
                <p className="text-sm">Configure your video and press Generate</p>
              </div>
            </div>
          )}

          {status === "rendering" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 size={48} className="mx-auto animate-spin text-accent-light" />
                <p className="text-sm text-text-secondary">Rendering your video...</p>
                <p className="text-xs text-text-muted">
                  {size === "shorts" ? "1080×1920" : size === "youtube" ? "1920×1080" : "1080×1080"} · {duration}s
                </p>
              </div>
            </div>
          )}

          {status === "done" && result && (
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Video generated!</span>
              </div>

              {/* Video player */}
              <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center aspect-[9/16] max-h-[400px]">
                <video
                  src={result.video}
                  controls
                  autoPlay
                  loop
                  muted
                  className="max-w-full max-h-full"
                />
              </div>

              {/* Details */}
              {result.details && (
                <div className="flex gap-4 text-xs text-text-muted">
                  <span>{result.details.width}×{result.details.height}</span>
                  <span>{result.details.duration}s</span>
                </div>
              )}

              {/* Download */}
              {result.video && (
                <a
                  href={result.video}
                  download
                  className="btn-zen flex items-center gap-2 px-4 py-2 text-xs w-fit"
                >
                  <Download size={14} />
                  Download MP4
                </a>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-error">Failed to generate video. Check the console.</p>
            </div>
          )}
        </div>
      </div>

      {/* Templates info */}
      <div className="glass p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => setTemplate(t.key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                template === t.key
                  ? "border-accent bg-accent/5"
                  : "border-border bg-bg-hover hover:border-accent/30"
              }`}
            >
              <t.icon size={20} className="text-accent-light mb-2" />
              <h3 className="text-sm font-medium text-text-primary">{t.label}</h3>
              <p className="text-[11px] text-text-muted mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
