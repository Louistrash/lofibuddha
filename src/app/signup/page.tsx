"use client";

import { ArrowLeft, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignupForm() {
  const params = useSearchParams();
  const tier = params?.get("tier") || "zen";

  const tiers: Record<string, { name: string; price: string }> = {
    free: { name: "Free", price: "€0/month" },
    zen: { name: "Zen", price: "€4.99/month" },
    master: { name: "Master", price: "€9.99/month" },
  };

  const current = tiers[tier] || tiers.zen;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-text-primary">Start your journey</h1>
          <p className="text-text-muted mt-2">
            You&apos;re signing up for the <span className="text-accent-light font-medium">{current.name}</span> plan at {current.price}.
          </p>
        </div>

        <div className="glass p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full bg-bg-hover border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-bg-hover border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
              />
            </div>
          </div>

          <button className="btn-zen w-full py-3 flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Create Account
          </button>

          <p className="text-xs text-text-muted text-center">
            No credit card required for free trial. Cancel anytime.
          </p>
        </div>

        <div className="space-y-2">
          {["7-day free trial", "No credit card needed", "Cancel anytime", "Instant access"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-text-muted">
              <Check size={14} className="text-success flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
