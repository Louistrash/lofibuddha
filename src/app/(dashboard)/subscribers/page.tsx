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
  mindful: "bg-amber-500",
  enlightened: "bg-amber-300",
  zen: "bg-stone-500",
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
    } catch (err: any) {
      setError(err.message);
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
        <div className="flex items-center gap-3 text-text-muted">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-sm">Loading subscriber data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subscribers</h1>
          <p className="text-text-muted mt-1">
            Revenue and subscription metrics from Stripe.
          </p>
        </div>
        <div className="glass p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 px-4 py-2 rounded-lg bg-accent/10 text-accent-light text-sm hover:bg-accent/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxTier = Math.max(
    stats.tierDistribution.mindful,
    stats.tierDistribution.enlightened,
    stats.tierDistribution.zen,
    1
  );

  const statCards = [
    {
      label: "Active Subscribers",
      value: stats.activeSubscribers,
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "MRR",
      value: `€${stats.mrr.toFixed(2)}`,
      icon: Euro,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Churn Rate",
      value: `${stats.churnRate}%`,
      icon: TrendingDown,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      label: "Cancelled",
      value: stats.cancelledCount,
      icon: UserX,
      color: "text-stone-400",
      bg: "bg-stone-400/10",
    },
  ];

  const tiers = ["mindful", "enlightened", "zen"] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subscribers</h1>
          <p className="text-text-muted mt-1">
            Revenue and subscription metrics from Stripe.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column: tier distribution + recent subs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier distribution */}
        <div className="glass p-5 space-y-4">
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
                    <span className="text-text-secondary">
                      {TIER_LABELS[tier]}
                    </span>
                    <span className="text-text-primary font-medium tabular-nums">
                      {count}
                    </span>
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

          {/* Summary line */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Total active</span>
              <span className="text-text-primary font-medium">
                {stats.activeSubscribers}
              </span>
            </div>
          </div>
        </div>

        {/* Recent subscribers */}
        <div className="glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Recent Subscribers
            </h2>
          </div>

          {stats.recentSubscriptions.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">
              No subscribers yet.
            </p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {stats.recentSubscriptions.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">
                      {sub.email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-muted">
                        {TIER_LABELS[sub.tier] || sub.tier}
                      </span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">
                        €{sub.amount}/mo
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        sub.status === "active"
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="text-xs text-text-muted capitalize">
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
