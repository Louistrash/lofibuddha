"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, ChevronDown, Moon, Globe, Sparkles } from "lucide-react";

const LANGS = ["en", "nl", "es", "de", "fr", "hi"] as const;
type Lang = typeof LANGS[number];
const FLAGS: Record<Lang, string> = { en: "🇬🇧", nl: "🇳🇱", es: "🇪🇸", de: "🇩🇪", fr: "🇫🇷", hi: "🇮🇳" };
const LABELS: Record<Lang, string> = { en: "EN", nl: "NL", es: "ES", de: "DE", fr: "FR", hi: "HI" };

interface CourseCard {
  id: string; slug: string; level: string; duration: string;
  image: string; title: string; subtitle: string; description: string;
  moduleCount: number;
}

export default function CoursesPage() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const browser = navigator.language.split("-")[0];
    return LANGS.includes(browser as Lang) ? browser as Lang : "en";
  });
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/public?lang=${lang}`)
      .then(r => r.json())
      .then(d => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, [lang]);

  const levels: Record<string, string> = {
    "beginner": lang === "nl" ? "Beginner" : lang === "es" ? "Principiante" : "Beginner",
    "all-levels": lang === "nl" ? "Alle Niveaus" : lang === "es" ? "Todos los Niveles" : "All Levels",
  };

  return (
    <div className="min-h-screen editorial-theme bg-stone-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
              <Moon size={16} className="text-amber-200" />
            </div>
            <span className="font-serif text-lg tracking-wide text-stone-800">LofiBuddha</span>
          </Link>
          <div className="flex items-center gap-4">
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
              className="text-xs bg-transparent border border-stone-200 rounded-lg px-2 py-1.5 text-stone-600 cursor-pointer">
              {LANGS.map(l => <option key={l} value={l}>{FLAGS[l]} {LABELS[l]}</option>)}
            </select>
            <Link href="/signup" className="text-xs tracking-wide px-5 py-2.5 rounded-full bg-stone-800 text-white hover:bg-stone-700 transition-all">
              {lang === "nl" ? "Begin" : "Start"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28 px-6 text-center">
        <Sparkles size={32} className="mx-auto text-amber-400 mb-6" />
        <h1 className="font-serif text-4xl sm:text-6xl font-light text-stone-800 mb-4">
          {lang === "nl" ? "Onze Cursussen" : lang === "es" ? "Nuestros Cursos" : "Our Courses"}
        </h1>
        <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed">
          {lang === "nl" 
            ? "Mindfulness, yoga, ademwerk en focus — in jouw taal, op jouw tempo."
            : "Mindfulness, yoga, breathwork, and focus — in your language, at your pace."}
        </p>
      </section>

      {/* Courses Grid */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <Link key={course.id} href={`/learn/${course.slug}?lang=${lang}`}
                className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:border-stone-200 transition-all duration-500 flex flex-col">
                {/* Image */}
                <div className="aspect-[16/9] bg-stone-100 overflow-hidden relative">
                  <img src={course.image} alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-[10px] bg-white/90 text-stone-700 px-2 py-1 rounded-full font-medium">
                      {levels[course.level] || course.level}
                    </span>
                    <span className="text-[10px] bg-white/90 text-stone-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Clock size={10} /> {course.duration}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="font-serif text-xl sm:text-2xl text-stone-800 mb-2 group-hover:text-amber-700 transition-colors">
                    {course.title}
                  </h2>
                  <p className="text-xs text-amber-700 font-medium tracking-wide uppercase mb-2">{course.subtitle}</p>
                  <p className="text-sm text-stone-500 leading-relaxed flex-1">{course.description}</p>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-50">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <BookOpen size={12} /> {course.moduleCount} {lang === "nl" ? "lessen" : "lessons"}
                    </span>
                    <span className="text-xs text-amber-700 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      {lang === "nl" ? "Bekijk cursus" : "View course"} <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-stone-900 text-stone-400 text-center">
        <p className="text-xs">&copy; 2026 LofiBuddha</p>
      </footer>
    </div>
  );
}
