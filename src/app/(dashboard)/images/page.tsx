"use client";

import { Image, Quote, Layout, Sparkles, Palette, ThumbsUp } from "lucide-react";

const templates = [
  { label: "Thumbnail", desc: "YouTube thumbnail, 1280×720", icon: Image },
  { label: "Quote Card", desc: "Mindfulness quotes, brand colors", icon: Quote },
  { label: "Pinterest Pin", desc: "1000×1500, vertical", icon: Layout },
  { label: "Instagram Story", desc: "1080×1920, vertical", icon: Image },
  { label: "Blog Cover", desc: "1200×630, horizontal", icon: Palette },
  { label: "Brand Asset", desc: "Logo, banner, icon", icon: Sparkles },
];

export default function ImagesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Image Studio</h1>
        <p className="text-text-muted mt-1">
          AI image generation — thumbnails, quote cards, social graphics, brand assets.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="glass p-5 space-y-4 hover:border-accent/30 cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Icon size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">{t.label}</h3>
                <p className="text-xs text-text-muted mt-1">{t.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Generate */}
      <div className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Generate Image
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Describe the image... (e.g., 'zen garden at sunrise, warm amber tones, lofi aesthetic')"
            className="flex-1 bg-bg-hover border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-all"
          />
          <button className="btn-zen flex items-center gap-2">
            <Sparkles size={16} />
            Generate
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {["zen", "sunset", "minimal", "warm", "nature", "abstract", "lofi", "yoga"].map(
            (style) => (
              <span
                key={style}
                className="px-3 py-1.5 rounded-lg bg-bg-hover text-xs text-text-secondary hover:text-accent-light hover:bg-accent/10 cursor-pointer transition-all"
              >
                {style}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
