"use client";

import { useState } from "react";
import {
  FileText, Hash, Type, Sparkles, Loader2,
  Copy, Check, RefreshCw, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button, Card, Chip, PageHeader } from "@/components/ui";

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate");
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
    <div className="space-y-8">
      <Link href="/content" className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-all">
        <ArrowLeft size={14} />
        Back to Content Hub
      </Link>

      <PageHeader
        title="AI Content Writer"
        description="Generate scripts, captions, hashtags, blog posts, and newsletters with DeepSeek AI."
      />

      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <Chip
              key={t.id}
              active={type === t.id}
              onClick={() => { setType(t.id); setResult(""); }}
              icon={<Icon size={14} />}
            >
              {t.label}
              <span className="text-[10px] opacity-60 hidden sm:inline ml-1">{t.format}</span>
            </Chip>
          );
        })}
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Quick Generate
        </h2>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Topic, keyword, or idea... (e.g., 'morning yoga flow for beginners')"
            className="flex-1 bg-bg-hover border border-border rounded-[var(--radius)] px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-all"
          />
          <Button
            onClick={generate}
            disabled={loading || !topic.trim()}
            icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            className="flex-shrink-0"
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((tag) => (
            <Chip key={tag} onClick={() => setTopic(tag)}>#{tag}</Chip>
          ))}
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-error/30 bg-error/5 text-error text-sm">
          {error}
        </Card>
      )}

      {result && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Generated Content
            </h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={copyToClipboard} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={generate} icon={<RefreshCw size={14} />}>
                Regenerate
              </Button>
            </div>
          </div>
          <div className="bg-bg-hover rounded-[var(--radius)] p-5 max-h-[500px] overflow-y-auto">
            <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
              {result}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
