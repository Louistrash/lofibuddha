"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Film, Loader2, PlaySquare, Download, X, Search, Upload,
  CheckCircle2, AlertCircle, CheckSquare, Square as SquareIcon, Play,
} from "lucide-react";
import { buildYouTubeMeta } from "@/lib/youtube-meta";

interface VideoEntry {
  name: string;
  path: string;
  format: string;
  size: number;
  sizeFormatted: string;
  width: number;
  height: number;
  platform: string;
}

interface DraftItem {
  path: string;
  name: string;
  title: string;
  description: string;
  tags: string;
}

interface UploadOutcome {
  videoPath?: string;
  success: boolean;
  url?: string;
  title?: string;
  error?: string;
}

const formatLabels: Record<string, string> = {
  worlds: "Worlds",
  youtube: "YouTube",
  promos: "Promos",
  shorts: "Shorts",
  square: "Square",
  tiktok: "TikTok",
};

export default function YouTubeBulkPublish() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [outcomes, setOutcomes] = useState<UploadOutcome[]>([]);
  const [ytConnected, setYtConnected] = useState<boolean | null>(null);
  const [openPreview, setOpenPreview] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/videos/list")
      .then((r) => r.json())
      .then((d) => setVideos(d.videos || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/youtube/auth?action=status")
      .then((r) => r.json())
      .then((d) => setYtConnected(!!d.connected))
      .catch(() => setYtConnected(false));
  }, []);

  const formats = useMemo(() => {
    const s = new Set(videos.map((v) => v.format));
    return ["all", ...Array.from(s).sort()];
  }, [videos]);

  const filtered = useMemo(
    () =>
      videos.filter((v) => {
        if (filter !== "all" && v.format !== filter) return false;
        if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [videos, filter, search]
  );

  const toggle = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((v) => v.path)));
  };

  const openBulk = () => {
    const chosen = videos.filter((v) => selected.has(v.path));
    setDrafts(
      chosen.map((v) => {
        const meta = buildYouTubeMeta(v.path);
        return {
          path: v.path,
          name: v.name,
          title: meta.title,
          description: meta.description,
          tags: meta.tags.join(", "),
        };
      })
    );
    setOutcomes([]);
    setOpenPreview(null);
    setBulkOpen(true);
  };

  const updateDraft = (idx: number, field: keyof DraftItem, value: string) => {
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };

  const uploadAll = async () => {
    setUploading(true);
    setOutcomes([]);
    try {
      const res = await fetch("/api/youtube/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: drafts.map((d) => ({
            videoPath: d.path,
            title: d.title,
            description: d.description,
            tags: d.tags.split(",").map((t) => t.trim()).filter(Boolean),
          })),
        }),
      });
      const data = await res.json();
      setOutcomes(data.results || [{ success: false, error: data.error || "Unknown error" }]);
    } catch (e: any) {
      setOutcomes([{ success: false, error: e.message }]);
    } finally {
      setUploading(false);
    }
  };

  const successCount = outcomes.filter((o) => o.success).length;

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                filter === f
                  ? "border-accent bg-accent/15 text-accent-light"
                  : "border-border bg-bg-hover text-text-muted hover:border-accent/30"
              }`}
            >
              {formatLabels[f] || f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek video..."
              className="w-full bg-bg-hover border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
            />
          </div>
          <button
            onClick={toggleAll}
            className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 px-2 py-2"
            title="Selecteer alles (gefilterd)"
          >
            {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={15} /> : <SquareIcon size={15} />}
          </button>
          <button
            onClick={openBulk}
            disabled={selected.size === 0}
            className="btn-zen flex items-center gap-2 text-xs py-2 px-4 disabled:opacity-40"
          >
            <Upload size={14} />
            Publiceer {selected.size > 0 ? selected.size : ""} naar YouTube
          </button>
        </div>
      </div>

      {/* ── Connection hint ── */}
      {ytConnected === false && (
        <div className="flex items-center justify-between gap-3 bg-error/10 border border-error/20 rounded-xl p-3">
          <p className="text-xs text-error">YouTube is niet verbonden.</p>
          <a
            href="/api/youtube/auth?action=login"
            className="text-xs font-semibold px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error-light rounded-lg transition-all whitespace-nowrap"
          >
            Verbind YouTube
          </a>
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent-light" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Film size={36} className="mx-auto text-text-muted opacity-30" />
          <p className="text-sm text-text-muted">Geen video's gevonden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((video) => {
            const isSel = selected.has(video.path);
            return (
              <div
                key={video.path}
                className={`relative bg-bg-card backdrop-blur-xl rounded-xl border overflow-hidden transition-all duration-[var(--duration-base)] group ${
                  isSel ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-border-strong hover:-translate-y-0.5"
                }`}
              >
                {/* select checkbox (klikbaar) */}
                <button
                  onClick={() => toggle(video.path)}
                  className="absolute top-2 left-2 z-10 flex items-center justify-center w-7 h-7 rounded-md bg-black/60 backdrop-blur hover:bg-black/80 transition-colors"
                  title={isSel ? "Deselecteer" : "Selecteer voor bulk-upload"}
                >
                  {isSel ? <CheckSquare size={17} className="text-accent-light" /> : <SquareIcon size={17} className="text-white/80" />}
                </button>
                <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
                  <video src={video.path} controls preload="metadata" className="max-w-full max-h-full" />
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="text-sm font-medium text-text-primary truncate capitalize">{video.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {formatLabels[video.format] || video.format} · {video.width}×{video.height} · {video.sizeFormatted}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={video.path}
                      download
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-all py-1.5 px-2.5 rounded-lg bg-bg-card border border-border"
                    >
                      <Download size={12} /> Download
                    </a>
                    <button
                      onClick={() => toggle(video.path)}
                      className={`text-[10px] flex items-center gap-1 transition-all py-1 px-2 rounded-lg ${
                        isSel ? "text-accent-light bg-accent/10" : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {isSel ? <CheckSquare size={12} /> : <SquareIcon size={12} />}
                      {isSel ? "geselecteerd" : "Selecteer"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bulk Modal ── */}
      {bulkOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass max-w-3xl w-full p-6 space-y-4 relative border border-accent/20 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setBulkOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <PlaySquare size={16} className="text-red-400" /> Publiceer {drafts.length} video's naar YouTube
              </h3>
              <p className="text-xs text-text-muted">
                Controleer titel & beschrijving per video. Alles wordt als <b>privé</b> geüpload naar YouTube Studio — jij publiceert daarna zelf.
              </p>
            </div>

            {/* Drafts */}
            <div className="space-y-3">
              {drafts.map((d, i) => (
                <div key={d.path} className="bg-bg-hover border border-border rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setOpenPreview(openPreview === i ? null : i)}
                      className="text-[10px] px-2 py-1 rounded-full bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all flex items-center gap-1"
                    >
                      {openPreview === i ? <X size={12} /> : <Play size={12} />}
                      {openPreview === i ? "Sluit preview" : "Bekijk"}
                    </button>
                    <span className="text-[10px] font-semibold text-accent-light bg-accent/10 px-2 py-0.5 rounded-full capitalize">
                      {d.name}
                    </span>
                    <span className="text-[10px] text-text-muted truncate">{d.path}</span>
                  </div>

                  {openPreview === i && (
                    <div className="bg-black rounded-lg overflow-hidden aspect-video border border-border">
                      <video src={d.path} controls autoPlay className="w-full h-full" />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">Titel</label>
                    <input
                      value={d.title}
                      onChange={(e) => updateDraft(i, "title", e.target.value)}
                      className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">Beschrijving</label>
                    <textarea
                      rows={7}
                      value={d.description}
                      onChange={(e) => updateDraft(i, "description", e.target.value)}
                      className="w-full bg-bg-card border border-border rounded-lg p-3 text-xs text-text-primary outline-none focus:border-accent/50 resize-none font-sans leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">Tags (komma-gescheiden)</label>
                    <input
                      value={d.tags}
                      onChange={(e) => updateDraft(i, "tags", e.target.value)}
                      className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Outcomes */}
            {outcomes.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-text-secondary font-semibold">
                  Resultaat: {successCount}/{outcomes.length} geüpload
                </div>
                {outcomes.map((o, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                      o.success ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    }`}
                  >
                    {o.success ? <CheckCircle2 size={14} className="mt-0.5" /> : <AlertCircle size={14} className="mt-0.5" />}
                    <div className="min-w-0">
                      <span className="font-medium">{o.title || o.videoPath || "video"}</span>
                      {o.success ? (
                        <a href={o.url} target="_blank" rel="noopener noreferrer" className="block underline break-all">
                          {o.url}
                        </a>
                      ) : (
                        <span className="block">{o.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBulkOpen(false)}
                disabled={uploading}
                className="text-xs text-text-muted hover:text-text-primary px-4 py-2 transition-colors disabled:opacity-50"
              >
                Sluiten
              </button>
              <button
                onClick={uploadAll}
                disabled={uploading || !ytConnected}
                className="btn-zen text-xs py-2 px-5 flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Uploaden ({drafts.length})...
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Upload {drafts.length} video's
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
