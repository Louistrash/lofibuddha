import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { ArrowLeft, Clock, BookOpen, CheckCircle2, FileText, Play } from "lucide-react";

interface CourseModule {
  day: number;
  title: string;
  type: string;
  content: string;
}
interface CourseTranslation {
  title: string;
  subtitle: string;
  description: string;
  modules: CourseModule[];
}
interface Course {
  id: string;
  slug: string;
  level: string;
  duration: string;
  image: string;
  translations: Record<string, CourseTranslation>;
}

function getCourses(): Course[] {
  const p = path.join(process.cwd(), "public", "data", "courses.json");
  return JSON.parse(fs.readFileSync(p, "utf-8")).courses;
}

function pickTranslation(course: Course): CourseTranslation {
  const t = course.translations;
  return t.en || t.nl || t.es || t.de || t.fr || t.hi || Object.values(t)[0];
}

export function generateStaticParams() {
  return getCourses().map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourses().find((c) => c.slug === slug);
  if (!course) return { title: "Course not found — LofiBuddha" };
  const t = pickTranslation(course);
  const url = `https://lofibuddha.com/course/${course.slug}`;
  return {
    title: `${t.title} — LofiBuddha`,
    description: t.subtitle,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${t.title} — LofiBuddha`,
      description: t.subtitle,
      url,
      images: course.image ? [{ url: course.image }] : undefined,
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = getCourses().find((c) => c.slug === slug);
  if (!course) notFound();

  const t = pickTranslation(course);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: t.title,
    description: t.subtitle,
    url: `https://lofibuddha.com/course/${course.slug}`,
    provider: { "@type": "Organization", name: "LofiBuddha" },
    ...(course.image ? { image: `https://lofibuddha.com${course.image}` } : {}),
    educationalLevel: course.level,
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} /> All courses
        </Link>

        {/* Hero */}
        <header className="mt-8">
          <span
            className="inline-block rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent"
          >
            {course.level} · {course.duration}
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{t.title}</h1>
          <p className="mt-3 text-lg text-text-secondary">{t.subtitle}</p>
        </header>

        {course.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.image}
            alt={t.title}
            className="mt-8 w-full rounded-2xl border border-white/10 object-cover"
          />
        ) : null}

        <p className="mt-8 text-base leading-relaxed text-text-secondary">{t.description}</p>

        {/* Modules */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-text-muted">
            <BookOpen size={15} className="text-accent" /> {t.modules.length} lessons
          </h2>

          <div className="mt-5 space-y-3">
            {t.modules.map((mod) => (
              <details
                key={mod.day}
                className="group rounded-2xl border border-white/10 bg-bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-hover">
                    <span className="text-sm font-medium text-accent">{mod.day}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium">{mod.title}</h3>
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] text-text-muted">
                      {mod.type === "video" ? <Play size={11} /> : <FileText size={11} />}
                      {mod.type === "video" ? "Video" : "Reading"}
                    </span>
                  </div>
                </summary>
                <div className="border-t border-white/5 px-5 py-4">
                  <p className="text-sm leading-relaxed text-text-secondary">{mod.content}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Ready to begin?</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Start this journey in the LofiBuddha app.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
            style={{ background: "#E4B872", color: "#1a1308" }}
          >
            Open LofiBuddha <ArrowLeft size={15} className="rotate-180" />
          </Link>
        </div>
      </main>
    </div>
  );
}
