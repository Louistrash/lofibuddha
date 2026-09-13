"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Euro,
  TrendingDown,
  UserX,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Button, Card, PageHeader, Spinner } from "@/components/ui";

interface SubscriberStats {
  activeSubscribers: number;
  mrr: number;
  churnRate: number;
  totalEver: number;
  cancelledCount: number;
  tierDistribution: {
    mindful: number;
    enlightened: number;
    zen: number;
  };
  recentSubscriptions: Array<{
    email: string;
    tier: string;
    status: string;
    amount: number;
    since: string;
  }>;
}

const TIER_LABELS: Record<string, string> = {
  mindful: "Mindful Path",
  enlightened: "Enlightened Path",
  zen: "Zen Beginner",
};

const TIER_COLORS: Record<string, string> = {
  mindful: "bg-accent",
  enlightened: "bg-accent-light",
  zen: "bg-text-muted",
};

export default function SubscribersPage() {
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/subscribers");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Subscribers"
          description="Revenue and subscription metrics from Stripe."
        />
        <Card className="p-6 text-center border-error/30">
          <p className="text-error text-sm">{error}</p>
          <Button size="sm" variant="soft" onClick={fetchStats} className="mt-3">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const maxTier = Math.max(
    stats.tierDistribution.mindful,
    stats.tierDistribution.enlightened,
    stats.tierDistribution.zen,
    1,
  );

  const statCards = [
    { label: "Active Subscribers", value: stats.activeSubscribers, icon: Users, color: "text-journey-breathe", bg: "bg-journey-breathe/10" },
    { label: "MRR", value: `€${stats.mrr.toFixed(2)}`, icon: Euro, color: "text-journey-focus", bg: "bg-journey-focus/10" },
    { label: "Churn Rate", value: `${stats.churnRate}%`, icon: TrendingDown, color: "text-journey-relax", bg: "bg-journey-relax/10" },
    { label: "Cancelled", value: stats.cancelledCount, icon: UserX, color: "text-text-muted", bg: "bg-bg-hover" },
  ];

  const tiers = ["mindful", "enlightened", "zen"] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscribers"
        description="Revenue and subscription metrics from Stripe."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchStats}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} lit className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary">{card.value}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Tier Distribution
            </h2>
          </div>

          <div className="space-y-4">
            {tiers.map((tier) => {
              const count = stats.tierDistribution[tier];
              const pct = maxTier > 0 ? (count / maxTier) * 100 : 0;
              return (
                <div key={tier} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{TIER_LABELS[tier]}</span>
                    <span className="text-text-primary font-medium tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-hover overflow-hidden">
                    <div
                      className={`h-full rounded-full ${TIER_COLORS[tier]} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Total active</span>
              <span className="text-text-primary font-medium">{stats.activeSubscribers}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Recent Subscribers
            </h2>
          </div>

          {stats.recentSubscriptions.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">No subscribers yet.</p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {stats.recentSubscriptions.map((sub, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{sub.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-muted">{TIER_LABELS[sub.tier] || sub.tier}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">€{sub.amount}/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        sub.status === "active" ? "bg-success" : "bg-journey-focus"
                      }`}
                    />
                    <span className="text-xs text-text-muted capitalize">{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
