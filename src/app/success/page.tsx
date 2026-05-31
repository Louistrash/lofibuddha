"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ArrowRight, Music, Heart, Quote, Headphones, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ── Tier-specific content ─────────────────────
interface TierContent {
  headline: string;
  subheadline: string;
  quote: string;
  quoteAttribution: string;
  features: string[];
  nextSteps: { icon: "music" | "heart" | "headphones"; label: string; href: string }[];
  ctaLabel: string;
  ctaHref: string;
}

const TIER_CONTENT: Record<string, TierContent> = {
  mindful: {
    headline: "Your Mindful Path begins",
    subheadline:
      "You now have unlimited access to AI Buddha spiritual guidance, weekly Lofi playlist syncs, and ad-free ambient downloads. A calm space awaits.",
    quote: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    quoteAttribution: "Thich Nhat Hanh",
    features: [
      "Unlimited AI Buddha spiritual chat",
      "Weekly curated Lofi playlist syncs",
      "Ad-free ambient audio downloads",
      "Complete ad-free experience",
    ],
    nextSteps: [
      { icon: "headphones", label: "Explore the Lofi library", href: "/browse" },
      { icon: "heart", label: "Start a chat with AI Buddha", href: "/browse" },
      { icon: "music", label: "Listen to this week's playlist", href: "/browse" },
    ],
    ctaLabel: "Begin your practice",
    ctaHref: "/browse",
  },
  enlightened: {
    headline: "The Enlightened Path awaits",
    subheadline:
      "You've unlocked everything — personalized daily meditations, custom spiritual roadmaps, and priority access. This is deep transformation.",
    quote: "The way is not in the sky. The way is in the heart.",
    quoteAttribution: "Buddha",
    features: [
      "Everything in Mindful Path",
      "Personalized daily guided meditations",
      "Custom spiritual roadmaps",
      "Priority support & early access",
    ],
    nextSteps: [
      { icon: "heart", label: "Complete your spiritual roadmap", href: "/browse" },
      { icon: "headphones", label: "Receive your first meditation", href: "/browse" },
      { icon: "music", label: "Explore the Lofi library", href: "/browse" },
    ],
    ctaLabel: "Begin your journey",
    ctaHref: "/browse",
  },
  zen: {
    headline: "Welcome to the community",
    subheadline:
      "You've joined Zen Beginner — free access to Lofi soundscapes, 10 daily AI Buddha chats, and the box breathing visualizer.",
    quote: "Peace comes from within. Do not seek it without.",
    quoteAttribution: "Buddha",
    features: [
      "Live-syncing Lofi soundscapes",
      "10 AI Buddha chats per day",
      "4-4-4 box breathing visualizer",
    ],
    nextSteps: [
      { icon: "headphones", label: "Start listening", href: "/browse" },
      { icon: "heart", label: "Try a breathing session", href: "/browse" },
    ],
    ctaLabel: "Begin your practice",
    ctaHref: "/browse",
  },
};

const UNKNOWN_CONTENT: TierContent = {
  headline: "Welcome to the community",
  subheadline:
    "Your subscription is active. A calm space awaits — explore your new practice.",
  quote: "The journey of a thousand miles begins with a single step.",
  quoteAttribution: "Lao Tzu",
  features: [],
  nextSteps: [
    { icon: "headphones", label: "Explore the library", href: "/browse" },
    { icon: "heart", label: "Start a practice", href: "/browse" },
  ],
  ctaLabel: "Begin your practice",
  ctaHref: "/browse",
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

  const [tier, setTier] = useState<string>("");
  const [tierName, setTierName] = useState<string>("");
  const [tierPrice, setTierPrice] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string>("");
  const [scrollY, setScrollY] = useState(0);

  // ── Scroll tracking for nav glassmorphism ──
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Fetch tier info from session ──
  useEffect(() => {
    if (!sessionId && !searchTier) {
      setLoading(false);
      return;
    }

    // If tier is in URL (zen free tier redirect), use it directly
    if (searchTier) {
      const content = TIER_CONTENT[searchTier] || UNKNOWN_CONTENT;
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

  // ── Customer Portal redirect ──
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

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

        body {
          background: #faf8f5 !important;
          color: #1c1917 !important;
          scroll-behavior: smooth;
        }

        .success-page h1, .success-page h2, .success-page h3 {
          font-family: "Playfair Display", Georgia, serif;
        }
        .success-page {
          font-family: "Inter", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ensoSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .anim-fade-1 { animation: fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; opacity: 0; }
        .anim-fade-2 { animation: fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards; opacity: 0; }
        .anim-fade-3 { animation: fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards; opacity: 0; }
        .anim-fade-4 { animation: fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s forwards; opacity: 0; }
        .anim-fade-5 { animation: fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s forwards; opacity: 0; }
        .anim-fade-6 { animation: fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.0s forwards; opacity: 0; }
        .anim-fade-7 { animation: fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s forwards; opacity: 0; }

        .anim-scale { animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
        .anim-enso { animation: ensoSpin 30s linear infinite; }

        .anim-check circle {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: checkDraw 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
        }

        .success-page ::selection {
          background: rgba(176, 128, 80, 0.15);
          color: #1c1917;
        }
      `}</style>

      <div className="success-page min-h-screen">
        {/* ── Navigation ── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60"
          style={{
            background:
              scrollY > 50
                ? "rgba(250,248,245,0.92)"
                : "rgba(250,248,245,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
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
              className="flex items-center gap-2.5"
            >
              <img
                src="/lofibuddha.png"
                alt="LofiBuddha"
                className="h-[35px] w-auto"
              />
              <span className="font-serif text-lg tracking-wide text-stone-800">
                LofiBuddha
              </span>
            </Link>
            <div className="w-[100px]" />
          </div>
        </nav>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {/* ── Main content ── */}
        {!loading && (
          <div className="pt-32 pb-24 sm:pt-40 sm:pb-36 px-6 sm:px-10">
            <div className="max-w-2xl mx-auto text-center">
              {/* ── Animated checkmark with enso ring ── */}
              <div className="relative w-28 h-28 mx-auto mb-12">
                {/* Enso circle — spinning */}
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 w-full h-full anim-enso"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#b08050"
                    strokeWidth="0.6"
                    strokeDasharray="95 280"
                    strokeLinecap="round"
                    transform="rotate(-30 60 60)"
                    opacity="0.3"
                  />
                </svg>
                {/* Checkmark circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[68px] h-[68px] rounded-full bg-amber-100/60 anim-scale flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-9 h-9 anim-check"
                      fill="none"
                    >
                      <circle cx="12" cy="12" r="11" stroke="#b08050" strokeWidth="1.5" />
                      <path
                        d="M7 12.5l3 3 7-7"
                        stroke="#b08050"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ── Headline ── */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-stone-800 mb-4 anim-fade-1">
                {content.headline}
              </h1>

              {/* ── Tier badge + price ── */}
              {(tierName || tierPrice) && (
                <div className="anim-fade-2 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/60 text-amber-800 text-sm font-medium">
                    {tierName}
                    {tierPrice && (
                      <span className="text-amber-600 font-normal">
                        · {tierPrice}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* ── Subheadline ── */}
              <p className="text-stone-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-14 anim-fade-3">
                {content.subheadline}
              </p>

              {/* ── Features ── */}
              {content.features.length > 0 && (
                <div className="bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-10 mb-12 text-left anim-fade-4">
                  <h2 className="font-serif text-lg font-medium text-stone-700 mb-5">
                    What you now have
                  </h2>
                  <ul className="space-y-3">
                    {content.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-stone-600 text-sm"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 flex-shrink-0 text-amber-600"
                        />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Next steps ── */}
              {content.nextSteps.length > 0 && (
                <div className="mb-14 anim-fade-5">
                  <h2 className="font-serif text-lg font-medium text-stone-700 mb-5">
                    Where to begin
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {content.nextSteps.map((step, i) => {
                      const Icon = iconMap[step.icon] || Music;
                      return (
                        <Link
                          key={i}
                          href={step.href}
                          className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-300/40 hover:shadow-md transition-all duration-500"
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100/60 transition-colors duration-500">
                            <Icon
                              size={18}
                              className="text-amber-700 group-hover:text-amber-800 transition-colors"
                            />
                          </div>
                          <span className="text-sm text-stone-600 group-hover:text-stone-800 transition-colors text-center">
                            {step.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── CTA ── */}
              <div className="space-y-4 anim-fade-6">
                <Link
                  href={content.ctaHref}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-stone-800 text-white text-sm tracking-wide hover:bg-stone-700 transition-all"
                >
                  {content.ctaLabel}
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* ── Customer Portal ── */}
              {customerId && (
                <div className="mt-8 anim-fade-7">
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2 disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin" />
                        Opening portal...
                      </span>
                    ) : (
                      "Manage your subscription"
                    )}
                  </button>
                  {portalError && (
                    <p className="text-xs text-amber-700 mt-2">{portalError}</p>
                  )}
                </div>
              )}

              {/* ── Quote ── */}
              <div className="mt-20 pt-16 border-t border-stone-200/60 anim-fade-6">
                <Quote
                  size={20}
                  className="text-amber-300 mx-auto mb-4"
                />
                <p className="font-serif text-xl sm:text-2xl italic text-stone-400 font-light leading-relaxed max-w-md mx-auto">
                  &ldquo;{content.quote}&rdquo;
                </p>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mt-4">
                  — {content.quoteAttribution}
                </p>
              </div>

              {/* ── Footer links ── */}
              <div className="mt-16 flex items-center justify-center gap-6 text-xs text-stone-400">
                <Link
                  href="/landing"
                  className="hover:text-stone-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/signup"
                  className="hover:text-stone-600 transition-colors"
                >
                  Plans
                </Link>
                <Link
                  href="/browse"
                  className="hover:text-stone-600 transition-colors"
                >
                  Browse
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f5" }}>
          <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
