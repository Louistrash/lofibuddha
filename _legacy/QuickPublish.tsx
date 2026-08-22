"use client";

import { useState } from "react";
import { Send, Loader2, Check, AlertCircle, Music } from "lucide-react";

interface QuickPublishProps {
  videoPath?: string;
  defaultCaption?: string;
}

export default function QuickPublish({ videoPath: initialVideo, defaultCaption }: QuickPublishProps) {
  const [videoPath, setVideoPath] = useState(initialVideo || "");
  const [caption, setCaption] = useState(defaultCaption || "");
  const [hashtags, setHashtags] = useState("#lofi #mindfulness #meditation");
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handlePublish = async () => {
    if (!videoPath) return;
    setPublishing(true);
    setResult(null);

    try {
      const fullCaption = caption + "\n\n" + hashtags + "\n\n🌿 lofibuddha.com";
      const res = await fetch("/api/tiktok/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoPath, caption: fullCaption }),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ success: true, message: `Published! ID: ${data.publish_id}` });
        setVideoPath("");
        setCaption("");
      } else {
        setResult({ success: false, message: data.error || "Publish failed" });
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="glass p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
        <Send size={14} />Quick Publish to TikTok
      </h3>

      {/* Video path */}
      <div>
        <label className="text-xs text-text-muted font-medium block mb-1.5">Video URL</label>
        <input
          type="text"
          value={videoPath}
          onChange={(e) => setVideoPath(e.target.value)}
          placeholder="/videos/video-9x16-....mp4"
          className="w-full bg-bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-colors font-mono"
        />
      </div>

      {/* Caption */}
      <div>
        <label className="text-xs text-text-muted font-medium block mb-1.5">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your caption..."
          rows={3}
          className="w-full bg-bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-colors resize-none"
        />
      </div>

      {/* Hashtags */}
      <div>
        <label className="text-xs text-text-muted font-medium block mb-1.5">Hashtags</label>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          className="w-full bg-bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        disabled={!videoPath || publishing}
        className="btn-zen flex items-center gap-2 w-full justify-center"
      >
        {publishing ? (
          <><Loader2 size={14} className="animate-spin" />Publishing...</>
        ) : (
          <><Send size={14} />Publish to TikTok</>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${result.success ? "bg-success/10 text-success" : "bg-red-400/10 text-red-400"}`}>
          {result.success ? <Check size={14} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
          <span>{result.message}</span>
        </div>
      )}

      {/* YouTube placeholder */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Music size={12} />
          <span>YouTube publishing available when GOOGLE credentials are configured</span>
        </div>
      </div>
    </div>
  );
}
