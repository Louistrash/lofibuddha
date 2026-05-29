"use client";

import { useEffect, useState, useRef } from "react";
import {
  Image, Upload, Download, Trash2, Loader2, Plus,
  Copy, Check, X, FolderOpen, Film, Search, Grid3X3, List,
  RefreshCw, Sparkles,
} from "lucide-react";
import Link from "next/link";

interface ImageEntry {
  name: string;
  path: string;
  url: string;
  size: number;
  sizeFormatted: string;
  modified: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<ImageEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dragOver, setDragOver] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateModal, setRegenerateModal] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images
  const loadImages = async () => {
    try {
      const res = await fetch("/api/images/list");
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      setImages([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadImages(); }, []);

  // Upload handler
  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");
      try {
        await fetch("/api/images/upload", { method: "POST", body: formData });
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }
    await loadImages();
    setUploading(false);
  };

  // Copy path
  const copyPath = async (path: string) => {
    await navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  // Delete
  const handleDelete = (entry: ImageEntry) => {
    // Note: deletion from filesystem would need a DELETE API
    // For now, just remove from view
    setImages(prev => prev.filter(i => i.path !== entry.path));
    if (selected?.path === entry.path) setSelected(null);
  };

  // Regenerate
  const handleRegenerate = async () => {
    if (!selected) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/images/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: selected.name, prompt: regeneratePrompt || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(data.image);
        await loadImages();
        setRegenerateModal(false);
      } else {
        alert(data.error || "Regeneration failed");
      }
    } catch (e: any) {
      alert(e.message);
    }
    setRegenerating(false);
  };

  const openRegenerate = () => {
    if (!selected) return;
    // Load saved prompt from _prompts.json
    fetch("/images/generated/_prompts.json")
      .then(r => r.json())
      .then(data => {
        const base = selected.name.replace(/\.(png|jpg|jpeg|webp)$/i, "").replace(/-\d+$/, "");
        setRegeneratePrompt(data[base]?.prompt || "");
      })
      .catch(() => setRegeneratePrompt(""));
    setRegenerateModal(true);
  };

  // Filter
  const filtered = images.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by folder
  const grouped: Record<string, ImageEntry[]> = {};
  for (const img of filtered) {
    const folder = img.path.split("/").slice(2, -1).join("/") || "root";
    if (!grouped[folder]) grouped[folder] = [];
    grouped[folder].push(img);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Image Library</h1>
          <p className="text-text-muted mt-1">
            Upload, browse, and manage images for your content.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-zen flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Search + View toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-text-muted" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter images..."
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
          />
        </div>
        <div className="flex items-center gap-1 bg-bg-card border border-border rounded-xl p-1">
          <button onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-accent/20 text-accent-light" : "text-text-muted hover:text-text-primary"}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-accent/20 text-accent-light" : "text-text-muted hover:text-text-primary"}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
      >
        <Upload size={32} className="mx-auto text-text-muted mb-3" />
        <p className="text-sm text-text-secondary">Drag & drop images here</p>
        <p className="text-xs text-text-muted mt-1">PNG, JPEG, GIF, WebP, SVG — max 10MB</p>
      </div>

      {/* Image Gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent-light" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Image size={48} className="mx-auto text-text-muted opacity-30" />
          <p className="text-text-muted">{search ? "No images match your search" : "No images yet. Upload your first image!"}</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        Object.entries(grouped).map(([folder, imgs]) => (
          <div key={folder}>
            {folder !== "root" && (
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen size={14} className="text-accent-light" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{folder}</span>
                <span className="text-[10px] text-text-muted">{imgs.length} image{imgs.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {imgs.map((img) => (
                <div key={img.path}
                  onClick={() => setSelected(img)}
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    selected?.path === img.path ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/30"
                  }`}>
                  <div className="aspect-square bg-bg-hover flex items-center justify-center overflow-hidden">
                    <img
                      src={img.path}
                      alt={img.name}
                      className="max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate">{img.name}</p>
                    <p className="text-[9px] text-white/60">{img.sizeFormatted}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        /* List view */
        <div className="space-y-1">
          {filtered.map((img) => (
            <div key={img.path}
              onClick={() => setSelected(img)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                selected?.path === img.path ? "border-accent bg-accent/5" : "border-border bg-bg-card/30 hover:border-accent/30"
              }`}>
              <div className="w-10 h-10 rounded-lg bg-bg-hover overflow-hidden flex-shrink-0">
                <img src={img.path} alt={img.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{img.name}</p>
                <p className="text-[10px] text-text-muted">{img.sizeFormatted} · {new Date(img.modified).toLocaleDateString()}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); copyPath(img.path); }}
                className="p-1.5 rounded-lg text-text-muted hover:text-accent-light hover:bg-accent/10 transition-all">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selected image preview */}
      {selected && (
        <div className="glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Preview</h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="sm:w-64 sm:h-64 bg-bg-hover rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={selected.path} alt={selected.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{selected.name}</p>
                <p className="text-xs text-text-muted">{selected.sizeFormatted} · {new Date(selected.modified).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 bg-bg-hover rounded-xl px-3 py-2">
                <code className="text-xs text-text-secondary flex-1 truncate">{selected.path}</code>
                <button onClick={() => copyPath(selected.path)}
                  className="p-1 rounded-lg text-text-muted hover:text-accent-light transition-all">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href={selected.path} download className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-hover text-xs text-text-secondary hover:text-text-primary transition-all">
                  <Download size={14} /> Download
                </a>
                <Link href="/video" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-xs text-accent-light hover:bg-accent/20 transition-all">
                  <Film size={14} /> Use in Video
                </Link>
                <button onClick={openRegenerate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-xs text-purple-400 hover:bg-purple-500/20 transition-all">
                  <Sparkles size={14} /> Regenerate
                </button>
                <button onClick={() => handleDelete(selected)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 text-xs text-error hover:bg-red-500/10 transition-all">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Modal */}
      {regenerateModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setRegenerateModal(false)}>
          <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <h3 className="font-semibold text-text-primary">Regenerate with Imagen 4.0</h3>
              </div>
              <button onClick={() => setRegenerateModal(false)} className="p-1 text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Editing: <span className="text-text-primary">{selected.name}</span></p>
              <textarea
                value={regeneratePrompt}
                onChange={(e) => setRegeneratePrompt(e.target.value)}
                rows={5}
                placeholder="Describe the image you want to generate..."
                className="w-full bg-bg-hover border border-border rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:border-accent/50 outline-none"
              />
              <p className="text-[10px] text-text-muted mt-1">
                ✨ Edit the prompt to tweak style, lighting, or composition. Original prompt is pre-filled.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRegenerateModal(false)}
                className="px-4 py-2 rounded-xl bg-bg-hover text-xs text-text-muted hover:text-text-primary transition-all">
                Cancel
              </button>
              <button onClick={handleRegenerate} disabled={regenerating || !regeneratePrompt.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white text-xs hover:bg-purple-600 disabled:opacity-50 transition-all">
                {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {regenerating ? "Generating..." : "Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-border">
        <Link href="/video" className="btn-zen text-xs py-2 px-4 flex items-center gap-2">
          <Film size={14} /> New Video
        </Link>
        <Link href="/content" className="text-xs text-text-muted hover:text-text-primary transition-colors">
          Content Hub →
        </Link>
      </div>
    </div>
  );
}
