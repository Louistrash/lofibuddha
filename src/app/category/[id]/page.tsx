import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { CATEGORIES, getCategoryExperiences } from "@/lib/experiences";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return { title: "Not found — LofiBuddha" };
  const url = `https://lofibuddha.com/category/${cat.id}`;
  return {
    title: `${cat.name} — LofiBuddha`,
    description: `${cat.name} meditations & music — ${cat.tagline}. Guided practices, breathwork and soundscapes on LofiBuddha.`,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${cat.name} — LofiBuddha`,
      description: `${cat.name}: ${cat.tagline}. Guided meditations, breathwork and soundscapes on LofiBuddha.`,
      url,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) notFound();

  const experiences = getCategoryExperiences(cat.id);
  const accent = cat.accent;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} /> Explore
        </Link>

        <header className="mt-8">
          <span
            className="font-serif text-2xl"
            style={{ color: accent, opacity: 0.9 }}
            aria-hidden
          >
            {cat.script}
          </span>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{cat.name}</h1>
          <p className="mt-3 text-lg text-text-secondary">{cat.tagline}</p>
        </header>

        <section className="mt-10">
          <h2 className="text-sm uppercase tracking-[0.2em] text-text-muted">
            {experiences.length} practices
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {experiences.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-white/10 bg-bg-card p-5 transition-colors hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-medium leading-snug">{e.title}</h3>
                  {e.premium ? (
                    <Lock size={15} className="mt-1 shrink-0 text-text-muted" />
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{e.description}</p>
                <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                  <Clock size={13} style={{ color: accent }} /> {e.duration}
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-sm text-text-muted">
          Find your practice in the{" "}
          <Link href="/explore" className="text-accent underline underline-offset-2 hover:text-accent-light">
            LofiBuddha app
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
