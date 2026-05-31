import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podcast — LofiBuddha",
  description: "The LofiBuddha podcast — conversations on mindfulness, slow living, and the art of calm. Coming soon.",
};

export default function PodcastPage() {
  return (
    <div className="min-h-screen" style={{ background: "#faf8f5", color: "#1c1917", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(250,248,245,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5 no-underline">
            <img src="/lofibuddha.png" alt="LofiBuddha" className="h-[35px] w-auto" style={{ borderRadius: 8 }} />
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: "1.1rem", color: "#1c1917", fontWeight: 500 }}>
              LofiBuddha
            </span>
          </Link>
          <Link href="/landing" style={{ color: "#78716c", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
            ← Back
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "#b08050", marginBottom: "1.5rem" }}>
          Coming soon
        </p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: "1rem" }}>
          The LofiBuddha Podcast
        </h1>
        <p style={{ color: "#78716c", fontSize: "1rem", lineHeight: 1.8, fontWeight: 300, marginBottom: "2.5rem" }}>
          Conversations on mindfulness, slow living, and the art of finding calm in a restless world.
          New episodes coming this summer.
        </p>
        <Link
          href="/landing"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.9rem 2rem", borderRadius: "100px",
            background: "#1c1917", color: "white", textDecoration: "none",
            fontSize: "0.85rem", fontWeight: 400, letterSpacing: "0.03em",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Return home
        </Link>
      </main>
    </div>
  );
}
