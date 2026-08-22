"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Heart, BookOpen, Music, ChevronRight, Moon, Download } from "lucide-react";

interface DripItem {
  day: number;
  type: string;
  title: string;
  subtitle?: string;
  body: string;
  duration?: string;
  action?: { label: string; url: string };
  download?: { label: string; url: string };
}

interface DripData {
  tier: string;
  title?: string;
  subtitle?: string;
  dripDay: number;
  startDate: string;
  unlockedDays: number[];
  items: DripItem[];
  nextUnlock: { day: number; title: string } | null;
}

const typeIcons: Record<string, React.ElementType> = {
  welcome: Heart,
  feature: Moon,
  playlist: Music,
  course: BookOpen,
  guide: BookOpen,
  intake: Heart,
  roadmap: BookOpen,
  video: Music,
  session: Moon,
  reflection: BookOpen,
};

const typeColors: Record<string, string> = {
  welcome: "bg-amber-100 text-amber-800",
  feature: "bg-purple-100 text-purple-800",
  playlist: "bg-blue-100 text-blue-800",
  course: "bg-emerald-100 text-emerald-800",
  guide: "bg-teal-100 text-teal-800",
  intake: "bg-rose-100 text-rose-800",
  roadmap: "bg-indigo-100 text-indigo-800",
  video: "bg-orange-100 text-orange-800",
  session: "bg-violet-100 text-violet-800",
  reflection: "bg-cyan-100 text-cyan-800",
};

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [drip, setDrip] = useState<DripData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchDrip = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/drip?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setDrip(null);
      } else {
        setDrip(data);
      }
    } catch {
      setError("Unable to load your journey. Please try again.");
    }
    setLoading(false);
  }, [email]);

  const startDateStr = drip?.startDate
    ? new Date(drip.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5", color: "#1c1917", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(250,248,245,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5 no-underline">
            <img src="/lofibuddha.png" alt="LofiBuddha" className="h-[31px] w-[31px]" style={{ borderRadius: 8 }} />
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: "1.1rem", color: "#1c1917", fontWeight: 500 }}>LofiBuddha</span>
          </Link>
          <Link href="/landing" style={{ color: "#78716c", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>← Home</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "#b08050", marginBottom: "0.75rem" }}>Your Journey</p>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 300 }}>Welcome back</h1>
          <p style={{ color: "#78716c", marginTop: "0.75rem", fontWeight: 300 }}>Enter your email to see your practice journey.</p>
        </div>

        <form onSubmit={fetchDrip} className="flex gap-3 max-w-md mx-auto mb-10">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
            style={{ flex: 1, padding: "0.85rem 1.25rem", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", background: "white", color: "#1c1917", fontFamily: '"Inter", sans-serif', fontSize: "0.9rem", outline: "none" }}
          />
          <button type="submit" disabled={loading}
            style={{ padding: "0.85rem 1.5rem", borderRadius: "100px", border: "none", background: "#1c1917", color: "white", fontFamily: '"Inter", sans-serif', fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Loading..." : "View journey"}
          </button>
        </form>

        {error && (
          <div className="text-center p-6 rounded-2xl mb-10" style={{ background: "#f5f0e8" }}>
            <p style={{ color: "#78716c", fontSize: "0.9rem" }}>{error}</p>
          </div>
        )}

        {drip && (
          <div className="space-y-8">
            {/* Status card */}
            <div className="rounded-2xl p-6 sm:p-8 text-center" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b08050", marginBottom: "0.5rem" }}>
                {drip.title || (drip.tier === "enlightened" ? "Enlightened Path" : drip.tier === "mindful" ? "Mindful Path" : "Zen Beginner")}
              </p>
              <p style={{ fontSize: "2.5rem", fontFamily: '"Playfair Display", serif', fontWeight: 300, color: "#1c1917" }}>Day {drip.dripDay}</p>
              {startDateStr && <p style={{ color: "#78716c", fontSize: "0.85rem", fontWeight: 300 }}>Your journey began {startDateStr}</p>}
            </div>

            {/* Unlocked items */}
            <div>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: "1.3rem", fontWeight: 500, marginBottom: "1rem" }}>Unlocked so far</h2>
              <div className="space-y-3">
                {drip.items.map((item, i) => {
                  const Icon = typeIcons[item.type] || BookOpen;
                  const isOpen = expanded === i;
                  return (
                    <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ background: "white", border: "1px solid rgba(0,0,0,0.04)" }}>
                      <button
                        onClick={() => setExpanded(isOpen ? null : i)}
                        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
                        style={{ background: "transparent", border: "none" }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[item.type] || "bg-stone-100 text-stone-600"}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontWeight: 400, color: "#1c1917", fontSize: "0.9rem" }}>{item.title}</p>
                          <p style={{ color: "#78716c", fontSize: "0.75rem", fontWeight: 300 }}>
                            Day {item.day} · {item.type}{item.duration ? ` · ${item.duration}` : ""}
                          </p>
                        </div>
                        <ChevronRight size={16} style={{ color: "#b08050", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-0" style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                          <div style={{ padding: "1rem 0", color: "#44403c", fontSize: "0.85rem", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                            {item.body}
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {item.action && (
                              <a href={item.action.url}
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "100px", background: "#1c1917", color: "white", textDecoration: "none", fontSize: "0.78rem", fontFamily: '"Inter", sans-serif' }}
                              >
                                {item.action.label}
                              </a>
                            )}
                            {item.download && (
                              <a href={`${item.download.url}?email=${encodeURIComponent(email)}`} download
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1917", textDecoration: "none", fontSize: "0.78rem", fontFamily: '"Inter", sans-serif' }}
                              >
                                <Download size={14} /> {item.download.label}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next unlock */}
            {drip.nextUnlock && (
              <div className="rounded-2xl p-6 text-center" style={{ background: "#f5f0e8", border: "1px dashed rgba(0,0,0,0.08)" }}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock size={14} style={{ color: "#b08050" }} />
                  <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#b08050" }}>Next unlock — Day {drip.nextUnlock.day}</p>
                </div>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: "1.1rem", color: "#1c1917", fontWeight: 400 }}>{drip.nextUnlock.title}</p>
                <p style={{ color: "#78716c", fontSize: "0.8rem", fontWeight: 300, marginTop: "0.25rem" }}>{drip.nextUnlock.day - drip.dripDay} day{drip.nextUnlock.day - drip.dripDay > 1 ? "s" : ""} to go</p>
              </div>
            )}

            {/* AI Buddha CTA */}
            {drip.tier !== "zen" && (
              <div className="rounded-2xl p-6 text-center" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b08050", marginBottom: "0.75rem" }}>Today's Practice</p>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: "1.2rem", color: "#1c1917", fontWeight: 400, marginBottom: "0.5rem" }}>Your daily meditation</p>
                <p style={{ color: "#78716c", fontSize: "0.85rem", fontWeight: 300, marginBottom: "1rem" }}>Ask AI Buddha to guide you through a meditation tailored to how you feel today.</p>
                <a href="https://lofibuddha.com/chat"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", borderRadius: "100px", background: "#b08050", color: "white", textDecoration: "none", fontSize: "0.8rem", fontFamily: '"Inter", sans-serif' }}
                >Begin meditation</a>
              </div>
            )}

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Link href="https://lofibuddha.com/chat"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", borderRadius: "100px", background: "#1c1917", color: "white", textDecoration: "none", fontSize: "0.8rem", fontFamily: '"Inter", sans-serif' }}
              ><Moon size={14} /> Chat with AI Buddha</Link>
              <Link href="/mindfulness/breathe"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1917", textDecoration: "none", fontSize: "0.8rem", fontFamily: '"Inter", sans-serif' }}
              >Breathe</Link>
              <Link href="/mindfulness"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.5rem", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.1)", color: "#1c1917", textDecoration: "none", fontSize: "0.8rem", fontFamily: '"Inter", sans-serif' }}
              ><Music size={14} /> Browse library</Link>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        body { background: #faf8f5 !important; color: #1c1917 !important; }
      `}</style>
    </div>
  );
}
