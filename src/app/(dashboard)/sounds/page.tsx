"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Music, Upload, Loader2, Trash2, Copy, Check, Play } from "lucide-react";
import { Card, Chip, PageHeader, Spinner } from "@/components/ui";

interface Track {
  id: string;
  title: string;
  mood: string;
  tags: string[];
  fileUrl: string;
  createdAt: string;
}

const MOODS = ["calm", "sea", "rain", "forest", "sleep", "focus"];

export default function SoundsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mood, setMood] = useState("calm");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTracks = useCallback(async () => {
    try {
      const res = await fetch("/api/music");
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch {
      setTracks([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTracks(); }, [loadTracks]);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("mood", mood);
        await fetch("/api/music/upload", { method: "POST", body: fd });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setUploading(false);
    loadTracks();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  const deleteTrack = async (id: string) => {
    try {
      await fetch(`/api/music?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      loadTracks();
    } catch {}
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sounds Library"
        description="Upload ambient soundscapes — sea, rain, forest, ocean — for focus and sleep sessions."
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-muted mr-1">Mood:</span>
        {MOODS.map((m) => (
          <Chip key={m} active={mood === m} onClick={() => setMood(m)}>
            {m}
          </Chip>
        ))}
      </div>

      <Card
        dashed
        interactive
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`p-10 flex flex-col items-center gap-4 cursor-pointer ${
          dragOver ? "border-accent/60 bg-accent/5" : "hover:border-accent/40"
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          {uploading ? <Loader2 size={26} className="text-accent-light animate-spin" /> : <Upload size={26} className="text-accent-light" />}
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-text-primary">
            {uploading ? "Uploading…" : "Drop your sounds here"}
          </h3>
          <p className="text-xs text-text-muted mt-1">
            MP3, WAV, OGG, M4A, FLAC — up to 50MB · tagged as <span className="text-accent-light">{mood}</span>
          </p>
        </div>
        <p className="text-[11px] text-text-muted">or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          className="hidden"
          onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }}
        />
      </Card>

      {error && <p className="text-sm text-error">{error}</p>}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Uploaded sounds</h2>
          <span className="text-xs text-text-muted">{tracks.length} track{tracks.length === 1 ? "" : "s"}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size={24} />
          </div>
        ) : tracks.length === 0 ? (
          <Card className="text-center py-10 text-text-muted">
            <Music size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No sounds yet — drop your first sea or rain loop above.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tracks.map((t) => (
              <Card key={t.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Play size={16} className="text-accent-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm truncate capitalize">{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-light capitalize">{t.mood}</span>
                    {t.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-hover text-text-muted">{tag}</span>
                    ))}
                  </div>
                  <audio controls src={t.fileUrl} className="mt-2 w-full h-7" preload="none" />
                </div>
                <button
                  type="button"
                  onClick={() => copyUrl(t.fileUrl)}
                  className="p-2 rounded-lg text-text-muted hover:text-accent-light hover:bg-bg-hover transition-all flex-shrink-0"
                  title="Copy URL"
                >
                  {copied === t.fileUrl ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => deleteTrack(t.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-bg-hover transition-all flex-shrink-0"
                  title="Delete sound"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
