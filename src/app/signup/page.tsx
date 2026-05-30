"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// ─── Tier definitions ──────────────────────────
const tiers = [
  {
    id: "zen",
    name: "Zen Beginner",
    price: "€0",
    period: "always free",
    description: "Begin your mindfulness journey with the essentials.",
    features: [
      "Live-syncing Lofi soundscapes",
      "10 AI Buddha chats per day",
      "4-4-4 box breathing visualizer",
    ],
    highlight: false,
    cta: "Start for free",
  },
  {
    id: "mindful",
    name: "Mindful Path",
    price: "€4,99",
    period: "per month",
    description: "Daily practices for a calmer, more present life.",
    features: [
      "Everything in Zen Beginner",
      "Unlimited AI Buddha spiritual chat",
      "Weekly curated Lofi playlist syncs",
      "Ad-free ambient audio downloads",
      "Complete ad-free experience",
    ],
    highlight: true,
    cta: "Begin Mindful Path",
  },
  {
    id: "enlightened",
    name: "Enlightened Path",
    price: "€12,99",
    period: "per month",
    description: "Deep transformation with personalized guidance.",
    features: [
      "Everything in Mindful Path",
      "Personalized daily guided meditations",
      "Custom spiritual roadmaps",
      "Priority support",
      "Early access to new ambient tracks",
    ],
    highlight: false,
    cta: "Begin Enlightened Path",
  },
];

export default function SignupPage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (tierId: string) => {
    setError(null);

    // Zen is free — no Stripe needed
    if (tierId === "zen") {
      window.location.href = "/landing";
      return;
    }

    setLoadingTier(tierId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoadingTier(null);
      }
    } catch {
      setError("Unable to connect. Please try again later.");
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen editorial-theme">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to LofiBuddha
          </Link>
          <Link
            href="/landing"
            className="flex items-center gap-2 font-serif text-lg tracking-wide text-stone-800"
          >
            <img src="/lofibuddha.png" alt="LofiBuddha" className="h-[31px] w-auto" />
            LofiBuddha
          </Link>
          <div className="w-[100px]" /> {/* Spacer for centering */}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 px-6 sm:px-10 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-amber-700 font-medium mb-6 animate-fade-in">
          Choose your path
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-800 mb-6 animate-fade-in">
          A practice for <span className="italic text-amber-700">every</span>{" "}
          stage of the journey
        </h1>
        <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-light animate-fade-in">
          Whether you&apos;re taking your first mindful breath or deepening a
          lifelong practice — there is a space for you here.
        </p>
      </section>

      {/* ── Error message ── */}
      {error && (
        <div className="max-w-lg mx-auto px-6 mb-8">
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm text-red-700 text-center">
            {error}
          </div>
        </div>
      )}

      {/* ── Tier cards ── */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 pb-24 sm:pb-36">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-8 sm:p-10 transition-all duration-500 ${
                tier.highlight
                  ? "bg-stone-800 text-white ring-2 ring-amber-500/30 scale-[1.02] shadow-2xl shadow-stone-900/10"
                  : "bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-lg"
              }`}
            >
              {/* Popular badge */}
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 rounded-full bg-amber-500 text-[11px] font-medium tracking-wider uppercase text-white shadow-lg shadow-amber-500/20">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p
                className={`text-[10px] tracking-[0.3em] uppercase font-medium mb-4 ${
                  tier.highlight ? "text-amber-400" : "text-amber-700"
                }`}
              >
                {tier.id === "zen"
                  ? "Free"
                  : tier.id === "mindful"
                    ? "Daily Practice"
                    : "Deep Transformation"}
              </p>

              <h3
                className={`font-serif text-2xl sm:text-3xl font-light mb-2 ${
                  tier.highlight ? "text-white" : "text-stone-800"
                }`}
              >
                {tier.name}
              </h3>

              <p
                className={`text-sm leading-relaxed mb-6 ${
                  tier.highlight ? "text-stone-300" : "text-stone-500"
                }`}
              >
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span
                  className={`font-serif text-4xl sm:text-5xl font-light ${
                    tier.highlight ? "text-white" : "text-stone-800"
                  }`}
                >
                  {tier.price}
                </span>
                <span
                  className={`text-sm ml-2 ${
                    tier.highlight ? "text-stone-400" : "text-stone-400"
                  }`}
                >
                  {tier.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-10">
                {tier.features.map((feat, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm ${
                      tier.highlight ? "text-stone-300" : "text-stone-600"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex-shrink-0 ${
                        tier.highlight ? "text-amber-400" : "text-amber-600"
                      }`}
                    >
                      —
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCheckout(tier.id)}
                disabled={loadingTier !== null}
                className={`w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.highlight
                    ? "bg-amber-500 text-white hover:bg-amber-400 disabled:bg-amber-600/50"
                    : "bg-stone-100 text-stone-800 hover:bg-stone-200 disabled:bg-stone-50 disabled:text-stone-400"
                }`}
              >
                {loadingTier === tier.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirecting...
                  </>
                ) : tier.id === "zen" ? (
                  tier.cta
                ) : (
                  <>
                    {tier.cta}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-stone-400 mt-12 max-w-md mx-auto leading-relaxed">
          All prices include VAT where applicable. Cancel anytime. Payments
          processed securely via Stripe. By subscribing you agree to our{" "}
          <Link
            href="/legal/terms"
            className="underline hover:text-stone-600 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="underline hover:text-stone-600 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      {/* ── Quote ── */}
      <section className="pb-24 sm:pb-36 px-6 sm:px-10">
        <div className="max-w-lg mx-auto text-center">
          <p className="font-serif text-xl sm:text-2xl italic text-stone-400 font-light leading-relaxed">
            &ldquo;Peace comes from within. Do not seek it without.&rdquo;
          </p>
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mt-4">
            — Buddha
          </p>
        </div>
      </section>
    </div>
  );
}
