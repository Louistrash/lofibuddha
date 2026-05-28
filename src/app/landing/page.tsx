"use client";

import { useState } from "react";
import {
  Play, Sparkles, Check, ArrowRight,
  Heart, Moon, Sun, Music, Zap, Shield, Star,
  Music2, Camera, Globe, Headphones, Send, Tv, Quote,
} from "lucide-react";
import Link from "next/link";

// ── Data ──

const tiers = [
  { name: "Free", price: "€0", period: "forever", desc: "Dip your toes in the calm.", features: ["3 lofi tracks / week", "1 yoga flow / week", "Community access", "Browse free content"], cta: "Start Free", href: "/signup?tier=free", featured: false, priceId: "" },
  { name: "Zen", price: "€4.99", period: "/month", desc: "Your daily dose of peace.", features: ["Unlimited lofi streams", "Full yoga library", "Guided breathwork", "Ad-free experience", "Offline downloads", "Community challenges"], cta: "Start 7-Day Free Trial", href: "/signup?tier=zen", featured: true, priceId: "price_zen_monthly" },
  { name: "Master", price: "€9.99", period: "/month", desc: "Deepen your practice.", features: ["Everything in Zen", "Live guided sessions", "Exclusive workshops", "1-on-1 coaching (2x/mo)", "Early access content", "Custom playlists", "Priority support"], cta: "Start 7-Day Free Trial", href: "/signup?tier=master", featured: false, priceId: "price_master_monthly" },
];

const testimonials = [
  { quote: "This platform changed my mornings. The yoga flows are so calming and the lofi music is perfect.", name: "Sarah M.", role: "Yoga student", avatar: "🧘‍♀️" },
  { quote: "Finally, lofi music that actually helps me focus. No ads, no distractions — just pure concentration.", name: "James K.", role: "Software Developer", avatar: "💻" },
  { quote: "The breathwork sessions helped me through a really stressful period. Forever grateful.", name: "Emma L.", role: "Teacher", avatar: "📚" },
];

const features = [
  { icon: Music, title: "Lofi Music", desc: "Endless streams of handpicked lofi, chillhop, and ambient beats. Perfect for focus, study, or sleep.", emoji: "🎵" },
  { icon: Sun, title: "Yoga Flows", desc: "Gentle morning flows and relaxing evening practices for every level. No equipment needed.", emoji: "🧘" },
  { icon: Moon, title: "Guided Meditation", desc: "Breathwork, body scans, and mindfulness sessions narrated with warmth and clarity.", emoji: "🧠" },
  { icon: Headphones, title: "Podcast", desc: "Weekly conversations about mindfulness, creativity, and intentional living.", emoji: "🎙️" },
  { icon: Heart, title: "Community", desc: "Join mindful souls on the same journey. Share, grow, and find accountability.", emoji: "💜" },
  { icon: Shield, title: "No Ads. Ever.", desc: "Your peace is our priority. No interruptions, no algorithms hijacking your attention.", emoji: "🛡️" },
];

const contentGrid = [
  { emoji: "🧘", title: "Morning Yoga", desc: "10 min gentle flow" },
  { emoji: "🎵", title: "Focus Lofi", desc: "Deep work beats" },
  { emoji: "🌙", title: "Sleep Stories", desc: "Guided relaxation" },
  { emoji: "🫁", title: "Breathwork", desc: "5 min reset" },
];

const socials = [
  { label: "YouTube", icon: Tv, href: "https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A", color: "hover:text-red-400" },
  { label: "TikTok", icon: Music2, href: "https://www.tiktok.com/@lofibuddha", color: "hover:text-pink-400" },
  { label: "Instagram", icon: Camera, href: "https://www.instagram.com/lofibuddha", color: "hover:text-purple-400" },
  { label: "Facebook", icon: Globe, href: "https://www.facebook.com/lofibuddha", color: "hover:text-blue-400" },
];

// ── Component ──

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/3 rounded-full blur-[120px] animate-pulse" style={{animationDuration: "8s"}} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-500/2 rounded-full blur-[100px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg width="32" height="32" viewBox="0 0 100 100" className="transition-transform duration-700 group-hover:rotate-12">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#c49464" strokeWidth="2.5" strokeDasharray="230" strokeDashoffset="20" strokeLinecap="round" />
              <circle cx="50" cy="50" r="10" fill="#c49464" opacity="0.8" />
              <path d="M50 15 C65 15 75 25 78 40 C80 25 70 15 50 15Z" fill="#c49464" opacity="0.4" />
            </svg>
            <span className="font-semibold text-text-primary tracking-wide text-base">LofiBuddha</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#features" className="hover:text-accent-light transition-colors">Features</a>
            <a href="#content" className="hover:text-accent-light transition-colors">Content</a>
            <a href="#pricing" className="hover:text-accent-light transition-colors">Pricing</a>
            <Link href="/podcast" className="hover:text-accent-light transition-colors">Podcast</Link>
          </div>
          <a href="https://bodhi.aibuddha.net" target="_blank" rel="noopener" className="text-xs sm:text-sm font-medium px-4 py-2 rounded-xl bg-accent/10 text-accent-light hover:bg-accent/20 transition-all border border-accent/20">
            Bodhi Pro →
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-6 max-w-6xl mx-auto text-center z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-light text-xs sm:text-sm mb-8 border border-accent/20">
          <Sparkles size={13} /> Lofi music meets mindfulness
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto">
          Your daily dose of <span className="text-accent-light">calm</span> in a chaotic world
        </h1>

        <p className="text-text-secondary text-base sm:text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Unlimited lofi beats, guided yoga, breathwork & meditation — 
          <span className="text-accent-light font-medium"> all in one peaceful place.</span>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button onClick={() => handleStripeCheckout("zen", "price_zen_monthly")}
            className="group relative px-8 py-3.5 rounded-xl bg-accent text-bg-primary font-semibold text-sm overflow-hidden transition-all hover:bg-accent-light hover:shadow-xl hover:shadow-accent/20">
            <span className="relative z-10 flex items-center gap-2">
              {checkoutLoading === "zen" ? "Loading..." : <><span>Start Your Free Trial</span><ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
            </span>
          </button>
          <Link href="/browse" className="text-sm text-text-secondary hover:text-accent-light transition-colors flex items-center gap-2 px-5 py-3.5">
            <Play size={15} /> Browse free content
          </Link>
        </div>

        {/* Zen visual — animated enso + lotus */}
        <div className="mt-14 sm:mt-20 max-w-lg mx-auto relative">
          {/* Ripple layers */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-accent/10 animate-[ping_6s_ease-in-out_infinite]" style={{animationDuration: "6s"}} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-accent/5 animate-[ping_4s_ease-in-out_infinite]" style={{animationDuration: "4s", animationDelay: "0.5s"}} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-accent/5 animate-[ping_5s_ease-in-out_infinite]" style={{animationDuration: "5s", animationDelay: "1s"}} />
          </div>
          {/* Enso circle with lotus */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_30s_linear_infinite]">
              {/* Enso ring */}
              <path d="M100 10 C150 10 190 50 190 100 C190 150 150 190 100 190 C50 190 10 150 10 100 C10 55 42 16 85 12" 
                fill="none" stroke="#c49464" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              {/* Lotus petals */}
              <ellipse cx="100" cy="120" rx="30" ry="45" fill="#c49464" opacity="0.12" />
              <ellipse cx="75" cy="130" rx="20" ry="40" fill="#c49464" opacity="0.10" transform="rotate(-15, 75, 130)" />
              <ellipse cx="125" cy="130" rx="20" ry="40" fill="#c49464" opacity="0.10" transform="rotate(15, 125, 130)" />
              {/* Buddha/lotus silhouette */}
              <circle cx="100" cy="70" r="14" fill="#c49464" opacity="0.5" />
              <path d="M100 85 C85 85 78 92 76 108 C74 120 78 130 88 138 C93 141 97 142 100 142 C103 142 107 141 112 138 C122 130 126 120 124 108 C122 92 115 85 100 85Z" fill="#c49464" opacity="0.35" />
              {/* Center glow */}
              <circle cx="100" cy="135" r="8" fill="#c49464" opacity="0.15" />
            </svg>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mt-12 text-text-muted text-xs sm:text-sm">
          <span className="flex items-center gap-1.5"><Shield size={13} /> 7-day free trial</span>
          <span className="flex items-center gap-1.5"><Zap size={13} /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><Heart size={13} /> 2,400+ happy souls</span>
          <span className="flex items-center gap-1.5 text-amber-400">★ 4.9 rating</span>
        </div>

        {/* YouTube CTA banner */}
        <div className="mt-14 max-w-xl mx-auto">
          <a href="https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A" target="_blank" rel="noopener"
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/8 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Tv size={20} className="text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">Watch on YouTube</p>
              <p className="text-xs text-text-muted">New lofi mixes & yoga flows every week</p>
            </div>
            <ArrowRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform ml-auto" />
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
            <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">Why LofiBuddha</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Everything you need to unwind</h2>
            <p className="text-text-muted mt-3 max-w-lg mx-auto text-sm">Curated content for your mind, body, and soul — no ads, no noise.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="group relative p-6 rounded-2xl bg-bg-card/50 border border-border/30 hover:border-accent/20 transition-all duration-300 hover:bg-bg-card/80">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{f.emoji}</div>
                <h3 className="font-semibold text-text-primary mb-1.5">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Preview ── */}
      <section id="content" className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">Start your journey</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Begin with these free sessions</h2>
          <p className="text-text-muted mb-12 max-w-lg mx-auto text-sm">Handpicked by our teachers to calm your mind instantly.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentGrid.map((item) => (
              <Link key={item.title} href="/browse"
                className="group p-5 rounded-2xl bg-bg-card/50 border border-border/30 hover:border-accent/30 transition-all text-center hover:-translate-y-0.5">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">{item.emoji}</div>
                <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                <p className="text-xs text-text-muted mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>

          <Link href="/browse" className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-xl bg-accent/10 text-accent-light hover:bg-accent/20 transition-all text-sm font-medium">
            Browse all free content <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Podcast ── */}
      <section id="podcast" className="py-20 sm:py-28 px-6 bg-bg-surface/50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-purple-400 uppercase tracking-[0.2em] font-medium">Podcast</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">The Mindful Creative</h2>
          <p className="text-text-muted mt-3 max-w-md mx-auto text-sm">Weekly conversations about mindfulness, creativity, and intentional living.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {[{ label: "Spotify", href: "https://open.spotify.com/" }, { label: "Apple Podcasts", href: "https://podcasts.apple.com/" }, { label: "YouTube", href: "https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A" }].map((p) => (
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
            <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">Simple, peaceful pricing</h2>
            <p className="text-text-muted mt-3 text-sm">Start free. Upgrade when you're ready. No pressure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((tier) => (
              <div key={tier.name} className={`relative p-6 rounded-2xl bg-bg-card/50 border transition-all ${tier.featured ? "border-accent/40 bg-accent/3 scale-[1.02]" : "border-border/30 hover:border-accent/20"}`}>
                {tier.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg-primary text-[11px] font-semibold px-4 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-sm text-text-muted mt-1">{tier.desc}</p>
                <div className="mt-4 mb-5"><span className="text-4xl font-bold">{tier.price}</span><span className="text-text-muted text-sm ml-1">{tier.period}</span></div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary"><Check size={14} className="text-accent-light mt-0.5 flex-shrink-0" />{f}</li>
                  ))}
                </ul>
                <button onClick={() => handleStripeCheckout(tier.name.toLowerCase(), tier.priceId)}
                  disabled={checkoutLoading === tier.name.toLowerCase()}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${tier.featured ? "bg-accent text-bg-primary hover:bg-accent-light" : "bg-bg-hover text-text-primary hover:bg-border"} disabled:opacity-50`}>
                  {checkoutLoading === tier.name.toLowerCase() ? "Loading..." : tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 sm:py-28 px-6 bg-bg-surface/50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-accent-light uppercase tracking-[0.2em] font-medium">Community</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-12">Real stories from real people</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-bg-card/50 border border-border/30 text-left space-y-3">
                <Quote size={20} className="text-accent-light/40" />
                <p className="text-sm text-text-secondary leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm">{t.avatar}</div>
                  <div><p className="text-sm font-medium text-text-primary">{t.name}</p><p className="text-xs text-text-muted">{t.role}</p></div>
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
            <Send size={12} /> Free weekly calm tips
          </div>
          <h2 className="text-3xl font-bold mb-3">Join the community</h2>
          <p className="text-text-muted mb-8 text-sm">Get a free lofi mix + weekly calm tips. No spam. Just zen.</p>

          {subscribed ? (
            <div className="p-6 rounded-2xl bg-bg-card border border-border/30 space-y-2">
              <Check size={28} className="mx-auto text-accent-light" />
              <p className="text-text-primary font-medium">You're in! 🧘</p>
              <p className="text-sm text-text-muted">Check your inbox for your free lofi mix.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                className="flex-1 bg-bg-hover border border-border/50 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-all" />
              <button type="submit" className="px-6 py-3 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:bg-accent-light transition-all flex-shrink-0">Join Free</button>
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
              <p className="text-xs text-text-muted leading-relaxed">Your daily dose of calm. Lofi music, yoga, meditation, and mindfulness — all in one peaceful place.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Content</h4>
              <a href="#features" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Features</a>
              <Link href="/browse" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Browse Free</Link>
              <Link href="/podcast" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Podcast</Link>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Company</h4>
              <a href="#" className="block text-xs text-text-muted hover:text-text-primary transition-colors">About</a>
              <a href="#" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Contact</a>
              <a href="#" className="block text-xs text-text-muted hover:text-text-primary transition-colors">Privacy</a>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Follow</h4>
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
            <p className="text-[11px] text-text-muted">&copy; {new Date().getFullYear()} LofiBuddha. Discover zen vibes — products and experiences that bring peace and joy to your life.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
