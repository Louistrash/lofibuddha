"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Moon } from "lucide-react";
import { TIER_AMOUNTS, currencyFromClientHints, formatPrice, type PaidTier } from "@/lib/pricing";

const tiers = [
  {
    id: "zen",
    name: "Zen Beginner",
    price: "Free",
    period: "always",
    description: "Begin your mindfulness journey.",
    features: ["Lofi soundscapes", "10 AI Buddha chats/day", "Breathing visualizer"],
    cta: "Start for free",
    accent: "#7a9a6a",
  },
  {
    id: "mindful",
    name: "Mindful Path",
    priceTier: "mindful" as const,
    period: "/month",
    description: "Daily practices for a calmer life.",
    features: ["Everything in Zen", "Unlimited AI Buddha chats", "Weekly curated playlists", "Ad-free audio downloads", "Ad-free experience"],
    cta: "Begin Mindful Path",
    highlight: true,
    accent: "#c49464",
  },
  {
    id: "enlightened",
    name: "Enlightened Path",
    priceTier: "enlightened" as const,
    period: "/month",
    description: "Deep transformation with guidance.",
    features: ["Everything in Mindful", "Personalized meditations", "Custom spiritual roadmaps", "Priority support", "Early access to new tracks"],
    cta: "Begin Enlightened Path",
    accent: "#b08050",
  },
];


/** Country decides the currency, the reader's language only decides notation. */
function usePricingDisplay() {
  return useMemo(() => {
    const locale = typeof navigator !== "undefined" ? navigator.language : null;
    let timeZone: string | null = null;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {}
    const currency = currencyFromClientHints({ locale, timeZone });
    return {
      currency,
      price: (tier: PaidTier) => formatPrice(TIER_AMOUNTS[tier][currency], currency, locale),
    };
  }, []);
}

export default function SignupPage() {
  const pricing = usePricingDisplay();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (tierId: string) => {
    setError(null);
    if (tierId === "zen") { window.location.href = "/mindfulness"; return; }
    setLoadingTier(tierId);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: tierId }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Something went wrong.");
    } catch { setError("Could not reach the server."); }
    setLoadingTier(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e2d8", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "800px", height: "800px", borderRadius: "50%", filter: "blur(200px)", opacity: 0.05, background: "radial-gradient(circle, rgba(212,180,138,0.5) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "600px", height: "600px", borderRadius: "50%", filter: "blur(180px)", opacity: 0.04, background: "radial-gradient(circle, rgba(180,140,100,0.4) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto", padding: "clamp(2rem,5vw,4rem) 24px" }}>
        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#6b655a", fontSize: "13px", textDecoration: "none", marginBottom: "clamp(2rem,5vw,3rem)", transition: "color 0.2s" }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(3rem,6vw,5rem)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "20px", height: "1px", background: "linear-gradient(90deg, transparent, #d4b48a)" }} />
            <Moon size={16} color="#d4b48a" strokeWidth={1.5} />
            <span style={{ width: "20px", height: "1px", background: "linear-gradient(90deg, #d4b48a, transparent)" }} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 400, color: "#f5ede0", marginBottom: "12px", lineHeight: 1.15 }}>
            Choose your path
          </h1>
          <p style={{ fontSize: "clamp(1rem,2vw,1.1rem)", color: "#7a7468", maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>
            Start free. Upgrade when you're ready for deeper practice.
          </p>
        </div>

        {/* Tiers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "clamp(2rem,4vw,3rem)" }}>
          {tiers.map((tier) => (
            <div key={tier.id} className="tier-card" style={{
              background: tier.highlight ? "linear-gradient(180deg, rgba(196,148,100,0.06) 0%, rgba(26,26,24,0.8) 100%)" : "rgba(26,26,24,0.6)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: tier.highlight ? "1px solid rgba(196,148,100,0.2)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: "24px", padding: "clamp(1.5rem,3vw,2rem)",
              display: "flex", flexDirection: "column", position: "relative",
              transition: "all 0.3s ease",
            }}>
              {tier.highlight && (
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #c49464, #b08050)", color: "#0a0a0a", padding: "4px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.03em" }}>
                  Most Popular
                </div>
              )}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "22px", fontWeight: 400, color: "#f5ede0", marginBottom: "4px" }}>{tier.name}</h3>
                <p style={{ fontSize: "13px", color: "#7a7468", margin: 0 }}>{tier.description}</p>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 700, color: tier.highlight ? "#d4b48a" : "#f5ede0", fontFamily: "'DM Serif Display', Georgia, serif" }}>{tier.priceTier ? pricing.price(tier.priceTier) : tier.price}</span>
                <span style={{ fontSize: "14px", color: "#6b655a", marginLeft: "4px" }}>{tier.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px", fontSize: "13px", color: "#8a8278", lineHeight: 1.5 }}>
                    <Check size={14} color={tier.accent} style={{ marginTop: "2px", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCheckout(tier.id)} disabled={loadingTier === tier.id} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                background: tier.highlight ? "linear-gradient(135deg, #c49464, #b08050)" : "rgba(255,255,255,0.05)",
                color: tier.highlight ? "#0a0a0a" : "#e8e2d8",
                border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px", padding: "14px", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
                transition: "all 0.3s ease", opacity: loadingTier === tier.id ? 0.7 : 1,
              }}>
                {loadingTier === tier.id ? "Redirecting..." : tier.cta}
                {loadingTier !== tier.id && <ArrowRight size={15} />}
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(176,96,80,0.1)", border: "1px solid rgba(176,96,80,0.2)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#c08070", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#4a4540", marginTop: "clamp(2rem,4vw,3rem)" }}>
          All plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>
      <style jsx>{`.tier-card:hover { border-color: rgba(212,180,138,0.2) !important; transform: translateY(-2px); }`}</style>
    </div>
  );
}
