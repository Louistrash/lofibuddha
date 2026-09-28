"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { Check, ArrowRight, Music, Heart, Headphones, Settings, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TierContent {
  headline: string;
  subheadline: string;
  quote: string;
  quoteAttribution: string;
  tierLabel: string;
  features: { label: string; locked?: boolean }[];
  nextSteps: { icon: "music" | "heart" | "headphones"; label: string; desc: string; href: string }[];
  ctaLabel: string;
  ctaHref: string;
}

const TIER_CONTENT: Record<string, TierContent> = {
  mindful: {
    headline: "Your Mindful Path begins",
    subheadline:
      "Unlimited AI Buddha guidance, curated Lofi playlists, and ad-free ambient audio — a calm space awaits.",
    quote: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    quoteAttribution: "Thich Nhat Hanh",
    tierLabel: "Mindful Path · €1,99/month",
    features: [
      { label: "Unlimited AI Buddha spiritual chat" },
      { label: "Weekly curated Lofi playlist syncs" },
      { label: "Ad-free ambient audio downloads" },
      { label: "Complete ad-free experience" },
    ],
    nextSteps: [
      { icon: "headphones", label: "Explore the library", desc: "Browse our full collection of ambient soundscapes and Lofi mixes", href: "/mindfulness" },
      { icon: "heart", label: "Chat with AI Buddha", desc: "Start a spiritual conversation with your personal AI guide", href: "https://lofibuddha.com/ai" },
      { icon: "music", label: "This week's playlist", desc: "Your first weekly curated Lofi playlist is ready", href: "/mindfulness" },
    ],
    ctaLabel: "Begin your practice",
    ctaHref: "/mindfulness",
  },
  enlightened: {
    headline: "The Enlightened Path awaits",
    subheadline:
      "Personalized meditations, custom spiritual roadmaps, and priority access — deep transformation starts now.",
    quote: "The way is not in the sky. The way is in the heart.",
    quoteAttribution: "Buddha",
    tierLabel: "Enlightened Path · €4,99/month",
    features: [
      { label: "Everything in Mindful Path" },
      { label: "Personalized daily guided meditations" },
      { label: "Custom spiritual roadmaps" },
      { label: "Priority support & early access" },
    ],
    nextSteps: [
      { icon: "heart", label: "Your spiritual roadmap", desc: "Answer a few questions and receive your personalized path", href: "https://lofibuddha.com/ai" },
      { icon: "headphones", label: "First guided meditation", desc: "A personalized meditation generated for your current state", href: "https://lofibuddha.com/ai" },
      { icon: "music", label: "Premium library", desc: "Full access to all ambient albums and exclusive tracks", href: "/mindfulness" },
    ],
    ctaLabel: "Begin your journey",
    ctaHref: "/mindfulness",
  },
  zen: {
    headline: "Welcome to the community",
    subheadline:
      "Zen Beginner gives you Lofi soundscapes, 10 daily AI Buddha chats, and the box breathing visualizer.",
    quote: "Peace comes from within. Do not seek it without.",
    quoteAttribution: "Buddha",
    tierLabel: "Zen Beginner · Free",
    features: [
      { label: "Live-syncing Lofi soundscapes" },
      { label: "10 AI Buddha chats per day" },
      { label: "4-4-4 box breathing visualizer" },
      { label: "Unlimited AI Buddha chats", locked: true },
      { label: "Weekly curated playlists", locked: true },
      { label: "Personalized guided meditations", locked: true },
    ],
    nextSteps: [
      { icon: "headphones", label: "Start listening", desc: "Tune into our live-syncing Lofi radio stream — no sign-in needed", href: "/mindfulness" },
      { icon: "heart", label: "Chat with AI Buddha", desc: "Begin a spiritual conversation with your AI guide", href: "https://lofibuddha.com/ai" },
      { icon: "music", label: "Explore premium", desc: "See what's unlocked on the Mindful and Enlightened paths", href: "/signup" },
    ],
    ctaLabel: "Begin your practice",
    ctaHref: "/mindfulness",
  },
};

const UNKNOWN_CONTENT: TierContent = {
  headline: "Welcome to the community",
  subheadline: "Your subscription is active. A calm space awaits — explore your new practice.",
  quote: "The journey of a thousand miles begins with a single step.",
  quoteAttribution: "Lao Tzu",
  tierLabel: "",
  features: [],
  nextSteps: [
    { icon: "headphones", label: "Explore the library", desc: "Browse ambient soundscapes", href: "/mindfulness" },
    { icon: "heart", label: "Start a practice", desc: "Begin with a simple breathing exercise", href: "/mindfulness" },
  ],
  ctaLabel: "Begin your practice",
  ctaHref: "/mindfulness",
};

const iconMap: Record<string, React.ElementType> = {
  music: Music,
  heart: Heart,
  headphones: Headphones,
};

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params?.get("session_id") || "";
  const searchTier = params?.get("tier") || "";

  const [tier, setTier] = useState("");
  const [tierName, setTierName] = useState("");
  const [tierPrice, setTierPrice] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [showMark, setShowMark] = useState(false);
  const markTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    markTimeout.current = setTimeout(() => setShowMark(true), 80);
    return () => {
      if (markTimeout.current) clearTimeout(markTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (!sessionId && !searchTier) {
      setLoading(false);
      return;
    }

    if (searchTier) {
      setTier(searchTier);
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tier) {
          setTier(data.tier);
          setTierName(data.tierName || "");
          setTierPrice(data.tierPrice || "");
          setCustomerId(data.customerId || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId, searchTier]);

  const handlePortal = useCallback(async () => {
    if (!customerId) return;
    setPortalLoading(true);
    setPortalError("");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error || "Unable to open customer portal.");
        setPortalLoading(false);
      }
    } catch {
      setPortalError("Unable to connect. Please try again.");
      setPortalLoading(false);
    }
  }, [customerId]);

  const content = TIER_CONTENT[tier] || UNKNOWN_CONTENT;
  const hasCustomerPortal = !!customerId;
  const badge =
    tierName || content.tierLabel
      ? `${tierName || content.tierLabel.split(" · ")[0]}${
          tierPrice && tierPrice !== "Free"
            ? ` · ${tierPrice}`
            : content.tierLabel.includes(" · ")
              ? ` · ${content.tierLabel.split(" · ").slice(1).join(" · ")}`
              : ""
        }`
      : "";

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap");

        body {
          background: #08070c !important;
          color: #f6f2ea !important;
          scroll-behavior: smooth;
        }

        .success-page {
          font-family: "Instrument Sans", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .success-page h1,
        .success-page h2 {
          font-family: "DM Serif Display", Georgia, serif;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes markIn {
          0% {
            opacity: 0;
            transform: scale(0.82);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .s-fade-1 {
          animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
        }
        .s-fade-2 {
          animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both;
        }
        .s-fade-3 {
          animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }
        .s-fade-4 {
          animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.42s both;
        }
        .s-fade-5 {
          animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.54s both;
        }
        .s-fade-6 {
          animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.66s both;
        }
        .s-mark {
          animation: markIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .s-fade-1,
          .s-fade-2,
          .s-fade-3,
          .s-fade-4,
          .s-fade-5,
          .s-fade-6,
          .s-mark {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="success-page relative min-h-screen overflow-x-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(228,184,114,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(108,116,255,0.08), transparent 50%), #08070c",
          paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-[13px] text-[#9e9aab] transition-colors hover:text-[#f6f2ea]"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
          <Link href="/landing" className="flex items-center gap-2.5">
            <img
              src="/icon-transparent.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span
              className="text-lg tracking-wide text-[#f6f2ea]"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              LofiBuddha
            </span>
          </Link>
          <div className="w-14" aria-hidden />
        </header>

        {loading && (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#63606f] border-t-[#e4b872]" />
          </div>
        )}

        {!loading && (
          <main className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
            <div className="text-center">
              <div
                className={`mx-auto mb-10 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(228,184,114,0.32)] bg-[rgba(228,184,114,0.12)] ${showMark ? "s-mark" : "opacity-0"}`}
              >
                <Check size={28} className="text-[#e4b872]" strokeWidth={2} />
              </div>

              <h1 className="s-fade-1 mb-3 text-[clamp(1.85rem,5vw,2.75rem)] font-normal leading-[1.15] tracking-tight text-[#f6f2ea]">
                {content.headline}
              </h1>

              {badge && (
                <p className="s-fade-2 mb-5 text-sm font-medium text-[#e4b872]">
                  {badge}
                </p>
              )}

              <p className="s-fade-3 mx-auto mb-12 max-w-md text-base leading-relaxed text-[#9e9aab]">
                {content.subheadline}
              </p>

              {content.features.length > 0 && (
                <section className="s-fade-4 mb-12 text-left">
                  <h2 className="mb-5 text-center text-lg font-normal text-[#f6f2ea]">
                    What you now have
                  </h2>
                  <ul className="space-y-3.5 border-y border-[rgba(255,255,255,0.07)] py-6">
                    {content.features.map((feat, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-3 text-sm leading-relaxed ${feat.locked ? "text-[#63606f]" : "text-[#9e9aab]"}`}
                      >
                        {feat.locked ? (
                          <span className="mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border border-[#63606f]" />
                        ) : (
                          <Check
                            size={15}
                            className="mt-0.5 flex-shrink-0 text-[#e4b872]"
                          />
                        )}
                        <span className={feat.locked ? "opacity-70" : ""}>
                          {feat.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {content.nextSteps.length > 0 && (
                <section className="s-fade-5 mb-12">
                  <h2 className="mb-6 text-lg font-normal text-[#f6f2ea]">
                    Where to begin
                  </h2>
                  <div className="flex flex-col gap-1">
                    {content.nextSteps.map((step, i) => {
                      const Icon = iconMap[step.icon] || Music;
                      return (
                        <Link
                          key={i}
                          href={step.href}
                          className="group flex items-center gap-4 rounded-2xl px-3 py-4 text-left transition-colors hover:bg-[rgba(255,255,255,0.045)]"
                        >
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(228,184,114,0.12)] text-[#e4b872] transition-colors group-hover:bg-[rgba(228,184,114,0.2)]">
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-[#f6f2ea]">
                              {step.label}
                            </div>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#63606f]">
                              {step.desc}
                            </p>
                          </div>
                          <ArrowRight
                            size={14}
                            className="flex-shrink-0 text-[#63606f] transition-transform group-hover:translate-x-0.5 group-hover:text-[#e4b872]"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="s-fade-6 space-y-3">
                <Link
                  href={content.ctaHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#e4b872] to-[#a67c3d] px-8 py-4 text-sm font-semibold text-[#08070c] transition-opacity hover:opacity-95 sm:w-auto"
                >
                  {content.ctaLabel}
                  <ArrowRight size={16} />
                </Link>

                {hasCustomerPortal && (
                  <div>
                    <button
                      type="button"
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.14)] px-6 py-3.5 text-sm text-[#9e9aab] transition-colors hover:border-[rgba(255,255,255,0.22)] hover:text-[#f6f2ea] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {portalLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Opening portal...
                        </>
                      ) : (
                        <>
                          <Settings size={14} />
                          Manage subscription
                          <ExternalLink size={12} className="opacity-50" />
                        </>
                      )}
                    </button>
                    {portalError && (
                      <p className="mt-2 text-xs text-[#ff9a3d]">{portalError}</p>
                    )}
                  </div>
                )}

                {tier === "zen" && (
                  <div>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 text-sm text-[#e4b872] transition-opacity hover:opacity-80"
                    >
                      See premium plans
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

              <blockquote className="s-fade-6 mt-16 border-t border-[rgba(255,255,255,0.07)] pt-12">
                <p
                  className="mx-auto max-w-sm text-lg italic leading-relaxed text-[#9e9aab]"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  &ldquo;{content.quote}&rdquo;
                </p>
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[#63606f]">
                  — {content.quoteAttribution}
                </p>
              </blockquote>
            </div>
          </main>
        )}
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: "#08070c" }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#63606f] border-t-[#e4b872]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
