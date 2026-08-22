"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Activity, MessageCircle, Timer, Moon, Volume2, VolumeX } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import CarouselDots from "@/components/CarouselDots";
import { useAuth } from "@/lib/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Visual loop met tap-voor-geluid: autoplay muted, klik unmute + start geluid
function VisualLoop({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [unmuted, setUnmuted] = useState(false);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    if (v.muted) {
      v.muted = false;
      v.play().catch(() => {});
      setUnmuted(true);
    } else {
      v.muted = true;
      setUnmuted(false);
    }
  };

  return (
    <div className="mindful-visual" onClick={toggleSound} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleSound(); }}
      title={unmuted ? "Tap to mute" : "Tap for sound"}
    >
      <video ref={ref} src={src} loop muted autoPlay playsInline className="mindful-visual-video" />
      <span className="mindful-visual-sound">{unmuted ? <Volume2 size={13} /> : <VolumeX size={13} />}</span>
      <span className="mindful-visual-label">{label}</span>
    </div>
  );
}

export default function MindfulnessPage() {
  const { user: fbUser, loading: fbLoading } = useAuth();
  const [checked, setChecked] = useState(false);
  const servicesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!fbLoading) setChecked(true);
  }, [fbLoading]);

  async function logout() {
    await signOut(auth);
  }

  const user = fbUser ? {
    id: fbUser.uid,
    name: fbUser.displayName || "friend",
    email: fbUser.email || undefined,
    tokens: 100,
    plan: "Free",
  } : null;

  const planLabel: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    focus: "Focus",
    deep: "Deep",
  };

  return (
    <div className="mindful-page">
      {/* Nav */}
      <nav className="mindful-nav">
        <div className="mindful-nav-inner">
          <Link href="/" className="mindful-nav-home">
            <img src="/bodhi-icon.png" alt="LofiBuddha" className="mindful-nav-icon" />
            <span className="mindful-nav-name">LofiBuddha</span>
          </Link>
          <div className="mindful-nav-right">
            {user ? (
              <>
                <span className="mindful-nav-user">{user.name || "member"}</span>
                <button className="mindful-nav-logout" onClick={logout}>Log out</button>
              </>
            ) : (
              <a href="#signin" className="mindful-nav-back">Sign in</a>
            )}
          </div>
        </div>
      </nav>

      <main className="mindful-main">
        {/* Hero */}
        <div className="mindful-hero">
          <h1 className="mindful-hero-title">Your mindfulness space</h1>
          <p className="mindful-hero-sub">
            Breathe, focus, and unwind — one calm place for everything that helps you settle.
          </p>
        </div>

        {/* Hoofd-categorieën — het ecosysteem */}
        <section className="mindful-services" ref={servicesRef}>
          <Link href="/mindfulness/sleep" className="mindful-card mindful-card-featured" style={{ textDecoration: "none" }}>
            <Moon className="mindful-card-icon" size={26} strokeWidth={1.6} />
            <h3 className="mindful-card-title">Sleep & Relax</h3>
            <p className="mindful-card-desc">Drift Into Sleep, Letting Go, Gratitude — each with its own soundscape and guidance.</p>
            <span className="mindful-card-cta">Explore →</span>
          </Link>
          <Link href="/mindfulness/breathe" className="mindful-card" style={{ textDecoration: "none" }}>
            <Activity className="mindful-card-icon" size={26} strokeWidth={1.6} />
            <h3 className="mindful-card-title">Breathe</h3>
            <p className="mindful-card-desc">Breath of Life, Box Breathing, The Witness — calm the nervous system.</p>
            <span className="mindful-card-cta">Explore →</span>
          </Link>
          <Link href="/mindfulness/focus" className="mindful-card" style={{ textDecoration: "none" }}>
            <Timer className="mindful-card-icon" size={26} strokeWidth={1.6} />
            <h3 className="mindful-card-title">Focus</h3>
            <p className="mindful-card-desc">Focus Anchor, Deep Work, Mindful Reset + Pomodoro — deep work, guided.</p>
            <span className="mindful-card-cta">Explore →</span>
          </Link>
          <Link href="/mindfulness/relax" className="mindful-card" style={{ textDecoration: "none" }}>
            <MessageCircle className="mindful-card-icon" size={26} strokeWidth={1.6} />
            <h3 className="mindful-card-title">Relax</h3>
            <p className="mindful-card-desc">Body Scan, Stillness, Zen Garden — unwind, release, rest.</p>
            <span className="mindful-card-cta">Explore →</span>
          </Link>
        </section>
        <CarouselDots containerRef={servicesRef} color="#b89258" label="Categories" />

        {/* Visual loops — looping relaxatie video's */}
        <section className="mindful-visuals">
          <div className="mindful-visuals-head">
            <h2 className="mindful-visuals-title">Visual loops</h2>
            <p className="mindful-visuals-sub">Looping scenes for your screen — tap a loop for sound.</p>
          </div>
          <div className="mindful-visuals-grid">
            <VisualLoop src="/videos/shorts/ocean-loop.mp4" label="Soft Ocean" />
            <VisualLoop src="/videos/shorts/night-loop.mp4" label="Night Temple" />
            <VisualLoop src="/videos/shorts/temple-loop.mp4" label="Golden Temple" />
            <VisualLoop src="/videos/shorts/breathe-loop.mp4" label="Breathe" />
          </div>
        </section>

        {/* Auth / member area */}
        <section className="mindful-auth" id="signin">
          {!checked ? (
            <p className="mindful-auth-loading">…</p>
          ) : user ? (
            <div className="mindful-member">
              <div className="mindful-member-head">
                <img src="/bodhi-icon.png" alt="" className="mindful-member-avatar" />
                <div>
                  <h2 className="mindful-member-name">Welcome back, {user.name || "friend"} 🙏</h2>
                  <span className="mindful-member-plan">{planLabel[user.plan] || user.plan} member</span>
                </div>
              </div>

              <div className="mindful-member-stats">
                <div className="mindful-stat">
                  <span className="mindful-stat-value">{user.tokens?.toLocaleString() ?? 0}</span>
                  <span className="mindful-stat-label">tokens</span>
                </div>
                <div className="mindful-stat">
                  <span className="mindful-stat-value">∞</span>
                  <span className="mindful-stat-label">chats</span>
                </div>
                <div className="mindful-stat">
                  <span className="mindful-stat-value">{user.plan === "free" ? "Free" : "✦"}</span>
                  <span className="mindful-stat-label">plan</span>
                </div>
              </div>

              <div className="mindful-member-perks">
                <span className="mindful-perks-title">Member benefits</span>
                <ul className="mindful-perks-list">
                  <li>✓ Personal AI Buddha chats</li>
                  <li>✓ Guided breathing sessions</li>
                  <li>✓ Token balance &amp; history</li>
                  <li>✦ Focus sessions &amp; premium worlds (soon)</li>
                </ul>
              </div>

              <div className="mindful-member-actions">
                <Link href="/chat" className="mindful-btn mindful-btn-primary">Chat with Buddha</Link>
                <Link href="/mindfulness/breathe" className="mindful-btn mindful-btn-ghost">Breathe</Link>
              </div>
            </div>
          ) : (
            <div className="mindful-signin">
              <img src="/bodhi-icon.png" alt="LofiBuddha" className="mindful-signin-icon" />
              <h2 className="mindful-signin-title">Join the calm</h2>
              <p className="mindful-signin-sub">
                Sign in to track your chats, save your tokens, and unlock member features.
              </p>
              <Link href="/login?redirect=%2Fmindfulness" className="mindful-btn mindful-btn-primary mindful-btn-block" style={{ textAlign: "center", textDecoration: "none" }}>
                Sign in with Google or email
              </Link>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
