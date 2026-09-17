import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { Play, Clock, ArrowRight, Sparkles } from "lucide-react";
import { MUSIC_TRACKS } from "@/lib/music";
import { CATEGORIES } from "@/lib/experiences";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "LofiBuddha — Lofi Music, Guided Meditation & Mindfulness",
  description:
    "Beatless lofi soundscapes, guided meditations, breathwork and sleep stories for focus, calm and deep rest. Discover your daily dose of peace.",
  alternates: { canonical: "https://lofibuddha.com" },
};

interface Course {
  id: string;
  slug: string;
  level: string;
  duration: string;
  image: string;
  translations: Record<string, { title: string; subtitle: string; description: string }>;
}

function getCourses(): Course[] {
  const p = path.join(process.cwd(), "public", "data", "courses.json");
  return JSON.parse(fs.readFileSync(p, "utf-8")).courses;
}

function courseTitle(c: Course): string {
  const t = c.translations;
  const tr = t.en || t.nl || Object.values(t)[0];
  return tr?.title || c.slug;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  if (m === 0) return `${sec}s`;
  return `${m} min`;
}

// Featured music — curated, diverse moods
const FEATURED_IDS = ["temple-rain", "midnight-temple", "moon-tide-drift", "lo-fi-focus", "ocean-depth", "rainy-kyoto"];
const featured = FEATURED_IDS.map((id) => MUSIC_TRACKS.find((t) => t.id === id)).filter(Boolean);

export default function HomePage() {
  const courses = getCourses();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <section className="py-12 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-text-muted">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-accent" />
            Your daily dose of peace
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-accent" />
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Lofi music, guided meditation &amp; <span className="text-accent">mindfulness</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Beatless, dreamy soundscapes and guided practices for sleep, focus and stillness — crafted to feel like a retreat.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
              style={{ background: "#E4B872", color: "#1a1308" }}
            >
              <Play size={15} /> Explore music
            </Link>
            <Link
              href="/category/focus"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent"
            >
              Start meditating <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="py-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">Journeys</h2>
              <p className="mt-2 text-2xl font-semibold">Four paths to calm</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="group rounded-2xl border border-white/10 bg-bg-card p-6 transition-colors hover:border-white/25"
              >
                <span className="font-serif text-2xl" style={{ color: c.accent }} aria-hidden>
                  {c.script}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{c.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured music */}
        <section className="py-10">
          <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">Featured soundscapes</h2>
          <p className="mt-2 text-2xl font-semibold">Listen &amp; drift</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <Link
                key={t!.id}
                href={`/music/${t!.id}`}
                className="group flex gap-4 rounded-2xl border border-white/10 bg-bg-card p-4 transition-colors hover:border-white/25"
              >
                {t!.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/images/music-covers/${t!.cover}.webp`}
                    alt={t!.title}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-bg-hover">
                    <Play size={20} className="text-accent" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-medium">{t!.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{t!.description}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock size={12} className="text-accent" /> {formatDuration(t!.duration)} · {t!.mood}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/explore" className="mt-6 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-light">
            View all {MUSIC_TRACKS.length} soundscapes <ArrowRight size={14} />
          </Link>
        </section>

        {/* Courses */}
        <section className="py-10">
          <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">Guided courses</h2>
          <p className="mt-2 text-2xl font-semibold">Multi-day journeys</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <Link
                key={c.slug}
                href={`/course/${c.slug}`}
                className="group rounded-2xl border border-white/10 bg-bg-card p-6 transition-colors hover:border-white/25"
              >
                <span className="inline-block rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-accent">
                  {c.level} · {c.duration}
                </span>
                <h3 className="mt-3 text-xl font-semibold">{courseTitle(c)}</h3>
                <p className="mt-2 text-sm text-text-secondary">{c.translations.en?.subtitle || c.translations.nl?.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Start course <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-bg-card p-8 text-center sm:p-12">
          <Sparkles size={20} className="mx-auto text-accent" />
          <h2 className="mt-3 text-2xl font-semibold">A little more peace, in your inbox</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Early access to new soundscapes and meditations. No spam, just calm.
          </p>
          <div className="mt-2 flex justify-center">
            <NewsletterSignup />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-text-muted">
        <p>LofiBuddha — a space for calm in a busy world.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <Link href="/legal/privacy" className="hover:text-accent">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-accent">Terms</Link>
          <Link href="/legal/disclaimer" className="hover:text-accent">Disclaimer</Link>
        </div>
      </footer>
    </div>
  );
}
