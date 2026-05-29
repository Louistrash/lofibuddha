"use client";

import { Mic, Upload, Scissors, Music, Wand2, Headphones } from "lucide-react";

export default function PodcastPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Podcast Studio</h1>
        <p className="text-text-muted mt-1">
          Upload, transcribe, summarize, and create clips — all AI-powered.
        </p>
      </div>

      {/* Upload */}
      <div className="glass p-8 flex flex-col items-center gap-4 border-dashed border-2 border-border hover:border-accent/40 cursor-pointer transition-all">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Upload size={28} className="text-accent-light" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-text-primary">Upload Episode</h3>
          <p className="text-xs text-text-muted mt-1">
            MP3, WAV, M4A — up to 500MB
          </p>
        </div>
        <p className="text-[10px] text-text-muted">
          Auto-transcription via Whisper • AI summaries • Clip detection
        </p>
      </div>

      {/* Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Transcribe", desc: "Whisper AI transcription", icon: Mic },
          { label: "Summarize", desc: "AI-generated show notes", icon: Wand2 },
          { label: "Create Clips", desc: "Highlight detection", icon: Scissors },
          { label: "Audiogram", desc: "Waveform visualization", icon: Music },
          { label: "Generate Intro", desc: "Branded podcast intro", icon: Headphones },
          { label: "SEO Metadata", desc: "Titles, descriptions, tags", icon: Wand2 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="glass p-4 space-y-3 hover:border-accent/30 cursor-pointer transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Icon size={18} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{t.label}</h3>
                <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
