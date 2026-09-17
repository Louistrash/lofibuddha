import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, Music2 } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/music";

export function generateStaticParams() {
  return MUSIC_TRACKS.map((t) => ({ id: t.id }));
}

type Props = { params: Promise<{ id: string }> };

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const track = MUSIC_TRACKS.find((t) => t.id === id);
  if (!track) return { title: "Track not found — LofiBuddha" };
  const cover = track.cover ? `/images/music-covers/${track.cover}.webp` : "/og-image.png";
  const url = `https://lofibuddha.com/music/${track.id}`;
  return {
    title: `${track.title} — LofiBuddha`,
    description: track.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${track.title} — LofiBuddha`,
      description: track.description,
      url,
      images: [{ url: cover, width: 512, height: 512, alt: track.title }],
    },
    twitter: { card: "summary_large_image", title: track.title, description: track.description, images: [cover] },
  };
}

export default async function MusicPage({ params }: Props) {
  const { id } = await params;
  const track = MUSIC_TRACKS.find((t) => t.id === id);
  if (!track) notFound();

  const cover = track.cover ? `/images/music-covers/${track.cover}.webp` : null;
  const audioUrl = `/api/music-tracks/audio/${track.id}.mp3`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: track.title,
    description: track.description,
    url: `https://lofibuddha.com/music/${track.id}`,
    ...(cover ? { image: `https://lofibuddha.com${cover}` } : {}),
    genre: track.mood,
    duration: `PT${track.duration}S`,
    byArtist: { "@type": "MusicGroup", name: "LofiBuddha" },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lofibuddha.com/" },
      { "@type": "ListItem", position: 2, name: "Music", item: "https://lofibuddha.com/explore" },
      { "@type": "ListItem", position: 3, name: track.title, item: `https://lofibuddha.com/music/${track.id}` },
    ],
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} /> All tracks
        </Link>

        <div className="mt-8 grid gap-8 sm:grid-cols-[280px_1fr] sm:items-start">
          {/* Cover */}
          <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(228,184,114,0.12)]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={track.title} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-bg-card">
                <Music2 size={48} className="text-accent" />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span
              className="inline-block rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
              style={{ color: "#E4B872", borderColor: "rgba(228,184,114,0.35)", background: "rgba(228,184,114,0.08)" }}
            >
              {track.mood}
            </span>

            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{track.title}</h1>

            <p className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
              <Clock size={14} className="text-accent" /> {formatDuration(track.duration)}
            </p>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">{track.description}</p>

            {/* Player */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-bg-card p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-text-muted">Listen</p>
              <audio controls preload="none" src={audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>

            <p className="mt-6 text-sm text-text-muted">
              More music in the{" "}
              <Link href="/library" className="text-accent underline underline-offset-2 hover:text-accent-light">
                LofiBuddha library
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
