import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Play } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/music";

export const metadata: Metadata = {
  title: "Explore Lofi Music & Soundscapes — LofiBuddha",
  description:
    "Browse the full LofiBuddha library — beatless, dreamy lofi soundscapes for focus, sleep and meditation. Temple rain, moonlit ruins, ocean depth and more.",
  alternates: { canonical: "https://lofibuddha.com/explore" },
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  if (m === 0) return `${sec}s`;
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m} min ${s}s`;
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="mx-auto max-w-6xl px-6 py-12">
        <header>
          <Link href="/" className="text-sm text-text-muted hover:text-accent transition-colors">
            ← Home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">Explore soundscapes</h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary">
            {MUSIC_TRACKS.length} beatless lofi tracks and ambient soundscapes for focus, sleep and stillness. Pick one and drift.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MUSIC_TRACKS.map((t) => (
            <Link
              key={t.id}
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
          ))}
        </div>
      </main>
    </div>
  );
}
