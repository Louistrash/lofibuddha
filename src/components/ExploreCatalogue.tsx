"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Clock, Play } from "lucide-react";
import { MUSIC_TRACKS, type MusicTrack } from "@/lib/music";

const PREVIEW = 8;

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  if (m === 0) return `${sec}s`;
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m} min ${s}s`;
}

function TrackCard({ t }: { t: MusicTrack }) {
  return (
    <Link
      href={`/music/${t.id}`}
      className="group flex gap-4 rounded-2xl border border-white/10 bg-bg-card p-4 transition-colors hover:border-white/25"
    >
      {t.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/music-covers/${t.cover}.webp`}
          alt={t.title}
          loading="lazy"
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-bg-hover">
          <Play size={22} className="text-accent" />
        </div>
      )}
      <div className="min-w-0">
        <h2 className="truncate text-base font-medium">{t.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{t.description}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
          <Clock size={12} className="text-accent" /> {formatDuration(t.duration)}
          <span className="opacity-40">·</span> {t.mood}
        </p>
      </div>
    </Link>
  );
}

function MoodShelf({
  mood,
  tracks,
  defaultOpen,
}: {
  mood: string;
  tracks: MusicTrack[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? tracks : tracks.slice(0, PREVIEW);

  return (
    <section className="border-b border-white/10 pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 py-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold">{mood}</h2>
            <span className="text-xs uppercase tracking-wider text-text-muted">{tracks.length}</span>
          </div>
          <p className="text-sm text-text-secondary">Temple lofi · {mood.toLowerCase()}</p>
        </div>
        {open ? (
          <ChevronDown size={18} className="shrink-0 text-text-muted" />
        ) : (
          <ChevronRight size={18} className="shrink-0 text-text-muted" />
        )}
      </button>

      {open ? (
        <div className="mt-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((t) => (
              <TrackCard key={t.id} t={t} />
            ))}
          </div>
          {tracks.length > PREVIEW ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-sm font-medium text-accent hover:text-accent-light"
            >
              {showAll ? "Show less" : `Show all (${tracks.length})`}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default function ExploreCatalogue() {
  const byMood = useMemo(() => {
    const map = new Map<string, MusicTrack[]>();
    for (const t of MUSIC_TRACKS) {
      const mood = t.mood || "Other";
      const list = map.get(mood) ?? [];
      list.push(t);
      map.set(mood, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="mt-10 space-y-2">
      <div className="mb-6 flex flex-wrap gap-2">
        {byMood.map(([mood]) => (
          <a
            key={mood}
            href={`#mood-${encodeURIComponent(mood)}`}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            {mood}
          </a>
        ))}
      </div>

      {byMood.map(([mood, tracks], i) => (
        <div key={mood} id={`mood-${mood}`}>
          <MoodShelf mood={mood} tracks={tracks} defaultOpen={i === 0} />
        </div>
      ))}
    </div>
  );
}
