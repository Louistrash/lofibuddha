"use client";

import { useState } from "react";
import {
  Play, Sparkles, Users, CreditCard, Check, ArrowRight,
  Heart, Moon, Sun, Music, Zap, Shield, Star,
  Music2, Camera, Globe, Podcast, Headphones, Send, Tv,
} from "lucide-react";
import Link from "next/link";

// ── Tiers ──

const tiers = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    desc: "Dip your toes in the calm.",
    features: [
      "3 lofi tracks / week",
      "1 yoga flow / week",
      "Community access",
      "Browse free content",
    ],
    cta: "Start Free",
    href: "/signup?tier=free",
    featured: false,
    priceId: "",
  },
  {
    name: "Zen",
    price: "€4.99",
    period: "/month",
    desc: "Your daily dose of peace.",
    features: [
      "Unlimited lofi streams",
      "Full yoga library",
      "Guided breathwork",
      "Ad-free experience",
      "Offline downloads",
      "Community challenges",
    ],
    cta: "Start 7-Day Free Trial",
    href: "/signup?tier=zen",
    featured: true,
    priceId: "price_zen_monthly",
  },
  {
    name: "Master",
    price: "€9.99",
    period: "/month",
    desc: "Deepen your practice.",
    features: [
      "Everything in Zen",
      "Live guided sessions",
      "Exclusive workshops",
      "1-on-1 coaching (2x/mo)",
      "Early access to new content",
      "Custom playlists",
      "Priority support",
    ],
    cta: "Start 7-Day Free Trial",
    href: "/signup?tier=master",
    featured: false,
    priceId: "price_master_monthly",
  },
];

// ── Testimonials ──

const testimonials = [
  { quote: "This platform changed my mornings. The yoga flows are so calming and the lofi music is perfect.", name: "Sarah M.", role: "Yoga student", avatar: "🧘‍♀️" },
  { quote: "Finally, lofi music that actually helps me focus. No ads, no distractions — just pure concentration.", name: "James K.", role: "Software Developer", avatar: "💻" },
  { quote: "The breathwork sessions helped me through a really stressful period. Forever grateful.", name: "Emma L.", role: "Teacher", avatar: "📚" },
  { quote: "I've tried many meditation apps. LofiBuddha feels different — it's warm, human, not robotic.", name: "David R.", role: "Designer", avatar: "🎨" },
  { quote: "The community here is so supportive. I finally found my tribe of mindful souls.", name: "Lisa V.", role: "Nurse", avatar: "💜" },
  { quote: "My sleep has improved so much since I started the evening wind-down sessions.", name: "Mark T.", role: "Entrepreneur", avatar: "🚀" },
];

// ── Features ──

const features = [
  { icon: Music, title: "Lofi Music", desc: "Endless streams of handpicked lofi, chillhop, ambient, and jazzhop. Perfect for focus, study, or sleep.", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: Sun, title: "Yoga Flows", desc: "Gentle morning flows, energizing sequences, and relaxing evening practices for every level.", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: Moon, title: "Guided Meditation", desc: "Breathwork, body scans, and mindfulness sessions narrated with warmth and clarity.", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: Podcast, title: "Podcast", desc: "Weekly conversations about mindfulness, creativity, and living with intention in a busy world.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: Users, title: "Community", desc: "Join a growing community of mindful souls. Share your journey, find accountability.", color: "text-pink-400", bg: "bg-pink-400/10" },
  { icon: Shield, title: "No Ads. Ever.", desc: "Your peace is our priority. No interruptions, no algorithms hijacking your attention.", color: "text-red-400", bg: "bg-red-400/10" },
];

// ── Social links ──

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  const handleStripeCheckout = async (tier: string, priceId: string) => {
    if (!priceId) {
      window.location.href = `/signup?tier=${tier}`;
      return;
    }
    setCheckoutLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, email: "" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else window.location.href = `/signup?tier=${tier}`;
    } catch {
      window.location.href = `/signup?tier=${tier}`;
    }
    setCheckoutLoading(null);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
              <Moon size={20} className="text-accent-light" />
            </div>
            <span className="font-semibold text-text-primary tracking-wide text-lg">LofiBuddha</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#content" className="hover:text-text-primary transition-colors">Content</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
            <a href="#podcast" className="hover:text-text-primary transition-colors">Podcast</a>
            <a href="#community" className="hover:text-text-primary transition-colors">Stories</a>
          </div>
          <a href="https://bodhi.aibuddha.net" target="_blank" rel="noopener" className="btn-zen text-sm py-2 px-5">
            Try Bodhi Pro →
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-light text-sm mb-8">
          <Sparkles size={14} /> New: AI-powered lofi & yoga platform
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          Your daily dose of <span className="text-accent-light">calm</span> in a chaotic world
        </h1>

        <p className="text-text-secondary text-lg sm:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          Unlimited lofi music, guided yoga flows, breathwork sessions, and meditation —
          all in one peaceful place. <span className="text-accent-light font-medium">No ads. Just calm.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button onClick={() => handleStripeCheckout("zen", "price_zen_monthly")} className="btn-zen text-base px-8 py-3.5 flex items-center gap-2">
            {checkoutLoading === "zen" ? "Loading..." : <><span>Start Your Free Trial</span><ArrowRight size={18} /></>}
          </button>
          <Link href="/browse" className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 px-6 py-3.5">
            <Play size={16} /> Browse free content
          </Link>
        </div>

        {/* Hero video */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl shadow-accent/10 border border-border">
            <video src="/videos/youtube/zen-lofi-youtube.mp4" controls muted autoPlay loop className="w-full" poster="/images/bg/bg-youtube.png" />
          </div>
          <p className="text-xs text-text-muted mt-3">Preview: &ldquo;Relax and unwind. Your mind deserves silence.&rdquo;</p>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-text-muted text-sm">
          <span className="flex items-center gap-1.5"><Shield size={14} /> 7-day free trial</span>
          <span className="flex items-center gap-1.5"><Zap size={14} /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><Heart size={14} /> 2,400+ happy souls</span>
          <span className="flex items-center gap-1.5"><Star size={14} /> 4.9 ★ rating</span>
        </div>
      </section>

      {/* ── Logos / As Seen On ── */}
      <section className="py-12 px-6 border-y border-border bg-bg-surface">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-6">As featured on</p>
          <div className="flex flex-wrap items-center justify-center gap-10 text-text-muted text-lg font-semibold opacity-60">
            <span className="flex items-center gap-2"><Tv size={20} className="text-red-400" /> YouTube</span>
            <span className="flex items-center gap-2"><Music2 size={20} className="text-pink-400" /> TikTok</span>
            <span className="flex items-center gap-2"><Camera size={20} className="text-purple-400" /> Instagram</span>
            <span className="flex items-center gap-2"><Podcast size={20} className="text-emerald-400" /> Spotify</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to unwind</h2>
            <p className="text-text-muted mt-3 max-w-xl mx-auto">Curated content designed to help you relax, focus, and reconnect with yourself.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass p-6 space-y-3 hover:border-accent/20 transition-all group">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="font-semibold text-text-primary">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Preview ── */}
      <section id="content" className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start your journey today</h2>
          <p className="text-text-muted mb-12 max-w-xl mx-auto">Handpicked sessions to calm your mind, body, and soul.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: "🧘", title: "Morning Yoga", desc: "10 min gentle flow", color: "border-amber-400/30 hover:border-amber-400/60" },
              { emoji: "🎵", title: "Focus Lofi", desc: "Deep work beats", color: "border-blue-400/30 hover:border-blue-400/60" },
              { emoji: "🌙", title: "Sleep Stories", desc: "Guided relaxation", color: "border-purple-400/30 hover:border-purple-400/60" },
              { emoji: "🫁", title: "Breathwork", desc: "5 min reset", color: "border-emerald-400/30 hover:border-emerald-400/60" },
              { emoji: "🧠", title: "Meditation", desc: "Body scan sessions", color: "border-pink-400/30 hover:border-pink-400/60" },
              { emoji: "🎧", title: "Lofi Mixes", desc: "Curated playlists", color: "border-red-400/30 hover:border-red-400/60" },
              { emoji: "📝", title: "Journaling", desc: "Guided prompts", color: "border-teal-400/30 hover:border-teal-400/60" },
              { emoji: "🌿", title: "Nature Sounds", desc: "Rain, forest, ocean", color: "border-green-400/30 hover:border-green-400/60" },
            ].map((item) => (
              <div key={item.title} className={`glass p-5 text-center space-y-2 border ${item.color} transition-all cursor-pointer hover:scale-[1.02]`}>
                <div className="text-3xl">{item.emoji}</div>
                <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>

          <Link href="/browse" className="btn-zen inline-flex items-center gap-2 px-6 py-3 mt-10">
            Browse All Content <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Podcast Teaser ── */}
      <section id="podcast" className="py-24 px-6 bg-bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="glass p-8 sm:p-12 text-center space-y-6 bg-gradient-to-b from-purple-500/5 to-transparent border-purple-400/20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm">
              <Headphones size={14} /> Podcast
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">The Mindful Creative</h2>
            <p className="text-text-muted max-w-lg mx-auto">
              Weekly conversations about mindfulness, creativity, and living with intention. Available on all platforms.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              {[
                { ep: "#12", title: "The Art of Doing Nothing", desc: "Why rest is productive", date: "New episode" },
                { ep: "#11", title: "Morning Routines That Stick", desc: "Build habits that last", date: "Last week" },
                { ep: "#10", title: "Creativity & Stillness", desc: "Finding flow in quiet", date: "2 weeks ago" },
              ].map((ep) => (
                <div key={ep.ep} className="bg-bg-hover rounded-xl p-5 text-left space-y-2 hover:border-purple-400/30 border border-border transition-all cursor-pointer">
                  <span className="text-[10px] text-purple-400 font-semibold">{ep.ep} — {ep.date}</span>
                  <h3 className="font-semibold text-text-primary text-sm">{ep.title}</h3>
                  <p className="text-xs text-text-muted">{ep.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              {[
                { label: "Spotify", href: "https://open.spotify.com/" },
                { label: "Apple Podcasts", href: "https://podcasts.apple.com/" },
                { label: "YouTube", href: "https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A" },
              ].map((p) => (
                <a key={p.label} href={p.href} target="_blank" rel="noopener" className="text-sm text-text-secondary hover:text-accent-light transition-colors flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-hover border border-border">
                  <Headphones size={14} /> {p.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Simple, peaceful pricing</h2>
            <p className="text-text-muted mt-3">Start free. Upgrade when you're ready. No pressure. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div key={tier.name} className={`glass p-6 space-y-5 relative ${tier.featured ? "border-accent/40 ring-1 ring-accent/20 scale-[1.02]" : ""}`}>
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg-primary text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="text-sm text-text-muted mt-1">{tier.desc}</p>
                </div>
                <div>
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-text-muted text-sm">{tier.period}</span>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleStripeCheckout(tier.name.toLowerCase(), tier.priceId)}
                  disabled={checkoutLoading === tier.name.toLowerCase()}
                  className={`block w-full text-center py-3 rounded-xl font-medium text-sm transition-all ${tier.featured ? "bg-accent text-bg-primary hover:bg-accent-light" : "bg-bg-hover text-text-primary hover:bg-border"} disabled:opacity-50`}
                >
                  {checkoutLoading === tier.name.toLowerCase() ? "Loading..." : tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="community" className="py-24 px-6 bg-bg-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What our community says</h2>
          <p className="text-text-muted mb-12">Real stories from real people finding their calm.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass p-6 text-left space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (<Star key={i} size={12} className="text-amber-400 fill-amber-400" />))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-sm">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-light text-sm mb-6">
            <Send size={14} /> Free weekly calm tips
          </div>
          <h2 className="text-3xl font-bold mb-3">Join the community</h2>
          <p className="text-text-muted mb-8">Get a free lofi mix + weekly calm tips delivered to your inbox.</p>

          {subscribed ? (
            <div className="glass p-6 text-center space-y-2">
              <Check size={32} className="mx-auto text-success" />
              <p className="text-text-primary font-medium">You're in! 🧘</p>
              <p className="text-sm text-text-muted">Check your inbox for your free lofi mix.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                className="flex-1 bg-bg-hover border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50" />
              <button type="submit" className="btn-zen text-sm px-6 py-3 flex-shrink-0">Join Free</button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-6 border-t border-border bg-bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Moon size={18} className="text-accent-light" />
                <span className="font-semibold">LofiBuddha</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Your daily dose of calm. Lofi music, yoga, meditation, and mindfulness — all in one peaceful place.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-secondary">Content</h4>
              <div className="space-y-2 text-sm text-text-muted">
                <a href="#features" className="block hover:text-text-primary transition-colors">Features</a>
                <Link href="/browse" className="block hover:text-text-primary transition-colors">Browse Free Content</Link>
                <a href="#podcast" className="block hover:text-text-primary transition-colors">Podcast</a>
                <a href="#pricing" className="block hover:text-text-primary transition-colors">Pricing</a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-secondary">Company</h4>
              <div className="space-y-2 text-sm text-text-muted">
                <a href="#" className="block hover:text-text-primary transition-colors">About</a>
                <a href="#" className="block hover:text-text-primary transition-colors">Blog</a>
                <a href="#" className="block hover:text-text-primary transition-colors">Contact</a>
                <a href="#" className="block hover:text-text-primary transition-colors">Privacy Policy</a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-secondary">Follow Us</h4>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener" className={`w-9 h-9 rounded-xl bg-bg-hover border border-border flex items-center justify-center text-text-muted ${s.color} transition-all`}>
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
              <a href="https://bodhi.aibuddha.net" target="_blank" rel="noopener" className="block text-xs text-accent-light hover:text-accent transition-colors mt-2">
                Bodhi Pro Dashboard →
              </a>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border">
            <p className="text-xs text-text-muted">Discover zen vibes with LofiBuddha. We blend lo-fi music and mindfulness, offering products and experiences that bring peace and joy to your life.</p>
            <p className="text-xs text-text-muted mt-2">&copy; {new Date().getFullYear()} LofiBuddha. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
