"use client";

import { Check, ArrowRight, Clapperboard, Music2, Camera, Globe, BarChart3, Zap } from "lucide-react";
import Link from "next/link";

const checklist = [
  {
    category: "Landing Page",
    items: [
      { task: "Hero section with video preview", done: true },
      { task: "3-tier pricing (Free / Zen / Master)", done: true },
      { task: "Testimonial cards", done: true },
      { task: "Email signup form", done: true },
      { task: "SEO meta tags", done: true },
    ],
  },
  {
    category: "Content",
    items: [
      { task: "13 videos rendered (YouTube + Shorts + Square)", done: true },
      { task: "3 blog posts written (Focus, Yoga, Breathwork)", done: true },
      { task: "3 YouTube thumbnails generated", done: true },
      { task: "Free content browse page (/browse)", done: true },
      { task: "Premium content placeholders", done: true },
    ],
  },
  {
    category: "Payments",
    items: [
      { task: "Stripe SDK installed", done: true },
      { task: "Checkout API endpoint", done: true },
      { task: "Webhook endpoint", done: true },
      { task: "Success / Cancel pages", done: true },
      { task: "Plan metadata mapping", done: true },
      { task: "Live Stripe price IDs (Mindful €4,99 / Enlightened €12,99)", done: true },
      { task: "Webhook subscriber provisioning", done: true },
    ],
  },
  {
    category: "Social (Ready for API Keys)",
    items: [
      { task: "Content calendar with 8 scheduled posts", done: true },
      { task: "Media gallery with all videos", done: true },
      { task: "YouTube platform card", done: true },
      { task: "TikTok platform card", done: true },
      { task: "Instagram platform card", done: true },
    ],
  },
  {
    category: "To Do",
    items: [
      { task: "YouTube OAuth + upload API", done: false },
      { task: "TikTok API integration", done: false },
      { task: "Instagram Graph API", done: false },
      { task: "Analytics dashboard with real data", done: false },
      { task: "Blog posts with real content", done: false },
    ],
  },
];

const stats = [
  { label: "Pages Built", value: "8", icon: Globe, color: "text-blue-400" },
  { label: "Videos Rendered", value: "13", icon: Clapperboard, color: "text-red-400" },
  { label: "Blog Posts", value: "3", icon: Zap, color: "text-amber-400" },
  { label: "API Endpoints", value: "5", icon: BarChart3, color: "text-emerald-400" },
];

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="font-semibold text-text-primary">
            🧘 LofiBuddha
          </Link>
          <Link href="/mindfulness" className="text-sm text-accent-light hover:text-accent">
            Browse Content →
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">🚀 Launch Checklist</h1>
          <p className="text-text-muted mt-2">
            Everything built in the 6-hour Growth Sprint. Track progress here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass p-4 text-center space-y-1">
              <s.icon size={20} className={`mx-auto ${s.color}`} />
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="space-y-6">
          {checklist.map((section) => {
            const done = section.items.filter((i) => i.done).length;
            const total = section.items.length;
            return (
              <div key={section.category} className="glass p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                    {section.category}
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${done === total ? "bg-success/10 text-success" : "bg-accent/10 text-accent-light"}`}>
                    {done}/{total}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <div key={item.task} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${item.done ? "bg-success/10 text-success" : "bg-bg-hover text-text-muted"}`}>
                        {item.done ? <Check size={12} /> : <ArrowRight size={12} />}
                      </div>
                      <span className={item.done ? "text-text-primary" : "text-text-muted"}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Steps */}
        <div className="glass p-6 text-center space-y-4 bg-gradient-to-b from-accent/5 to-transparent">
          <h2 className="text-xl font-bold text-text-primary">Ready to go live?</h2>
          <p className="text-text-muted max-w-md mx-auto">
            Add your Stripe keys, connect social APIs, and flip the switch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/settings" className="btn-zen text-sm px-6 py-2.5">
              Configure API Keys
            </Link>
            <Link href="/social" className="text-sm text-text-secondary hover:text-text-primary transition-colors px-4 py-2.5">
              Social Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
