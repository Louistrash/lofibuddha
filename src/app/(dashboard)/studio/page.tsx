"use client";

import { Mic, Upload, Scissors, Music, Wand2, Headphones } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

const tools = [
  { label: "Transcribe", desc: "Whisper AI transcription", icon: Mic, color: "text-journey-sleep", bg: "bg-journey-sleep/10" },
  { label: "Summarize", desc: "AI-generated show notes", icon: Wand2, color: "text-journey-focus", bg: "bg-journey-focus/10" },
  { label: "Create Clips", desc: "Highlight detection", icon: Scissors, color: "text-journey-relax", bg: "bg-journey-relax/10" },
  { label: "Audiogram", desc: "Waveform visualization", icon: Music, color: "text-journey-breathe", bg: "bg-journey-breathe/10" },
  { label: "Generate Intro", desc: "Branded podcast intro", icon: Headphones, color: "text-accent-light", bg: "bg-accent/10" },
  { label: "SEO Metadata", desc: "Titles, descriptions, tags", icon: Wand2, color: "text-journey-sleep", bg: "bg-journey-sleep/10" },
];

export default function PodcastPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Podcast Studio"
        description="Upload, transcribe, summarize, and create clips — all AI-powered."
      />

      <Card
        interactive
        dashed
        className="p-8 flex flex-col items-center gap-4 hover:border-accent/40"
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Upload size={28} className="text-accent-light" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-text-primary">Upload Episode</h3>
          <p className="text-xs text-text-muted mt-1">MP3, WAV, M4A — up to 500MB</p>
        </div>
        <p className="text-[10px] text-text-muted">
          Auto-transcription via Whisper • AI summaries • Clip detection
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label} interactive className="p-4 space-y-3 hover:border-accent/30">
              <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center`}>
                <Icon size={18} className={t.color} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{t.label}</h3>
                <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
