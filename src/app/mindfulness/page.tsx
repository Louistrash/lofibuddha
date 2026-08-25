"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Activity, MessageCircle, Timer, Moon, Play, Volume2, VolumeX } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import CarouselDots from "@/components/CarouselDots";
import Mandala from "@/components/Mandala";
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
      <span className="mindful-visual-sound">{unmuted ? <Volume2 size={15} /> : <VolumeX size={15} />}</span>
      <span className="mindful-visual-label">{label}</span>
    </div>
  );
}

export default function MindfulnessPage() {
  const { user: fbUser, loading: fbLoading } = useAuth();
  const [checked, setChecked] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

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
      <Mandala />

      {/* Nav */}
      <nav className="mindful-nav">
        <div className="mindful-nav-inner">
          <Link href="/" className="mindful-nav-home">
            <img src="/bodhi-icon.png" alt="LofiBuddha" className="mindful-nav-icon" />
            <span>
              <span className="mindful-nav-name">LofiBuddha</span>
              <span className="mindful-nav-script">ध्यान • शांति</span>
            </span>
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
          <span className="mindful-hero-eyebrow">साँस • ध्यान • शांति</span>
          <h1 className="mindful-hero-title">Your <span className="gold">mindfulness</span> space</h1>
          <p className="mindful-hero-sub">
            Breathe, focus, and unwind — one calm place for everything that helps you settle.
          </p>
          <div className="mindful-hero-cta">
            <Link href="/mindfulness/breathe" className="mindful-btn mindful-btn-primary">
              <Play size={16} strokeWidth={0} fill="currentColor" /> Start breathing
            </Link>
            <Link href="/mindfulness/sleep" className="mindful-btn mindful-btn-ghost">Explore sounds</Link>
          </div>
        </div>

        {/* Hoofd-categorieën — het ecosysteem */}
        <section className="mindful-section">
          <div className="mindful-section-head">
            <h2 className="mindful-section-title">Journeys</h2>
            <span className="mindful-section-script">चार मार्ग — four paths</span>
          </div>
          <div className="mindful-services" ref={servicesRef}>
            <Link href="/mindfulness/sleep" className="mindful-card mindful-card-featured" style={{ textDecoration: "none" }}>
              <div className="mindful-card-art mindful-card-art--sleep" />
              <div className="mindful-card-body">
                <div className="mindful-card-icon"><Moon size={24} strokeWidth={1.6} /></div>
                <h3 className="mindful-card-title">Sleep &amp; Relax</h3>
                <p className="mindful-card-desc">Drift into sleep, let go, and rest in gratitude — each with its own soundscape and guidance.</p>
                <div className="mindful-card-foot">
                  <span className="mindful-card-play"><Play size={20} strokeWidth={0} fill="currentColor" /></span>
                  <span className="mindful-card-cta">Explore <span className="arr">→</span></span>
                </div>
              </div>
            </Link>

            <Link href="/mindfulness/breathe" className="mindful-card mindful-card-breathe" style={{ textDecoration: "none" }}>
              <div className="mindful-card-art mindful-card-art--breathe" />
              <div className="mindful-card-body">
                <div className="mindful-card-icon"><Activity size={24} strokeWidth={1.6} /></div>
                <h3 className="mindful-card-title">Breathe</h3>
                <p className="mindful-card-desc">Breath of Life, Box Breathing, The Witness — settle the nervous system.</p>
                <div className="mindful-card-foot">
                  <span className="mindful-card-play"><Play size={20} strokeWidth={0} fill="currentColor" /></span>
                  <span className="mindful-card-cta">Explore <span className="arr">→</span></span>
                </div>
              </div>
            </Link>

            <Link href="/mindfulness/focus" className="mindful-card mindful-card-focus" style={{ textDecoration: "none" }}>
              <div className="mindful-card-art mindful-card-art--focus" />
              <div className="mindful-card-body">
                <div className="mindful-card-icon"><Timer size={24} strokeWidth={1.6} /></div>
                <h3 className="mindful-card-title">Focus</h3>
                <p className="mindful-card-desc">Focus Anchor, Deep Work, Mindful Reset + Pomodoro — deep work, guided.</p>
                <div className="mindful-card-foot">
                  <span className="mindful-card-play"><Play size={20} strokeWidth={0} fill="currentColor" /></span>
                  <span className="mindful-card-cta">Explore <span className="arr">→</span></span>
                </div>
              </div>
            </Link>

            <Link href="/mindfulness/relax" className="mindful-card mindful-card-relax" style={{ textDecoration: "none" }}>
              <div className="mindful-card-art mindful-card-art--relax" />
              <div className="mindful-card-body">
                <div className="mindful-card-icon"><MessageCircle size={24} strokeWidth={1.6} /></div>
                <h3 className="mindful-card-title">Relax</h3>
                <p className="mindful-card-desc">Body Scan, Stillness, Zen Garden — unwind, release, rest.</p>
                <div className="mindful-card-foot">
                  <span className="mindful-card-play"><Play size={20} strokeWidth={0} fill="currentColor" /></span>
                  <span className="mindful-card-cta">Explore <span className="arr">→</span></span>
                </div>
              </div>
            </Link>
          </div>
        </section>
        <CarouselDots containerRef={servicesRef} color="#e0b185" label="Categories" />

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
