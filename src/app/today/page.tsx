import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { CATEGORIES, EXPERIENCES, getCategoryExperiences, type ExperienceCategory } from "@/lib/experiences";
import { AFFIRMATIONS } from "@/lib/affirmations";

// Fresh every request — "today's practice" and the daily affirmation rotate by date.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today's Practice — LofiBuddha",
  description:
    "Your daily dose of calm: a guided practice and affirmation chosen for today, plus lofi music, breathwork and meditation journeys.",
  alternates: { canonical: "https://lofibuddha.com/today" },
};

function suggestedCategory(d = new Date()): ExperienceCategory {
  const h = d.getHours();
  if (h < 11) return "focus";
  if (h < 15) return "breathe";
  if (h < 21) return "relax";
  return "sleep";
}

function dayOfYear(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86400000);
}

export default function TodayPage() {
  const now = new Date();
  const cat = suggestedCategory(now);
  const category = CATEGORIES.find((c) => c.id === cat)!;
  const pool = getCategoryExperiences(cat);
  const featured = pool[now.getDate() % pool.length] ?? EXPERIENCES[0];
  const affirmation = AFFIRMATIONS[dayOfYear(now) % AFFIRMATIONS.length];
  const forYou = pool.slice(0, 5);

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lofibuddha.com/" },
      { "@type": "ListItem", position: 2, name: "Today", item: "https://lofibuddha.com/today" },
    ],
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/" className="text-sm text-text-muted hover:text-accent transition-colors">
          ← Home
        </Link>

        <header className="mt-6">
          <p className="text-sm uppercase tracking-[0.2em] text-text-muted">{dateLabel}</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Today&apos;s practice</h1>
        </header>

        {/* Featured practice */}
        <section
          className="mt-8 rounded-3xl border p-8 sm:p-10"
          style={{ borderColor: `${category.accent}44`, background: `linear-gradient(135deg, ${category.accent}22, rgba(15,14,23,0.9))` }}
        >
          <span
            className="inline-block rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
            style={{ color: category.accent, borderColor: `${category.accent}66` }}
          >
            Today&apos;s practice · {category.name}
          </span>
          <h2 className="mt-4 text-2xl font-semibold sm:text-4xl">{featured.title}</h2>
          <p className="mt-3 max-w-xl text-base text-text-secondary">{featured.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={`/category/${cat}`}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity"
              style={{ background: category.accent, color: "#0a0a0c" }}
            >
              Begin <ArrowRight size={15} />
            </Link>
            <span className="flex items-center gap-1.5 text-sm text-text-muted">
              <Clock size={14} className="text-accent" /> {featured.duration}
            </span>
          </div>
        </section>

        {/* Daily affirmation */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-bg-card p-6 sm:p-8">
          <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-muted">
            <Sparkles size={14} className="text-accent" /> Daily affirmation · {affirmation.theme}
          </span>
          <p className="mt-4 text-xl font-light leading-relaxed sm:text-2xl">“{affirmation.text}”</p>
        </section>

        {/* Journeys */}
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

        {/* For your {category} */}
        <section className="mt-12">
          <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted" style={{ color: category.accent }}>
            For your {category.name.toLowerCase()}
          </h2>
          <div className="mt-5 space-y-3">
            {forYou.map((e) => (
              <div key={e.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-bg-card p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-medium">{e.title}</h3>
                  <p className="mt-0.5 text-sm text-text-secondary">{e.description}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-text-muted">
                  <Clock size={13} className="text-accent" /> {e.duration}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
