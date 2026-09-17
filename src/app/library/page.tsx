import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { ArrowRight, Music2, Layers, GraduationCap } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/music";
import { CATEGORIES } from "@/lib/experiences";

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
          <Link href="/" className="text-sm text-text-muted hover:text-accent transition-colors">
            ← Home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">The LofiBuddha library</h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary">
            Everything for a calmer mind — {totalTracks} soundscapes, guided meditations, breathwork and multi-day courses.
          </p>
        </header>

        {/* Section links */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link href="/explore" className="group rounded-2xl border border-white/10 bg-bg-card p-6 transition-colors hover:border-white/25">
            <Music2 size={22} className="text-accent" />
            <h2 className="mt-4 text-lg font-semibold">Soundscapes</h2>
            <p className="mt-1 text-sm text-text-secondary">{totalTracks} lofi &amp; ambient tracks</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent">Browse <ArrowRight size={14} /></span>
          </Link>

          <div className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <Layers size={22} className="text-accent" />
            <h2 className="mt-4 text-lg font-semibold">Journeys</h2>
            <p className="mt-1 text-sm text-text-secondary">Four paths to calm</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.id}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <GraduationCap size={22} className="text-accent" />
            <h2 className="mt-4 text-lg font-semibold">Courses</h2>
            <p className="mt-1 text-sm text-text-secondary">{courses.length} multi-day journeys</p>
            <div className="mt-4 flex flex-col gap-2">
              {courses.map((c) => {
                const tr = c.translations.en || c.translations.nl || Object.values(c.translations)[0];
                return (
                  <Link key={c.slug} href={`/course/${c.slug}`} className="text-sm text-text-secondary transition-colors hover:text-accent">
                    {tr?.title || c.slug} <ArrowRight size={12} className="inline" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categories detail */}
        <section className="mt-12">
          <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">Journeys</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="rounded-2xl border border-white/10 bg-bg-card p-6 transition-colors hover:border-white/25"
              >
                <span className="font-serif text-2xl" style={{ color: c.accent }} aria-hidden>{c.script}</span>
                <h3 className="mt-3 text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
