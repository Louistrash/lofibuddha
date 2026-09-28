import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { ArrowRight, Music2, Layers, GraduationCap } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/music";
import { CATEGORIES } from "@/lib/experiences";
import ExploreCatalogue from "@/components/ExploreCatalogue";

export const metadata: Metadata = {
  title: "Library — Meditations, Soundscapes & Courses | LofiBuddha",
  description:
    "The full LofiBuddha library: guided meditations, breathwork, sleep stories, lofi soundscapes and multi-day mindfulness courses — all in one calm place.",
  alternates: { canonical: "https://lofibuddha.com/library" },
};

interface Course {
  slug: string;
  level: string;
  duration: string;
  translations: Record<string, { title: string; subtitle: string }>;
}

function getCourses(): Course[] {
  const p = path.join(process.cwd(), "public", "data", "courses.json");
  return JSON.parse(fs.readFileSync(p, "utf-8")).courses;
}

export default function LibraryPage() {
  const courses = getCourses();
  const totalTracks = MUSIC_TRACKS.length;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="mx-auto max-w-6xl px-6 py-12">
        <header>
          <Link href="/" className="text-sm text-text-muted transition-colors hover:text-accent">
            ← Home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">The LofiBuddha library</h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary">
            Everything for a calmer mind — {totalTracks} soundscapes, guided meditations, breathwork
            and multi-day courses. Jump to a shelf below; heavy sections stay collapsed until you
            open them.
          </p>
        </header>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Library sections">
          {[
            { href: "#soundtracks", label: "Soundtracks" },
            { href: "#journeys", label: "Journeys" },
            { href: "#courses", label: "Courses" },
          ].map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              {c.label}
            </a>
          ))}
        </nav>

        {/* Soundtracks first — Suno temple-lofi */}
        <section id="soundtracks" className="mt-12 scroll-mt-8">
          <div className="mb-2 flex items-center gap-2">
            <Music2 size={18} className="text-accent" />
            <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">Soundtracks</h2>
          </div>
          <p className="mb-4 max-w-2xl text-sm text-text-secondary">
            {totalTracks} temple lofi tracks, grouped by mood. Open a shelf to browse.
          </p>
          <ExploreCatalogue />
        </section>

        <section id="journeys" className="mt-14 scroll-mt-8">
          <div className="mb-2 flex items-center gap-2">
            <Layers size={18} className="text-accent" />
            <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">Journeys</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="rounded-2xl border border-white/10 bg-bg-card p-6 transition-colors hover:border-white/25"
              >
                <span className="font-serif text-2xl" style={{ color: c.accent }} aria-hidden>
                  {c.script}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="courses" className="mt-14 scroll-mt-8">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap size={18} className="text-accent" />
            <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">Courses</h2>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{courses.length} multi-day journeys</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {courses.map((c) => {
              const tr =
                c.translations.en || c.translations.nl || Object.values(c.translations)[0];
              return (
                <Link
                  key={c.slug}
                  href={`/course/${c.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-bg-card px-5 py-4 text-sm transition-colors hover:border-white/25 hover:text-accent"
                >
                  <span>
                    <span className="font-medium text-text-primary">{tr?.title || c.slug}</span>
                    {tr?.subtitle ? (
                      <span className="mt-0.5 block text-xs text-text-secondary">{tr.subtitle}</span>
                    ) : null}
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-accent" />
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
