"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Layers, FileText, Play, Download, Plus, Wand2,
  Sparkles, Clock, Users, Target, Hash, Loader2, Check,
  ChevronDown, ChevronRight, Edit3, Trash2, Copy, X,
  GripVertical, Save, ArrowRight, Eye, Send, Globe,
} from "lucide-react";

// ── Types ──

interface Lesson {
  id: string; title: string; content?: string; duration: string;
  type: "video" | "text" | "quiz" | "worksheet"; status: "draft" | "generated";
}
interface Module {
  id: string; title: string; description: string; lessons: Lesson[]; order: number;
}
interface Course {
  id: string; title: string; description: string; topic: string;
  audience: string; level: string; goal: string; moduleCount: number;
  tone: string; language: string; modules: Module[];
  createdAt: string; updatedAt: string;
}

// ── Helpers ──

const lessonTypeIcons: Record<string, string> = { video: "🎬", text: "📝", quiz: "❓", worksheet: "📄" };
const lessonTypeLabels: Record<string, string> = { video: "Video Lesson", text: "Reading", quiz: "Quiz", worksheet: "Worksheet" };

// ── Component ──

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  // Wizard form
  const [wizard, setWizard] = useState({
    topic: "", audience: "beginners", level: "beginner",
    goal: "", moduleCount: 5, tone: "warm and inspiring", language: "en",
  });

  // Load courses
  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(d => {
      setCourses(d.courses || []);
      if (d.courses?.length > 0) setSelectedCourseId(d.courses[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Create course
  const handleCreate = async () => {
    if (!wizard.topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wizard),
      });
      const data = await res.json();
      if (data.course) {
        setCourses(prev => [data.course, ...prev]);
        setSelectedCourseId(data.course.id);
        setShowWizard(false);
        resetWizard();
      }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const resetWizard = () => setWizard({
    topic: "", audience: "beginners", level: "beginner",
    goal: "", moduleCount: 5, tone: "warm and inspiring", language: "en",
  });

  // Generate content for a tool
  const handleGenerate = async (tool: string) => {
    setActiveTool(tool);
    setGenLoading(true);
    setGeneratedContent("");

    // Simulate generation with a delay
    await new Promise(r => setTimeout(r, 1500));

    const content = generateMockContent(tool, selectedCourse);
    setGeneratedContent(content);
    setGenLoading(false);
  };

  const handleSaveGenerated = () => {
    // Save to localStorage for now
    const saved = JSON.parse(localStorage.getItem("bodhi-courses-content") || "{}");
    saved[activeTool || "unknown"] = { courseId: selectedCourseId, content: generatedContent, date: new Date().toISOString() };
    localStorage.setItem("bodhi-courses-content", JSON.stringify(saved));
  };

  // ── Tool cards ──
  const tools = [
    { id: "outline", label: "Course Outline", desc: "Module structure & learning objectives", icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "lesson", label: "Lesson Generator", desc: "Full lesson content with examples", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "worksheets", label: "Worksheets", desc: "Printable exercises & quizzes", icon: Download, color: "text-amber-400", bg: "bg-amber-500/10" },
    { id: "scripts", label: "Video Scripts", desc: "Lesson narration scripts & social clips", icon: Play, color: "text-purple-400", bg: "bg-purple-500/10" },
    { id: "landing", label: "Course Landing Page", desc: "Sales page copy & curriculum", icon: Globe, color: "text-pink-400", bg: "bg-pink-500/10" },
    { id: "emails", label: "Email Sequence", desc: "Welcome & drip email campaigns", icon: Send, color: "text-teal-400", bg: "bg-teal-500/10" },
  ];

  // ── Expandable module ──
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Course Creator</h1>
          <p className="text-text-muted mt-1">Build online courses with AI-generated outlines, lessons, and worksheets.</p>
        </div>
        <div className="flex gap-2">
          {courses.length > 0 && (
            <select
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-bg-card border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
          <button onClick={() => setShowWizard(true)} className="btn-zen flex items-center gap-2 text-sm py-2.5 px-5">
            <Plus size={16} /> New Course
          </button>
        </div>
      </div>

      {/* AI Generator card */}
      <div className="glass p-6 flex flex-col sm:flex-row items-center gap-4 justify-between bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Wand2 size={24} className="text-accent-light" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Course Generator</h3>
            <p className="text-xs text-text-muted mt-1">Describe your topic, get a full course outline with lessons, exercises, and resources.</p>
          </div>
        </div>
        <button onClick={() => setShowWizard(true)} className="btn-zen flex items-center gap-2 flex-shrink-0">
          <Sparkles size={16} /> Generate Course
        </button>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => handleGenerate(t.id)}
              disabled={!selectedCourse || genLoading}
              className={`glass p-4 space-y-3 text-left hover:border-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTool === t.id ? "border-accent/50 ring-1 ring-accent/20" : ""}`}>
              <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center`}>
                <Icon size={18} className={t.color} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{t.label}</h3>
                <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Generated content panel */}
      {activeTool && (
        <div className="glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-accent-light" />
              {tools.find(t => t.id === activeTool)?.label} — Generated Content
            </h3>
            <div className="flex gap-2">
              <button onClick={handleSaveGenerated} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-xs text-accent-light hover:bg-accent/20 transition-all">
                <Save size={13} /> Save
              </button>
              <button onClick={() => { setActiveTool(null); setGeneratedContent(""); }}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-all">
                <X size={16} />
              </button>
            </div>
          </div>
          {genLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 size={24} className="animate-spin text-accent-light" />
              <span className="text-sm text-text-muted">Generating...</span>
            </div>
          ) : (
            <div className="bg-bg-hover rounded-xl p-5 max-h-[500px] overflow-y-auto">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
                {generatedContent}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Course outline — expandable modules */}
      {selectedCourse && (
        <div className="glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-accent-light" />
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Course Outline</h2>
              <span className="text-[10px] text-text-muted">{selectedCourse.modules.length} modules · {selectedCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons</span>
            </div>
          </div>

          <div className="space-y-2">
            {selectedCourse.modules.map((mod) => {
              const isExpanded = expandedModules.has(mod.id);
              return (
                <div key={mod.id} className="rounded-xl border border-border bg-bg-hover/50 overflow-hidden">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-bg-hover/80 transition-all"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent-light">
                      {mod.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{mod.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{mod.lessons.length} lessons</p>
                    </div>
                    {isExpanded ? <ChevronDown size={16} className="text-text-muted flex-shrink-0" /> : <ChevronRight size={16} className="text-text-muted flex-shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-2 space-y-1.5">
                      <p className="text-xs text-text-muted mb-2">{mod.description}</p>
                      {mod.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-card/50 hover:bg-bg-card transition-all group">
                          <span className="text-sm">{lessonTypeIcons[lesson.type]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-primary truncate">{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-text-muted">{lessonTypeLabels[lesson.type]}</span>
                              <span className="text-[10px] text-text-muted">·</span>
                              <span className="text-[10px] text-text-muted flex items-center gap-1"><Clock size={9} />{lesson.duration}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${lesson.status === "generated" ? "bg-success/10 text-success" : "bg-bg-hover text-text-muted"}`}>{lesson.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 rounded text-text-muted hover:text-text-primary"><Edit3 size={12} /></button>
                            <button className="p-1 rounded text-text-muted hover:text-accent-light"><Copy size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <BookOpen size={48} className="mx-auto text-text-muted opacity-30" />
          <div>
            <p className="text-text-primary font-medium">No courses yet</p>
            <p className="text-sm text-text-muted mt-1">Click "New Course" to generate your first AI-powered course.</p>
          </div>
          <button onClick={() => setShowWizard(true)} className="btn-zen inline-flex items-center gap-2 px-6 py-3 mt-2">
            <Sparkles size={16} /> Create Your First Course
          </button>
        </div>
      )}

      {/* ── New Course Wizard Modal ── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWizard(false)} />
          <div className="relative bg-bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Wand2 size={20} className="text-accent-light" /> New Course
              </h2>
              <button onClick={() => setShowWizard(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Topic */}
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Course Topic *</label>
                <input type="text" value={wizard.topic} onChange={e => setWizard({...wizard, topic: e.target.value})}
                  placeholder="e.g., Mindful Leadership, Python for Data Science..."
                  className="w-full bg-bg-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50" />
              </div>

              {/* Audience + Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1.5 flex items-center gap-1"><Users size={12} /> Audience</label>
                  <select value={wizard.audience} onChange={e => setWizard({...wizard, audience: e.target.value})}
                    className="w-full bg-bg-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50">
                    <option value="beginners">Beginners</option>
                    <option value="intermediate">Intermediate learners</option>
                    <option value="advanced">Advanced practitioners</option>
                    <option value="professionals">Professionals</option>
                    <option value="everyone">Everyone</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5 flex items-center gap-1"><Target size={12} /> Level</label>
                  <select value={wizard.level} onChange={e => setWizard({...wizard, level: e.target.value})}
                    className="w-full bg-bg-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Course Goal</label>
                <input type="text" value={wizard.goal} onChange={e => setWizard({...wizard, goal: e.target.value})}
                  placeholder="e.g., Students will be able to lead mindful teams..."
                  className="w-full bg-bg-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50" />
              </div>

              {/* Module count + Tone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1.5 flex items-center gap-1"><Hash size={12} /> Modules</label>
                  <select value={wizard.moduleCount} onChange={e => setWizard({...wizard, moduleCount: Number(e.target.value)})}
                    className="w-full bg-bg-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50">
                    {[2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n} modules</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5 flex items-center gap-1"><Sparkles size={12} /> Tone</label>
                  <select value={wizard.tone} onChange={e => setWizard({...wizard, tone: e.target.value})}
                    className="w-full bg-bg-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50">
                    <option value="warm and inspiring">Warm & Inspiring</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="academic">Academic</option>
                  </select>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-xs text-text-muted block mb-1.5 flex items-center gap-1"><Globe size={12} /> Language</label>
                <select value={wizard.language} onChange={e => setWizard({...wizard, language: e.target.value})}
                  className="w-full bg-bg-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50">
                  <option value="en">English</option>
                  <option value="nl">Nederlands</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={generating || !wizard.topic.trim()}
                className="btn-zen flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
                {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Course</>}
              </button>
              <button onClick={() => setShowWizard(false)}
                className="px-5 py-2.5 rounded-xl bg-bg-hover text-sm text-text-secondary hover:text-text-primary transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mock content generators ──

function generateMockContent(tool: string, course?: Course): string {
  const topic = course?.topic || "Your Course Topic";
  const lang = course?.language === "nl" ? "nl" : "en";

  if (lang === "nl") {
    switch (tool) {
      case "outline": return `📚 CURSUSOVERZICHT: ${course?.title || topic}\n\n${course?.modules.map((m, i) => `\n## Module ${i+1}: ${m.title}\n${m.description}\n\nDoelen:\n- Leerdoel 1 voor deze module\n- Leerdoel 2 voor deze module\n- Leerdoel 3 voor deze module\n\nLessen:\n${m.lessons.map(l => `- [${l.type.toUpperCase()}] ${l.title} (${l.duration})`).join("\n")}`).join("\n")}\n\n⏱️ Totale duur: ~${course?.modules.reduce((s, m) => s + m.lessons.length * 12, 0) || 240} minuten`;
      case "lesson": return `📝 LES: ${course?.modules[0]?.lessons[0]?.title || "Les 1"}\n\n## Introductie (2 min)\nWelkom bij deze les over ${topic}. Vandaag duiken we in de kernconcepten...\n\n## Kerninhoud (15 min)\n### Concept 1\nUitleg met voorbeelden...\n\n### Concept 2\nPraktische toepassing...\n\n## Praktische Oefening (5 min)\nProbeer deze oefening: [...]\n\n## Samenvatting\nVandaag heb je geleerd: [...]\n\n## Actiestap\nPas dit vandaag toe door: [...]`;
      case "worksheets": return `📄 WERKBLAD: ${topic}\n\n## Vraag 1 — Meerkeuze\nWat is het belangrijkste concept van ${topic}?\nA) Optie A\nB) Optie B\nC) Optie C\nD) Optie D\n\n## Vraag 2 — Open Vraag\nLeg in je eigen woorden uit hoe ${topic} werkt.\n\n## Vraag 3 — Praktijkopdracht\nBeschrijf een situatie waarin je ${topic} zou toepassen.\n\n## Zelftest\nScore: __/10\nReflectie: Wat ga je anders doen na deze les?`;
      case "scripts": return `🎬 VIDEO SCRIPT: ${topic}\n\n[0:00-0:30] HOOK\n"Heb je je ooit afgevraagd hoe ${topic} je leven kan veranderen?"\n\n[0:30-2:00] INTRO\nWelkom bij LofiBuddha Courses. Vandaag: ${topic}.\n\n[2:00-8:00] HOOFDCONTENT\nPunt 1 — De basis van ${topic}\nPunt 2 — Waarom dit belangrijk is\nPunt 3 — Hoe pas je het toe\n\n[8:00-10:00] CTA\n"Klaar om te starten? Bekijk de volledige cursus op lofibuddha.com"`;
      case "landing": return `🌐 LANDING PAGE: ${course?.title || topic}\n\n## Headline\nTransformeer je leven met ${topic}\n\n## Subheadline\nDe complete ${course?.level || "beginner"} cursus die je helpt om ${course?.goal || "je doelen te bereiken"}\n\n## Voor wie is dit?\n✅ ${course?.audience || "Iedereen"} die wil groeien\n✅ Mensen die klaar zijn voor verandering\n✅ Iedereen die ${topic} wil leren\n\n## Curriculum\n${course?.modules.map(m => `📖 ${m.title}`).join("\n") || "• Module 1"}\n\n## Prijs\n€49 — Eenmalige betaling, levenslange toegang\n\n## CTA\n[Start Vandaag Nog — 7 Dagen Gratis]`;
      case "emails": return `📧 EMAIL SEQUENCE\n\n## Email 1 — Welkom\nOnderwerp: Welkom bij ${topic}! 🎉\nPreview: Je eerste les staat klaar...\n\nBeste cursist,\n\nWelkom! Je hebt zojuist de eerste stap gezet...\n\n## Email 2 — Dag 3\nOnderwerp: Hoe haal je het meeste uit ${topic}\nPreview: 3 tips voor maximale resultaten...\n\n## Email 3 — Dag 7\nOnderwerp: Je voortgang tot nu toe 📊\nPreview: Tijd om te vieren wat je hebt bereikt...\n\n## Email 4 — Aanbieding\nOnderwerp: Verdiep je kennis — speciale aanbieding\nPreview: Alleen deze week: 30% korting op...`;
    }
  }

  // English
  switch (tool) {
    case "outline": return `📚 COURSE OUTLINE: ${course?.title || topic}\n\n${course?.modules.map((m, i) => `\n## Module ${i+1}: ${m.title}\n${m.description}\n\nLearning Objectives:\n- Objective 1 for this module\n- Objective 2 for this module\n- Objective 3 for this module\n\nLessons:\n${m.lessons.map(l => `- [${l.type.toUpperCase()}] ${l.title} (${l.duration})`).join("\n")}`).join("\n")}\n\n⏱️ Total Duration: ~${course?.modules.reduce((s, m) => s + m.lessons.length * 12, 0) || 240} minutes`;
    case "lesson": return `📝 LESSON: ${course?.modules[0]?.lessons[0]?.title || "Lesson 1"}\n\n## Hook (2 min)\nHave you ever wondered how ${topic} can transform your life?\n\n## Core Content (15 min)\n### Concept 1\nDetailed explanation with examples...\n\n### Concept 2\nPractical application...\n\n## Practice Exercise (5 min)\nTry this exercise: [...]\n\n## Key Takeaways\nToday you learned: [...]\n\n## Action Step\nApply this today by: [...]`;
    case "worksheets": return `📄 WORKSHEET: ${topic}\n\n## Question 1 — Multiple Choice\nWhat is the most important concept of ${topic}?\nA) Option A\nB) Option B\nC) Option C\nD) Option D\n\n## Question 2 — Open Ended\nExplain in your own words how ${topic} works.\n\n## Question 3 — Practical Application\nDescribe a situation where you would apply ${topic}.\n\n## Self-Assessment\nScore: __/10\nReflection: What will you do differently after this lesson?`;
    case "scripts": return `🎬 VIDEO SCRIPT: ${topic}\n\n[0:00-0:30] HOOK\n"Have you ever wondered how ${topic} can change your life?"\n\n[0:30-2:00] INTRO\nWelcome to LofiBuddha Courses. Today we're diving deep into ${topic}.\n\n[2:00-8:00] MAIN CONTENT\nPoint 1 — The foundations of ${topic}\nPoint 2 — Why this matters\nPoint 3 — How to apply it in your daily life\n\n[8:00-10:00] CTA\n"Ready to start? Join the full course at lofibuddha.com"\n\n---\n📱 SHORT CLIP (60 sec)\nHook + Point 1 + CTA`;
    case "landing": return `🌐 LANDING PAGE: ${course?.title || topic}\n\n## Headline\nTransform Your Life with ${topic}\n\n## Subheadline\nThe complete ${course?.level || "beginner"} course that helps you ${course?.goal || "achieve your goals"}\n\n## Who Is This For?\n✅ ${course?.audience || "Anyone"} who wants to grow\n✅ People ready for change\n✅ Anyone wanting to learn ${topic}\n\n## Curriculum\n${course?.modules.map(m => `📖 ${m.title}`).join("\n") || "• Module 1"}\n\n## Pricing\n$49 — One-time payment, lifetime access\n\n## FAQ\nQ: How long do I have access?\nA: Lifetime access to all materials.\n\n## CTA\n[Start Today — 7-Day Free Trial]`;
    case "emails": return `📧 EMAIL SEQUENCE\n\n## Email 1 — Welcome\nSubject: Welcome to ${topic}! 🎉\nPreview: Your first lesson is waiting...\n\nHi there,\n\nWelcome aboard! You just took the first step toward mastering ${topic}.\n\n## Email 2 — Day 3\nSubject: How to get the most out of ${topic}\nPreview: 3 tips for maximum results...\n\n## Email 3 — Day 7\nSubject: Your progress so far 📊\nPreview: Time to celebrate what you've accomplished...\n\n## Email 4 — Offer\nSubject: Take your skills further — special offer\nPreview: This week only: 30% off our advanced course...`;
  }
  return "Content generated successfully!";
}
