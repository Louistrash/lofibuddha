"use client";

import { useState } from "react";
import {
  FileText, Hash, Type, Sparkles, Loader2,
  Copy, Check, RefreshCw, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  { id: "youtube", label: "YouTube Script", format: "8-12 min", icon: FileText },
  { id: "tiktok", label: "TikTok Hook", format: "15-60 sec", icon: FileText },
  { id: "shorts", label: "YouTube Shorts", format: "15-60 sec", icon: FileText },
  { id: "captions", label: "Social Captions", format: "Instagram/TikTok", icon: Type },
  { id: "hashtags", label: "Hashtags", format: "25 tags", icon: Hash },
  { id: "blog", label: "Blog Post", format: "800-1500 words", icon: FileText },
];

const SUGGESTED_TOPICS = [
  "morning yoga flow",
  "breathwork for anxiety",
  "lofi study playlist",
  "meditation for beginners",
  "mindful stretching",
  "evening wind-down routine",
  "lofi beats to relax",
  "yoga for back pain",
  "5-minute mindfulness",
  "sleep meditation",
];

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("youtube");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          topic: topic.trim(),
          tone: "warm, calming, inspirational",
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error + (data.detail ? `: ${data.detail}` : ""));
      } else {
        setResult(data.content);
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Back link */}
      <Link href="/content" className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-all">
        <ArrowLeft size={14} />
        Back to Content Hub
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Content Writer</h1>
        <p className="text-text-muted mt-1">
          Generate scripts, captions, hashtags, blog posts, and newsletters with DeepSeek AI.
        </p>
      </div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isActive = type === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setType(t.id); setResult(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent text-bg-primary shadow-lg shadow-accent/20"
                  : "bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-accent/30"
              }`}
            >
              <Icon size={16} />
              {t.label}
              <span className="text-[10px] opacity-60 hidden sm:inline">{t.format}</span>
            </button>
          );
        })}
      </div>

      {/* Input + Generate */}
      <div className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Quick Generate
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Topic, keyword, or idea... (e.g., 'morning yoga flow for beginners')"
            className="flex-1 bg-bg-hover border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-all"
          />
          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="btn-zen flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((tag) => (
            <span
              key={tag}
              onClick={() => setTopic(tag)}
              className="px-3 py-1.5 rounded-lg bg-bg-hover text-xs text-text-secondary hover:text-accent-light hover:bg-accent/10 cursor-pointer transition-all"
            >
              # {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass p-4 border-error/30 bg-error/5 text-error text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Generated Content
            </h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-hover text-xs text-text-secondary hover:text-text-primary transition-all"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={generate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-hover text-xs text-text-secondary hover:text-text-primary transition-all"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            </div>
          </div>
          <div className="bg-bg-hover rounded-xl p-5 max-h-[500px] overflow-y-auto">
            <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
