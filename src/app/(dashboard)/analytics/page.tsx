"use client";

import { TrendingUp, Eye, ThumbsUp, MessageCircle, Share2, Calendar } from "lucide-react";

const metrics = [
  { label: "Total Views", value: "4,231", change: "+18%", icon: Eye, color: "text-blue-400" },
  { label: "Engagement Rate", value: "6.8%", change: "+2.1%", icon: ThumbsUp, color: "text-amber-400" },
  { label: "Comments", value: "142", change: "+24%", icon: MessageCircle, color: "text-emerald-400" },
  { label: "Shares", value: "89", change: "+12%", icon: Share2, color: "text-purple-400" },
];

const topContent = [
  { title: "5-Minute Morning Yoga Flow", views: "1.2K", platform: "YouTube", engagement: "8.2%" },
  { title: "Breathwork for Anxiety", views: "980", platform: "TikTok", engagement: "7.5%" },
  { title: "Lofi Beats for Study", views: "760", platform: "YouTube", engagement: "6.1%" },
  { title: "Mindful Stretching", views: "540", platform: "YouTube", engagement: "5.8%" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-muted mt-1">
          Track performance across all platforms and content types.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="glass p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">{m.label}</span>
                <Icon size={18} className={m.color} />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{m.value}</div>
                <span className="text-xs text-success">{m.change}</span>
                <span className="text-xs text-text-muted ml-1">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Content */}
      <div className="glass p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Top Performing Content
        </h2>
        <div className="space-y-0 divide-y divide-border">
          {topContent.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="text-xl font-bold text-text-muted w-6">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{item.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">{item.platform}</span>
                  <span className="text-xs text-text-muted">{item.views} views</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-success">{item.engagement}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
