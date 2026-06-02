"use client";

import {
  FileText, Share2, Video, Image, Podcast,
  BookOpen, TrendingUp, Zap, Clock, Plus,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Content Pieces", value: "24", change: "+3 today", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Scheduled Posts", value: "8", change: "Next: 2h", icon: Share2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Videos Rendered", value: "13", change: "7 pending", icon: Video, color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Total Views", value: "4.2K", change: "↑ 18%", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-400/10" },
];

const quickActions = [
  { label: "New Script", icon: FileText, href: "/content", desc: "AI writer" },
  { label: "Schedule Post", icon: Clock, href: "/social", desc: "Cross-platform" },
  { label: "Render Video", icon: Video, href: "/video", desc: "HyperFrames" },
  { label: "Generate Image", icon: Image, href: "/images", desc: "Brand assets" },
  { label: "New Podcast", icon: Podcast, href: "/podcast", desc: "Record & edit" },
  { label: "Create Course", icon: BookOpen, href: "/courses", desc: "Lesson builder" },
];

const recentActivity = [
  { action: "Landing page live", target: "lofibuddha.com", time: "Just now", icon: Zap },
  { action: "Video rendered", target: "5-min Yoga Flow", time: "15 min ago", icon: Video },
  { action: "Post scheduled", target: "TikTok — Breathwork short", time: "1 hour ago", icon: Share2 },
  { action: "Image generated", target: "Quote card: 'Peace Within'", time: "2 hours ago", icon: Image },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, Bodhi
        </h1>
        <p className="text-text-muted mt-1">
          Your creative command center.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <a href="https://aibuddha.net" target="_blank" rel="noopener" className="text-xs text-accent-light hover:text-accent transition-colors">
            ← View AI Buddha site
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon size={18} className={stat.color} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                <div className="text-xs text-text-muted mt-0.5">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="glass p-5 lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-hover/50 hover:bg-bg-hover border border-transparent hover:border-border transition-all group">
                  <Icon size={22} className="text-text-secondary group-hover:text-accent-light transition-colors" />
                  <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">{action.label}</span>
                  <span className="text-[10px] text-text-muted">{action.desc}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="glass p-5 lg:col-span-3 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Recent Activity</h2>
          <div className="space-y-0 divide-y divide-border">
            {recentActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">
                      {item.action}: <span className="text-accent-light">{item.target}</span>
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass p-6 flex flex-col sm:flex-row items-center gap-4 justify-between bg-gradient-to-r from-accent/5 to-transparent">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Ready to create?</h3>
          <p className="text-sm text-text-muted mt-1">Generate a full content batch in one go.</p>
        </div>
        <Link href="/content" className="btn-zen flex items-center gap-2 flex-shrink-0">
          <Plus size={18} /> Create Content
        </Link>
      </div>
    </div>
  );
}
