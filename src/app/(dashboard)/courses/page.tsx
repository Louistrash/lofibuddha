"use client";

import { BookOpen, Layers, FileText, Play, Download, Plus, Wand2 } from "lucide-react";

export default function CoursesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Course Creator</h1>
        <p className="text-text-muted mt-1">
          Build online courses with AI-generated outlines, lessons, and worksheets.
        </p>
      </div>

      {/* New Course CTA */}
      <div className="glass p-6 flex flex-col sm:flex-row items-center gap-4 justify-between bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Wand2 size={24} className="text-accent-light" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Course Generator</h3>
            <p className="text-xs text-text-muted mt-1">
              Describe your topic, get a full course outline with lessons, exercises, and resources.
            </p>
          </div>
        </div>
        <button className="btn-zen flex items-center gap-2 flex-shrink-0">
          <Plus size={18} />
          New Course
        </button>
      </div>

      {/* Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Course Outline", desc: "Module structure, learning objectives", icon: Layers },
          { label: "Lesson Generator", desc: "Full lesson content with examples", icon: FileText },
          { label: "Worksheets", desc: "Printable exercises & quizzes", icon: Download },
          { label: "Video Scripts", desc: "Lesson narration scripts", icon: Play },
          { label: "Course Landing Page", desc: "Sales page copy", icon: BookOpen },
          { label: "Email Sequence", desc: "Welcome & drip emails", icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="glass p-4 space-y-3 hover:border-accent/30 cursor-pointer transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Icon size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{t.label}</h3>
                <p className="text-xs text-text-muted mt-0.5">{t.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
