"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Music, Moon, Wind, Flower2, Headphones,
  Play, Send, Waves, Sunrise, ArrowRight,
} from "lucide-react";

// ─── Language ─────────────────────────────────
type Lang = "en" | "nl" | "es" | "de" | "fr" | "hi";
const LANGS: Lang[] = ["en", "nl", "es", "de", "fr", "hi"];

const detectLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("lofibuddha-lang") as Lang;
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language.toLowerCase().split("-")[0] as Lang;
  return LANGS.includes(browser) ? browser : "en";
};

const T = {
  headline: {
    en: "Find your calm.\nDiscover your rhythm.",
    nl: "Vind je rust.\nOntdek je ritme.",
    es: "Encuentra tu calma.\nDescubre tu ritmo.",
    de: "Finde deine Ruhe.\nEntdecke deinen Rhythmus.",
    fr: "Trouve ton calme.\nDécouvre ton rythme.",
    hi: "अपनी शांति खोजें।\nअपनी लय जानें।",
  },
  subtitle: {
    en: "Immersive lofi soundscapes, guided meditations, and cinematic relaxation films — crafted for deep focus and inner peace.",
    nl: "Meeslepende lofi soundscapes, geleide meditaties en filmische relaxatiefilms — gemaakt voor diepe focus en innerlijke rust.",
    es: "Paisajes sonoros lofi inmersivos, meditaciones guiadas y películas de relajación cinematográficas — creados para el enfoque profundo.",
    de: "Immersive Lofi-Klanglandschaften, geführte Meditationen und filmische Entspannungsfilme — für tiefe Konzentration und inneren Frieden.",
    fr: "Paysages sonores lofi immersifs, méditations guidées et films de relaxation cinématographiques — conçus pour la concentration profonde.",
    hi: "गहन ध्यान और आंतरिक शांति के लिए बनाए गए इमर्सिव लोफाई साउंडस्केप्स, गाइडेड मेडिटेशन और सिनेमाई विश्राम फिल्में।",
  },
  ctaBrowse: {
    en: "Explore Free Content",
    nl: "Ontdek gratis content",
    es: "Explorar contenido",
    de: "Inhalte entdecken",
    fr: "Explorer le contenu",
    hi: "सामग्री खोजें",
  },
  ctaApp: {
    en: "Open Bodhi Pro",
    nl: "Open Bodhi Pro",
    es: "Abrir Bodhi Pro",
    de: "Bodhi Pro öffnen",
    fr: "Ouvrir Bodhi Pro",
    hi: "बोधि प्रो खोलें",
  },
  features: {
    en: [
      { icon: Headphones, title: "Lofi Soundscapes", desc: "Curated beats for deep focus, study, and unwinding after a long day." },
      { icon: Flower2, title: "Guided Meditation", desc: "Breathwork, body scans, and mindfulness journeys — from 5 to 60 minutes." },
      { icon: Waves, title: "Cinematic Films", desc: "AI-rendered relaxation visuals in stunning quality. Made for immersion." },
    ],
  },
  newsletterLabel: {
    en: "Early access. No spam. Just peace.",
    nl: "Vroege toegang. Geen spam. Alleen rust.",
    es: "Acceso anticipado. Sin spam. Solo paz.",
    de: "Früher Zugang. Kein Spam. Nur Ruhe.",
    fr: "Accès anticipé. Pas de spam. Juste la paix.",
    hi: "जल्दी पहुंच। कोई स्पैम नहीं। सिर्फ शांति।",
  },
  emailPlaceholder: {
    en: "your@email.com",
    nl: "jouw@email.com",
    es: "tu@email.com",
    de: "deine@email.de",
    fr: "ton@email.fr",
    hi: "आपका@ईमेल.com",
  },
  subscribe: {
    en: "Notify me",
    nl: "Houd me op de hoogte",
    es: "Avísame",
    de: "Benachrichtigen",
    fr: "Préviens-moi",
    hi: "सूचित करें",
  },
  subscribed: {
    en: "You're in. Peace is coming.",
    nl: "Je bent binnen. Rust komt eraan.",
    es: "Estás dentro.",
    de: "Du bist dabei.",
    fr: "Tu es inscrit.",
    hi: "आप शामिल हैं।",
  },
  footer: {
    en: "A space for calm in a busy world.",
    nl: "Een plek van rust in een drukke wereld.",
    es: "Un espacio de calma en un mundo ocupado.",
    de: "Ein Ort der Ruhe.",
    fr: "Un espace de calme.",
    hi: "शांति का स्थान।",
  },
};

// ─── Flowing Line SVG ─────────────
function FlowingLine({ delay = 0, width = "60%", top = "50%" }: { delay?: number; width?: string; top?: string }) {
  const id = `lg-${delay}-${top.replace("%","")}`;
  return (
    <div style={{ position: "absolute", top, left: "50%", transform: "translateX(-50%)", width, height: "1px", overflow: "hidden", opacity: 0.3, pointerEvents: "none" }}>
      <svg width="100%" height="1" viewBox="0 0 800 1" preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#d4b48a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect width="800" height="1" fill={`url(#${id})`}>
          <animate attributeName="x" from="-800" to="800" dur={`${4+delay*1.5}s`} repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}

// ─── Feature Card ──────────────────
function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="fcard" style={{
      background: "rgba(26,26,24,0.7)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px",
      padding: "clamp(1.5rem, 4vw, 2rem)", textAlign: "left",
      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", position: "relative", overflow: "hidden",
    }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "12px",
        background: "linear-gradient(135deg, rgba(196,148,100,0.12), rgba(180,130,80,0.06))",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <Icon size={20} color="#d4b48a" strokeWidth={1.5} />
      </div>
      <h3 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "16px", fontWeight: 600, color: "#e8e2d8", marginBottom: "8px", letterSpacing: "-0.01em" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "#7a7468", lineHeight: 1.6, margin: 0, fontWeight: 400 }}>{desc}</p>
    </div>
  );
}

// ─── Page ───────────────────────────────────
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { setLang(detectLang()); setMounted(true); setTimeout(() => setVisible(true), 200); }, []);
  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = 0.75; }, [videoLoaded]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribed) return;
    try { await fetch("/api/subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, language: lang }) }); } catch {}
    setSubscribed(true);
  };

  if (!mounted) return null;
  const t = (key: string) => (T as any)[key]?.[lang] || (T as any)[key]?.en || "";
  const features = (T.features as any)[lang] || T.features.en;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e2d8", fontFamily: "'Inter', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Ambient orbs */}
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "clamp(600px,80vw,1000px)", height: "clamp(600px,80vw,1000px)", borderRadius: "50%", filter: "blur(200px)", opacity: 0.06, background: "radial-gradient(circle, rgba(212,180,138,0.5) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-30%", left: "-15%", width: "clamp(400px,60vw,700px)", height: "clamp(400px,60vw,700px)", borderRadius: "50%", filter: "blur(180px)", opacity: 0.04, background: "radial-gradient(circle, rgba(180,140,100,0.4) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <FlowingLine delay={0} top="28%" width="40%" />
      <FlowingLine delay={2} top="72%" width="50%" />

      {/* Hero video */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: videoLoaded ? 0.22 : 0, transition: "opacity 2.5s ease" }}>
        <video ref={videoRef} autoPlay muted loop playsInline onCanPlay={() => setVideoLoaded(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3) saturate(0.4)" }}
          poster="/images/bg/bg-youtube.png">
          <source src="/videos/shorts/buddha-zen.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.6) 55%, #0a0a0a 100%)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "clamp(1.5rem,5vw,4rem)", textAlign: "center" }}>
        {/* Lang switcher */}
        <div style={{ position: "absolute", top: "clamp(1.5rem,4vw,2.5rem)", right: "clamp(1.5rem,4vw,2.5rem)", display: "flex", gap: "2px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s" }}>
          {LANGS.map((l) => (
            <button key={l} onClick={() => { setLang(l); localStorage.setItem("lofibuddha-lang", l); }}
              style={{ background: lang===l ? "rgba(212,180,138,0.12)" : "transparent", color: lang===l ? "#d4b48a" : "#5a5550", border: lang===l ? "1px solid rgba(212,180,138,0.2)" : "1px solid transparent", borderRadius: "8px", padding: "5px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.04em", cursor: "pointer", transition: "all 0.25s ease", fontFamily: "'Inter', system-ui, sans-serif" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Hero */}
        <div style={{ maxWidth: "680px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "clamp(2rem,5vw,3rem)" }}>
            <span style={{ width: "24px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,180,138,0.5))" }} />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7a7060" }}>Your daily dose of peace</span>
            <span style={{ width: "24px", height: "1px", background: "linear-gradient(90deg, rgba(212,180,138,0.5), transparent)" }} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display','Georgia','Times New Roman',serif", fontSize: "clamp(2.8rem,8vw,5.5rem)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#f5ede0", marginBottom: "clamp(1.2rem,3vw,2rem)", whiteSpace: "pre-line" }}>{t("headline")}</h1>
          <p style={{ fontSize: "clamp(1rem,2vw,1.15rem)", lineHeight: 1.75, color: "#8a8278", maxWidth: "520px", margin: "0 auto clamp(2.5rem,6vw,3.5rem)", fontWeight: 350, letterSpacing: "0.01em" }}>{t("subtitle")}</p>

          {/* CTAs — NO Sparkles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "clamp(4rem,10vw,6rem)" }}>
            <Link href="/mindfulness" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #c49464 0%, #b08050 100%)", color: "#0a0a0a", border: "none", borderRadius: "14px", padding: "15px 30px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif", textDecoration: "none", letterSpacing: "-0.01em", transition: "all 0.3s ease", boxShadow: "0 4px 24px rgba(196,148,100,0.15)" }}>
              <Play size={15} /> {t("ctaBrowse")}
            </Link>
            <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", color: "#d4b48a", border: "1px solid rgba(212,180,138,0.15)", borderRadius: "14px", padding: "15px 30px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif", textDecoration: "none", letterSpacing: "-0.01em", transition: "all 0.3s ease" }}>
              <ArrowRight size={15} /> {t("ctaApp")}
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", maxWidth: "780px", width: "100%", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.7s", marginBottom: "clamp(3rem,8vw,5rem)" }}>
          {features.map((f: any, i: number) => <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />)}
        </div>

        {/* Newsletter */}
        <div style={{ maxWidth: "420px", width: "100%", opacity: visible ? 1 : 0, transition: "all 1s ease 1s" }}>
          <p style={{ fontSize: "13px", color: "#6b655a", marginBottom: "14px", fontWeight: 500, letterSpacing: "0.02em" }}>{t("newsletterLabel")}</p>
          <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "4px" }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} required
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e8e2d8", fontSize: "14px", padding: "14px 18px", fontFamily: "'Inter', system-ui, sans-serif" }} />
            <button type="submit" disabled={subscribed} style={{ background: subscribed ? "linear-gradient(135deg, #7a9a6a, #6a8a5a)" : "linear-gradient(135deg, #c49464, #b08050)", color: "#0a0a0a", border: "none", borderRadius: "12px", padding: "14px 22px", fontSize: "13px", fontWeight: 600, cursor: subscribed ? "default" : "pointer", display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: "nowrap", letterSpacing: "-0.01em", transition: "all 0.3s ease" }}>
              {subscribed ? "✓" : <Send size={13} />} {subscribed ? t("subscribed") : t("subscribe")}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: "clamp(1.5rem,4vw,2.5rem)", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#3d3832", fontWeight: 400, letterSpacing: "0.03em", opacity: visible ? 1 : 0, transition: "all 1s ease 1.3s" }}>
          <span>{t("footer")}</span>
          <span style={{ opacity: 0.2 }}>·</span>
          <Link href="/legal/privacy" style={{ color: "#3d3832", textDecoration: "none" }}>Privacy</Link>
          <Link href="/legal/terms" style={{ color: "#3d3832", textDecoration: "none" }}>Terms</Link>
        </div>
      </div>
      <style jsx>{`.fcard:hover { border-color: rgba(212,180,138,0.2) !important; transform: translateY(-2px); }`}</style>
    </div>
  );
}
