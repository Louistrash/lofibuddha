"use client";

import { useState, useEffect } from "react";
import {
  Play, Sparkles, Check, ArrowRight, Menu, X, Globe,
  Heart, Moon, Sun, Music, Zap, Shield, Star,
  Music2, Camera, Headphones, Send, Tv, Quote, Flower2,
} from "lucide-react";
import Link from "next/link";

// ── Translations ──

type Lang = "en" | "nl" | "es" | "de" | "fr" | "hi";

const LANG_FLAGS: Record<Lang, string> = { en: "🇬🇧", nl: "🇳🇱", es: "🇪🇸", de: "🇩🇪", fr: "🇫🇷", hi: "🇮🇳" };
const LANG_LABELS: Record<Lang, string> = { en: "EN", nl: "NL", es: "ES", de: "DE", fr: "FR", hi: "HI" };
const LANGS: Lang[] = ["en", "nl", "es", "de", "fr", "hi"];

// Fallback: NL for Dutch, EN for everything else
function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("lofibuddha-lang") as Lang;
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("nl")) return "nl";
  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("de")) return "de";
  if (browser.startsWith("fr")) return "fr";
  if (browser.startsWith("hi")) return "hi";
  return "en";
}

const t: Record<string, Record<Lang, string>> = {
  navFeatures: { en: "Features", nl: "Functies" },
  navContent: { en: "Content", nl: "Content" },
  navPricing: { en: "Pricing", nl: "Prijzen" },
  navPodcast: { en: "Podcast", nl: "Podcast" },
  bodhiPro: { en: "Bodhi Pro →", nl: "Bodhi Pro →" },
  badgeNew: { en: "Lofi music meets mindfulness", nl: "Lofi muziek ontmoet mindfulness" },
  heroTitle: { en: "Your daily dose of calm in a chaotic world", nl: "Jouw dagelijkse dosis kalmte in een chaotische wereld" },
  heroTitleHighlight: { en: "calm", nl: "kalmte" },
  heroSub: { en: "Unlimited lofi beats, guided yoga, breathwork & meditation —", nl: "Onbeperkt lofi beats, geleide yoga, ademwerk & meditatie —" },
  heroSubHighlight: { en: "all in one peaceful place.", nl: "alles op één rustige plek." },
  ctaStart: { en: "Start Your Free Trial", nl: "Start Je Gratis Proefperiode" },
  ctaBrowse: { en: "Browse free content", nl: "Bekijk gratis content" },
  trustTrial: { en: "7-day free trial", nl: "7 dagen gratis" },
  trustCancel: { en: "Cancel anytime", nl: "Altijd opzegbaar" },
  trustHappy: { en: "2,400+ happy souls", nl: "2.400+ blije zielen" },
  trustRating: { en: "★ 4.9 rating", nl: "★ 4.9 beoordeling" },
  ytWatch: { en: "Watch on YouTube", nl: "Bekijk op YouTube" },
  ytSub: { en: "New lofi mixes & yoga flows every week", nl: "Wekelijks nieuwe lofi mixes & yoga flows" },
  whyLabel: { en: "Why LofiBuddha", nl: "Waarom LofiBuddha" },
  featuresTitle: { en: "Everything you need to unwind", nl: "Alles wat je nodig hebt om te ontspannen" },
  featuresSub: { en: "Curated content for your mind, body, and soul — no ads, no noise.", nl: "Zorgvuldig geselecteerde content voor lichaam en geest — geen reclame." },
  journeyLabel: { en: "Start your journey", nl: "Begin je reis" },
  journeyTitle: { en: "Begin with these free sessions", nl: "Begin met deze gratis sessies" },
  journeySub: { en: "Handpicked by our teachers to calm your mind instantly.", nl: "Met de hand gekozen door onze leraren." },
  browseAll: { en: "Browse all free content", nl: "Bekijk alle gratis content" },
  podcastLabel: { en: "Podcast", nl: "Podcast" },
  podcastTitle: { en: "The Mindful Creative", nl: "The Mindful Creative" },
  podcastSub: { en: "Weekly conversations about mindfulness, creativity, and intentional living.", nl: "Wekelijkse gesprekken over mindfulness, creativiteit en bewust leven." },
  pricingLabel: { en: "Pricing", nl: "Prijzen" },
  pricingTitle: { en: "Simple, peaceful pricing", nl: "Simpele, rustige prijzen" },
  pricingSub: { en: "Start free. Upgrade when you're ready. No pressure.", nl: "Begin gratis. Upgrade wanneer jij er klaar voor bent." },
  mostPopular: { en: "Most Popular", nl: "Meest Gekozen" },
  freeDesc: { en: "Dip your toes in the calm.", nl: "Proef de rust." },
  zenDesc: { en: "Your daily dose of peace.", nl: "Jouw dagelijkse dosis rust." },
  masterDesc: { en: "Deepen your practice.", nl: "Verdiep je beoefening." },
  communityLabel: { en: "Community", nl: "Community" },
  communityTitle: { en: "Real stories from real people", nl: "Echte verhalen van echte mensen" },
  newsletterLabel: { en: "Free weekly calm tips", nl: "Gratis wekelijkse rust-tips" },
  newsletterTitle: { en: "Join the community", nl: "Word lid van de community" },
  newsletterSub: { en: "Get a free lofi mix + weekly calm tips. No spam. Just zen.", nl: "Ontvang een gratis lofi mix + wekelijkse tips. Geen spam. Alleen zen." },
  newsletterPlaceholder: { en: "your@email.com", nl: "jouw@email.com" },
  newsletterBtn: { en: "Join Free", nl: "Gratis Lid Worden" },
  newsletterDone: { en: "You're in! 🧘", nl: "Je bent binnen! 🧘" },
  newsletterDoneSub: { en: "Check your inbox for your free lofi mix.", nl: "Check je inbox voor je gratis lofi mix." },
  footerTagline: { en: "Your daily dose of calm. Lofi music, yoga, meditation, and mindfulness — all in one peaceful place.", nl: "Jouw dagelijkse dosis kalmte. Lofi muziek, yoga, meditatie en mindfulness — alles op één rustige plek." },
  footerContent: { en: "Content", nl: "Content" },
  footerBrowse: { en: "Browse Free", nl: "Gratis Bekijken" },
  footerCompany: { en: "Company", nl: "Bedrijf" },
  footerAbout: { en: "About", nl: "Over Ons" },
  footerContact: { en: "Contact", nl: "Contact" },
  footerPrivacy: { en: "Privacy", nl: "Privacy" },
  footerFollow: { en: "Follow", nl: "Volg Ons" },
  footerCopy: { en: "Discover zen vibes — products and experiences that bring peace and joy to your life.", nl: "Ontdek zen vibes — producten en ervaringen die rust en vreugde brengen." },
};

function useT(): (key: string) => string {
  const [lang] = useState<Lang>(() => detectLang());
  return (key: string) => t[key]?.[lang] || t[key]?.en || key;
}

function setLangCookie(lang: Lang) {
  if (typeof window !== "undefined") {
    localStorage.setItem("lofibuddha-lang", lang);
  }
}

// ── Data ──

const features = [
  { icon: Music, title: { en: "Lofi Music", nl: "Lofi Muziek" }, desc: { en: "Endless streams of handpicked lofi, chillhop, and ambient beats. Perfect for focus, study, or sleep.", nl: "Eindeloze streams van met de hand gekozen lofi, chillhop en ambient. Perfect voor focus, studie of slaap." }, emoji: "🎵" },
  { icon: Sun, title: { en: "Yoga Flows", nl: "Yoga Flows" }, desc: { en: "Gentle morning flows and relaxing evening practices for every level. No equipment needed.", nl: "Zachte ochtendflows en ontspannende avondsessies voor elk niveau. Geen materiaal nodig." }, emoji: "🧘" },
  { icon: Moon, title: { en: "Guided Meditation", nl: "Geleide Meditatie" }, desc: { en: "Breathwork, body scans, and mindfulness sessions narrated with warmth and clarity.", nl: "Ademwerk, bodyscans en mindfulness sessies met warmte en helderheid verteld." }, emoji: "🧠" },
  { icon: Headphones, title: { en: "Podcast", nl: "Podcast" }, desc: { en: "Weekly conversations about mindfulness, creativity, and intentional living.", nl: "Wekelijkse gesprekken over mindfulness, creativiteit en bewust leven." }, emoji: "🎙️" },
  { icon: Heart, title: { en: "Community", nl: "Community" }, desc: { en: "Join mindful souls on the same journey. Share, grow, and find accountability.", nl: "Sluit je aan bij gelijkgestemden. Deel, groei en vind steun." }, emoji: "💜" },
  { icon: Shield, title: { en: "No Ads. Ever.", nl: "Nooit Reclame." }, desc: { en: "Your peace is our priority. No interruptions, no algorithms hijacking your attention.", nl: "Jouw rust is onze prioriteit. Geen onderbrekingen, geen algoritmes." }, emoji: "🛡️" },
];

const contentGrid = [
  { emoji: "🧘", title: { en: "Morning Yoga", nl: "Ochtend Yoga" }, desc: { en: "10 min gentle flow", nl: "10 min zachte flow" } },
  { emoji: "🎵", title: { en: "Focus Lofi", nl: "Focus Lofi" }, desc: { en: "Deep work beats", nl: "Concentratie beats" } },
  { emoji: "🌙", title: { en: "Sleep Stories", nl: "Slaap Verhalen" }, desc: { en: "Guided relaxation", nl: "Geleide ontspanning" } },
  { emoji: "🫁", title: { en: "Breathwork", nl: "Ademwerk" }, desc: { en: "5 min reset", nl: "5 min reset" } },
];

const socials = [
  { label: "YouTube", icon: Tv, href: "https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A?sub_confirmation=1", color: "hover:text-red-400" },
  { label: "LoFi Buddha Music", icon: Music2, href: "https://www.youtube.com/@LoFi_Buddha_Music", color: "hover:text-rose-400" },
  { label: "TikTok", icon: Music2, href: "https://www.tiktok.com/@lofibuddha", color: "hover:text-pink-400" },
  { label: "Instagram", icon: Camera, href: "https://www.instagram.com/lofibuddha", color: "hover:text-purple-400" },
  { label: "Facebook", icon: Globe, href: "https://www.facebook.com/lofibuddha", color: "hover:text-blue-400" },
];

const tierFeatures: Record<string, { en: string[]; nl: string[] }> = {
  free: { en: ["3 lofi tracks / week", "1 yoga flow / week", "Community access", "Browse free content"], nl: ["3 lofi tracks/week", "1 yoga flow/week", "Community toegang", "Gratis content"] },
  zen: { en: ["Unlimited lofi streams", "Full yoga library", "Guided breathwork", "Ad-free experience", "Offline downloads", "Community challenges"], nl: ["Onbeperkt lofi streams", "Volledige yoga bibliotheek", "Geleid ademwerk", "Reclamevrij", "Offline downloads", "Community challenges"] },
  master: { en: ["Everything in Zen", "Live guided sessions", "Exclusive workshops", "1-on-1 coaching (2x/mo)", "Early access content", "Custom playlists", "Priority support"], nl: ["Alles van Zen", "Live sessies", "Exclusieve workshops", "1-op-1 coaching", "Vroege toegang", "Custom playlists", "Priority support"] },
};

// ── Component ──

export default function LandingPage() {
  const __t = useT();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState<Lang>(() => detectLang());

  // Re-render on lang change
  useEffect(() => {
    setLangCookie(lang);
    // Force a re-render by setting a dummy state
    // The useState above already re-renders, this is just for the cookie
  }, [lang]);

  const handleSubscribe = (e: React.FormEvent) => { e.preventDefault(); if (email) setSubscribed(true); };

  const handleStripeCheckout = async (tier: string, priceId: string) => {
    if (!priceId) { window.location.href = `/signup?tier=${tier}`; return; }
    setCheckoutLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier, email: "" }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else window.location.href = `/signup?tier=${tier}`;
    } catch { window.location.href = `/signup?tier=${tier}`; }
    setCheckoutLoading(null);
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { href: "#features", label: t.navFeatures[lang] },
    { href: "#content", label: t.navContent[lang] },
    { href: "#pricing", label: t.navPricing[lang] },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden theme-buddha">
      {/* Background ambient glow — warm candle-lit temple */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[130px] animate-pulse opacity-40" style={{ background: "radial-gradient(circle, rgba(220,170,80,0.18) 0%, transparent 70%)", animationDuration: "8s" }} />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30" style={{ background: "radial-gradient(circle, rgba(212,136,106,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full blur-[100px] opacity-25" style={{ background: "radial-gradient(circle, rgba(200,144,112,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 100 100" className="transition-transform duration-700 group-hover:rotate-12 sm:w-8 sm:h-8">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#d4a44a" strokeWidth="2.5" strokeDasharray="230" strokeDashoffset="20" strokeLinecap="round" />
              <circle cx="50" cy="50" r="10" fill="#d4a44a" opacity="0.85" />
              <path d="M50 15 C65 15 75 25 78 40 C80 25 70 15 50 15Z" fill="#e0b860" opacity="0.5" />
            </svg>
            <span className="font-semibold text-text-primary tracking-wide text-sm sm:text-base">LofiBuddha</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={closeMenu} className="hover:text-accent-light transition-colors">{l.label}</a>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher — dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-hover border border-border/30 text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
              >
                <span>{LANG_FLAGS[lang]} {LANG_LABELS[lang]}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-1 bg-bg-surface border border-border/40 rounded-xl shadow-xl p-1 z-50 min-w-[110px] backdrop-blur-xl">
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        lang === l
                          ? "bg-accent/15 text-accent-light"
                          : "text-text-muted hover:text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                      <span>{LANG_FLAGS[l]}</span> {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/signup" className="text-xs font-medium px-4 py-2 rounded-xl bg-accent text-bg-primary hover:bg-accent-light transition-all">
              {t.ctaStart[lang]}
            </Link>
          </div>

          {/* Mobile: hamburger only (lang switcher in slide menu) */}
          <div className="flex md:hidden items-center gap-1">
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -mr-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors z-[60]"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-bg-primary/90 backdrop-blur-md" onClick={closeMenu} />
          {/* Panel */}
          <div className="absolute top-16 right-0 w-72 max-w-[85vw] h-[calc(100vh-4rem)] bg-bg-surface border-l border-border/50 p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <nav className="space-y-1">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all text-base font-medium">
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-border/30 space-y-4">
              {/* Language switcher in menu */}
              <div>
                <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">{lang === "en" ? "Language" : lang === "nl" ? "Taal" : lang === "es" ? "Idioma" : lang === "de" ? "Sprache" : lang === "fr" ? "Langue" : "भाषा"}</p>
                <div className="flex flex-wrap gap-2">
                  {LANGS.map((l) => (
                    <button key={l}
                      onClick={() => setLang(l)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${lang === l ? "bg-accent/20 text-accent-light border border-accent/30" : "bg-bg-hover text-text-muted hover:text-text-primary border border-border/30"}`}>
                      {LANG_FLAGS[l]} {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign up link in menu */}
              <Link href="/signup" onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-accent text-bg-primary hover:bg-accent-light transition-all text-sm font-medium">
                {t.ctaStart[lang]}
              </Link>
            </div>

            {/* Social icons in menu */}
            <div className="mt-6 pt-6 border-t border-border/30 flex gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener"
                  className={`w-9 h-9 rounded-lg bg-bg-hover border border-border/30 flex items-center justify-center text-text-muted transition-all ${s.color}`}>
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-6 max-w-6xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-light text-xs sm:text-sm mb-8 border border-accent/20">
          <Sparkles size={13} /> {t.badgeNew[lang]}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto">
          {lang === "en" ? <>Your daily dose of <span className="text-gradient-gold">calm</span> in a chaotic world</> : <>Jouw dagelijkse dosis <span className="text-gradient-gold">kalmte</span> in een chaotische wereld</>}
        </h1>

        <p className="text-text-secondary text-base sm:text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          {t.heroSub[lang]}{" "}<span className="text-accent-light font-medium">{t.heroSubHighlight[lang]}</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button onClick={() => handleStripeCheckout("zen", "price_zen_monthly")}
            className="group relative px-8 py-3.5 rounded-xl bg-accent text-bg-primary font-semibold text-sm overflow-hidden transition-all hover:bg-accent-light hover:shadow-xl hover:shadow-accent/20">
            <span className="relative z-10 flex items-center gap-2">
              {checkoutLoading === "zen" ? "..." : <><span>{t.ctaStart[lang]}</span><ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
            </span>
          </button>
          <Link href="/browse" className="text-sm text-text-secondary hover:text-accent-light transition-colors flex items-center gap-2 px-5 py-3.5">
            <Play size={15} /> {t.ctaBrowse[lang]}
          </Link>
        </div>

        {/* Zen visual — ornate Buddha-inspired mandala */}
        <div className="mt-14 sm:mt-20 max-w-lg mx-auto relative">
          {/* Ripple rings — warm gold */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 sm:w-88 sm:h-88 rounded-full border opacity-20 animate-ripple" style={{ borderColor: "rgba(212,164,74,0.35)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 sm:w-68 sm:h-68 rounded-full border opacity-15 animate-ripple-2" style={{ borderColor: "rgba(212,164,74,0.25)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border opacity-10 animate-ripple-3" style={{ borderColor: "rgba(224,184,96,0.2)" }} />
          </div>
          {/* Warm ember glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full opacity-15 animate-pulse" style={{ background: "radial-gradient(circle, rgba(220,170,80,0.5) 0%, transparent 70%)", animationDuration: "6s" }} />
          </div>
          {/* Main enso + buddha + lotus — warm temple gold */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full animate-enso">
              {/* Outer ornate ring */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="#d4a44a" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.3" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="#e0b860" strokeWidth="0.5" opacity="0.15" />

              {/* Enso circle — warm gold */}
              <path d="M100 8 C148 8 192 44 192 100 C192 156 148 192 100 192 C52 192 8 156 8 100 C8 48 45 10 92 8" fill="none" stroke="#d4a44a" strokeWidth="2" strokeLinecap="round" opacity="0.55" />

              {/* Lotus flower at center — warm amber + red */}
              <ellipse cx="100" cy="120" rx="32" ry="48" fill="#d4a44a" opacity="0.12" />
              <ellipse cx="70" cy="130" rx="18" ry="38" fill="#d4a44a" opacity="0.10" transform="rotate(-18, 70, 130)" />
              <ellipse cx="130" cy="130" rx="18" ry="38" fill="#d4a44a" opacity="0.10" transform="rotate(18, 130, 130)" />
              {/* Lotus side petals — warm red/ember */}
              <ellipse cx="55" cy="120" rx="14" ry="30" fill="#d4886a" opacity="0.08" transform="rotate(-30, 55, 120)" />
              <ellipse cx="145" cy="120" rx="14" ry="30" fill="#d4886a" opacity="0.08" transform="rotate(30, 145, 120)" />

              {/* Buddha silhouette — rich gold */}
              <circle cx="100" cy="64" r="15" fill="#d4a44a" opacity="0.5" />
              <ellipse cx="100" cy="82" rx="10" ry="6" fill="#e0b860" opacity="0.18" />
              <path d="M100 92 C85 92 78 100 76 118 C74 132 78 142 88 150 C93 153 97 154 100 154 C103 154 107 153 112 150 C122 142 126 132 124 118 C122 100 115 92 100 92Z" fill="#d4a44a" opacity="0.45" />
              <circle cx="100" cy="148" r="7" fill="#d4a44a" opacity="0.15" />

              {/* Decorative dots on the ring */}
              <circle cx="100" cy="10" r="2" fill="#e0b860" opacity="0.35" />
              <circle cx="160" cy="45" r="2" fill="#e0b860" opacity="0.35" />
              <circle cx="190" cy="100" r="2" fill="#e0b860" opacity="0.35" />
              <circle cx="160" cy="155" r="2" fill="#e0b860" opacity="0.35" />
              <circle cx="100" cy="190" r="2" fill="#e0b860" opacity="0.35" />
              <circle cx="40" cy="155" r="2" fill="#e0b860" opacity="0.35" />
              <circle cx="10" cy="100" r="2" fill="#e0b860" opacity="0.35" />
              <circle cx="40" cy="45" r="2" fill="#e0b860" opacity="0.35" />
            </svg>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mt-12 text-text-muted text-xs sm:text-sm">
          <span className="flex items-center gap-1.5"><Shield size={13} /> {t.trustTrial[lang]}</span>
          <span className="flex items-center gap-1.5"><Zap size={13} /> {t.trustCancel[lang]}</span>
          <span className="flex items-center gap-1.5"><Heart size={13} /> {t.trustHappy[lang]}</span>
          <span className="flex items-center gap-1.5 text-amber-400">{t.trustRating[lang]}</span>
        </div>

        {/* YouTube CTAs */}
        <div className="mt-14 max-w-xl mx-auto space-y-3">
          <a href="https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A?sub_confirmation=1" target="_blank" rel="noopener"
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/8 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Tv size={20} className="text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">LofiBuddha on YouTube</p>
              <p className="text-xs text-text-muted">New lofi mixes & yoga flows every week</p>
            </div>
            <ArrowRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform ml-auto" />
          </a>
          <a href="https://www.youtube.com/@LoFi_Buddha_Music" target="_blank" rel="noopener"
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 hover:bg-rose-500/8 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music size={20} className="text-rose-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">Lo-Fi Buddha AI Music</p>
              <p className="text-xs text-text-muted">AI meditation music & tranquil visuals</p>
            </div>
            <ArrowRight size={16} className="text-rose-400 group-hover:translate-x-1 transition-transform ml-auto" />
          </a>
        </div>
      </section>

      {/* ── Social Proof Bar ── */}
      <section className="py-10 px-6 border-y border-border/30 bg-bg-surface/30">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-text-muted text-sm">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener"
              className={`flex items-center gap-2 transition-colors ${s.color}`}>
              <s.icon size={18} /> <span className="hidden sm:inline font-medium">{s.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-28 px-6 bg-bg-surface/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">{t.whyLabel[lang]}</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">{t.featuresTitle[lang]}</h2>
            <p className="text-text-muted mt-3 max-w-lg mx-auto text-sm">{t.featuresSub[lang]}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title.en} className="group relative p-6 rounded-2xl bg-bg-card/50 border border-border/30 hover:border-accent/20 transition-all duration-300 hover:bg-bg-card/80">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{f.emoji}</div>
                <h3 className="font-semibold text-text-primary mb-1.5">{f.title[lang]}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Preview ── */}
      <section id="content" className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">{t.journeyLabel[lang]}</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">{t.journeyTitle[lang]}</h2>
          <p className="text-text-muted mb-12 max-w-lg mx-auto text-sm">{t.journeySub[lang]}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentGrid.map((item) => (
              <Link key={item.title.en} href="/browse"
                className="group p-5 rounded-2xl bg-bg-card/50 border border-border/30 hover:border-accent/30 transition-all text-center hover:-translate-y-0.5">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">{item.emoji}</div>
                <h3 className="font-semibold text-text-primary text-sm">{item.title[lang]}</h3>
                <p className="text-xs text-text-muted mt-1">{item.desc[lang]}</p>
              </Link>
            ))}
          </div>
          <Link href="/browse" className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-xl bg-accent/10 text-accent-light hover:bg-accent/20 transition-all text-sm font-medium">
            {t.browseAll[lang]} <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Podcast ── */}
      <section id="podcast" className="py-20 sm:py-28 px-6 bg-bg-surface/50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-purple-400 uppercase tracking-[0.2em] font-medium">{t.podcastLabel[lang]}</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">{t.podcastTitle[lang]}</h2>
          <p className="text-text-muted mt-3 max-w-md mx-auto text-sm">{t.podcastSub[lang]}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {[{ label: "Spotify", href: "https://open.spotify.com/" }, { label: "Apple Podcasts", href: "https://podcasts.apple.com/" }, { label: "YouTube", href: "https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A?sub_confirmation=1" }, { label: "AI Music", href: "https://www.youtube.com/@LoFi_Buddha_Music" }].map((p) => (
              <a key={p.label} href={p.href} target="_blank" rel="noopener"
                className="px-5 py-2.5 rounded-xl bg-bg-card border border-border/30 text-sm text-text-secondary hover:text-accent-light hover:border-accent/30 transition-all">
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">{t.pricingLabel[lang]}</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">{t.pricingTitle[lang]}</h2>
            <p className="text-text-muted mt-3 text-sm">{t.pricingSub[lang]}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Free", price: "€0", period: "forever", desc: t.freeDesc[lang], cta: "Start Free", href: "/signup?tier=free", featured: false, priceId: "", tierKey: "free" },
              { name: "Zen", price: "€4.99", period: "/month", desc: t.zenDesc[lang], cta: t.ctaStart[lang], href: "/signup?tier=zen", featured: true, priceId: "price_zen_monthly", tierKey: "zen" },
              { name: "Master", price: "€9.99", period: "/month", desc: t.masterDesc[lang], cta: t.ctaStart[lang], href: "/signup?tier=master", featured: false, priceId: "price_master_monthly", tierKey: "master" },
            ].map((tier) => (
              <div key={tier.name} className={`relative p-6 rounded-2xl bg-bg-card/50 border transition-all ${tier.featured ? "border-accent/40 bg-accent/3 scale-[1.02]" : "border-border/30 hover:border-accent/20"}`}>
                {tier.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg-primary text-[11px] font-semibold px-4 py-1 rounded-full">{t.mostPopular[lang]}</div>}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-sm text-text-muted mt-1">{tier.desc}</p>
                <div className="mt-4 mb-5"><span className="text-4xl font-bold">{tier.price}</span><span className="text-text-muted text-sm ml-1">{tier.period}</span></div>
                <ul className="space-y-2.5 mb-6">
                  {(tierFeatures[tier.tierKey]?.[lang] || tierFeatures[tier.tierKey]?.en).map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary"><Check size={14} className="text-accent-light mt-0.5 flex-shrink-0" />{f}</li>
                  ))}
                </ul>
                <button onClick={() => handleStripeCheckout(tier.tierKey, tier.priceId)}
                  disabled={checkoutLoading === tier.tierKey}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${tier.featured ? "bg-accent text-bg-primary hover:bg-accent-light" : "bg-bg-hover text-text-primary hover:bg-border"} disabled:opacity-50`}>
                  {checkoutLoading === tier.tierKey ? "..." : tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 sm:py-28 px-6 bg-bg-surface/50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">{t.communityLabel[lang]}</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-12">{t.communityTitle[lang]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: { en: "This platform changed my mornings. The yoga flows are so calming and the lofi music is perfect.", nl: "Dit platform heeft mijn ochtenden veranderd. De yoga flows zijn zo rustgevend." }, name: "Sarah M.", role: { en: "Yoga student", nl: "Yoga student" }, avatar: "🧘‍♀️" },
              { quote: { en: "Finally, lofi music that actually helps me focus. No ads, no distractions.", nl: "Eindelijk lofi muziek die me écht helpt focussen. Geen reclame, geen afleiding." }, name: "James K.", role: { en: "Developer", nl: "Ontwikkelaar" }, avatar: "💻" },
              { quote: { en: "The breathwork sessions helped me through a really stressful period. Forever grateful.", nl: "De ademwerksessies hebben me door een stressvolle periode geholpen. Eeuwig dankbaar." }, name: "Emma L.", role: { en: "Teacher", nl: "Docent" }, avatar: "📚" },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-bg-card/50 border border-border/30 text-left space-y-3">
                <Quote size={20} className="text-accent-light/40" />
                <p className="text-sm text-text-secondary leading-relaxed italic">&ldquo;{t.quote[lang]}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm">{t.avatar}</div>
                  <div><p className="text-sm font-medium text-text-primary">{t.name}</p><p className="text-xs text-text-muted">{t.role[lang]}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-light text-xs mb-6 border border-accent/20">
            <Send size={12} /> {t.newsletterLabel[lang]}
          </div>
          <h2 className="text-3xl font-bold mb-3">{t.newsletterTitle[lang]}</h2>
          <p className="text-text-muted mb-8 text-sm">{t.newsletterSub[lang]}</p>
          {subscribed ? (
            <div className="p-6 rounded-2xl bg-bg-card border border-border/30 space-y-2">
              <Check size={28} className="mx-auto text-accent-light" />
              <p className="text-text-primary font-medium">{t.newsletterDone[lang]}</p>
              <p className="text-sm text-text-muted">{t.newsletterDoneSub[lang]}</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.newsletterPlaceholder[lang]} required
                className="flex-1 bg-bg-hover border border-border/50 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-all" />
              <button type="submit" className="px-6 py-3 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:bg-accent-light transition-all flex-shrink-0">{t.newsletterBtn[lang]}</button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-14 px-6 border-t border-border/30 bg-bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3 col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Moon size={18} className="text-accent-light" />
                <span className="font-semibold text-sm">LofiBuddha</span>
              </Link>
              <p className="text-xs text-text-muted leading-relaxed">{t.footerTagline[lang]}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">{t.footerContent[lang]}</h4>
              <a href="#features" className="block text-xs text-text-muted hover:text-text-primary transition-colors">{t.navFeatures[lang]}</a>
              <Link href="/browse" className="block text-xs text-text-muted hover:text-text-primary transition-colors">{t.footerBrowse[lang]}</Link>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">{t.footerCompany[lang]}</h4>
              <a href="#" className="block text-xs text-text-muted hover:text-text-primary transition-colors">{t.footerAbout[lang]}</a>
              <a href="#" className="block text-xs text-text-muted hover:text-text-primary transition-colors">{t.footerContact[lang]}</a>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Legal</h4>
              <Link href="/legal/privacy" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Terms & Conditions</Link>
              <Link href="/legal/disclaimer" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Disclaimer</Link>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">{t.footerFollow[lang]}</h4>
              <div className="flex gap-2.5">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener"
                    className={`w-8 h-8 rounded-lg bg-bg-hover border border-border/30 flex items-center justify-center text-text-muted transition-all ${s.color}`}>
                    <s.icon size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border/30">
            <p className="text-[11px] text-text-muted">&copy; {new Date().getFullYear()} LofiBuddha. {t.footerCopy[lang]}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
