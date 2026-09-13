"use client";

import { TrendingUp, Eye, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

const metrics = [
  { label: "Total Views", value: "4,231", change: "+18%", icon: Eye, color: "text-journey-sleep", bg: "bg-journey-sleep/10" },
  { label: "Engagement Rate", value: "6.8%", change: "+2.1%", icon: ThumbsUp, color: "text-journey-focus", bg: "bg-journey-focus/10" },
  { label: "Comments", value: "142", change: "+24%", icon: MessageCircle, color: "text-journey-breathe", bg: "bg-journey-breathe/10" },
  { label: "Shares", value: "89", change: "+12%", icon: Share2, color: "text-journey-relax", bg: "bg-journey-relax/10" },
];

const topContent = [
  { title: "5-Minute Morning Yoga Flow", views: "1.2K", platform: "YouTube", engagement: "8.2%" },
  { title: "Breathwork for Anxiety", views: "980", platform: "TikTok", engagement: "7.5%" },
  { title: "Lofi Beats for Study", views: "760", platform: "YouTube", engagement: "6.1%" },
  { title: "Mindful Stretching", views: "540", platform: "YouTube", engagement: "5.8%" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Track performance across all platforms and content types."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} lit className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">{m.label}</span>
                <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <Icon size={16} className={m.color} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{m.value}</div>
                <span className="text-xs text-success">{m.change}</span>
                <span className="text-xs text-text-muted ml-1">vs last week</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <TrendingUp size={16} className="text-accent-light" />
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
      </Card>
    </div>
  );
}
