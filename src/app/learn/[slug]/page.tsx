"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Moon, ArrowRight, ArrowLeft, CheckCircle2, Play, FileText, Clock, ChevronDown, ChevronRight } from "lucide-react";

const LANGS = ["en", "nl", "es", "de", "fr", "hi"] as const;
type Lang = typeof LANGS[number];
const FLAGS: Record<Lang, string> = { en: "🇬🇧", nl: "🇳🇱", es: "🇪🇸", de: "🇩🇪", fr: "🇫🇷", hi: "🇮🇳" };

interface Module {
  day: number; title: string; type: string; content: string;
}

interface CourseDetail {
  id: string; slug: string; level: string; duration: string; image: string;
  title: string; subtitle: string; description: string;
  modules: Module[]; availableLanguages: string[];
}

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") || "en") as Lang;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    fetch(`/api/courses/public?slug=${params.slug}&lang=${lang}`)
      .then(r => r.json())
      .then(d => setCourse(d))
      .finally(() => setLoading(false));
  }, [params.slug, lang]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400">Loading...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400">Course not found</div>;
  }

  return (
    <div className="min-h-screen editorial-theme bg-stone-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/learn" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors">
            <ArrowLeft size={16} /> <span className="text-sm">Courses</span>
          </Link>
          <span className="font-serif text-sm text-stone-400">LofiBuddha</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="aspect-[21/9] bg-stone-200 overflow-hidden relative">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-5xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] uppercase text-amber-300 font-medium">
            {course.level} · {course.duration}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-white mt-2 mb-3">{course.title}</h1>
          <p className="text-stone-300 text-sm max-w-xl">{course.subtitle}</p>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-stone-600 leading-relaxed">{course.description}</p>
        
        {/* Available languages */}
        <div className="flex gap-2 mt-6 flex-wrap">
          {course.availableLanguages.map((l: string) => (
            <Link key={l} href={`/learn/${course.slug}?lang=${l}`}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                l === lang ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
              }`}>
              {FLAGS[l as Lang] || l.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-2xl text-stone-800 mb-8">
          {lang === "nl" ? "Lessen" : "Lessons"}
        </h2>
        <div className="space-y-3">
          {course.modules.map((mod, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-100 overflow-hidden transition-all">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-stone-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-stone-500">{mod.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-stone-800">{mod.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      {mod.type === "video" ? <Play size={10} /> : <FileText size={10} />}
                      {mod.type === "video" ? "Video" : "Reading"}
                    </span>
                  </div>
                </div>
                {expanded === i ? <ChevronDown size={16} className="text-stone-400" /> : <ChevronRight size={16} className="text-stone-400" />}
              </button>
              {expanded === i && (
                <div className="px-5 pb-5 pt-0 border-t border-stone-50">
                  <p className="text-sm text-stone-600 leading-relaxed pt-4">{mod.content}</p>
                  {mod.type === "video" && (
                    <div className="mt-4 bg-stone-100 rounded-xl p-4 text-center text-xs text-stone-400">
                      🎬 Video content — available with full access
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-stone-800 text-white text-sm tracking-wide hover:bg-stone-700 transition-all">
            {lang === "nl" ? "Begin Deze Cursus" : "Start This Course"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-stone-900 text-stone-400 text-center">
        <p className="text-xs">&copy; 2026 LofiBuddha</p>
      </footer>
    </div>
  );
}
