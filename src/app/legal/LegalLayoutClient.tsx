"use client";

import Link from "next/link";
import LangToggle from "./lang-toggle";

export default function LegalLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#faf8f5", color: "#1c1917", fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(250,248,245,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5 no-underline">
            <img
              src="/lofibuddha.png"
              alt="LofiBuddha — mindfulness and lofi music"
              className="h-[31px] w-auto"
              style={{ borderRadius: 8 }}
            />
            <span
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: "1.1rem",
                color: "#1c1917",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              LofiBuddha
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LangToggle />
            <Link
              href="/landing"
              style={{
                color: "#78716c",
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 400,
                textDecoration: "none",
              }}
              className="hover:underline"
            >
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <div className="legal-content">{children}</div>
      </main>

      {/* Footer */}
      <footer
        className="py-8 text-center"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "#f5f0e8" }}
      >
        <div className="max-w-3xl mx-auto px-6 space-y-3">
          <p style={{ fontSize: "0.7rem", color: "#78716c", fontWeight: 300 }}>
            &copy; {new Date().getFullYear()} LofiBuddha. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-5">
            {[
              { label: "Privacy", href: "/legal/privacy" },
              { label: "Terms", href: "/legal/terms" },
              { label: "Disclaimer", href: "/legal/disclaimer" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "#78716c",
                  fontSize: "0.7rem",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                }}
                className="hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Inline typography styles for legal content */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

        body {
          background: #faf8f5 !important;
          color: #1c1917 !important;
        }
        .legal-content h1 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 2rem;
          font-weight: 400;
          color: #1c1917;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        .legal-content h2 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.3rem;
          font-weight: 500;
          color: #1c1917;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .legal-content h3 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1rem;
          font-weight: 500;
          color: #b08050;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .legal-content p {
          color: #78716c;
          line-height: 1.8;
          margin-bottom: 1rem;
          font-weight: 300;
        }
        .legal-content ul {
          margin: 0.5rem 0 1rem 1.5rem;
          color: #78716c;
          font-weight: 300;
          line-height: 1.8;
        }
        .legal-content li {
          margin-bottom: 0.4rem;
        }
        .legal-content strong {
          color: #1c1917;
          font-weight: 500;
        }
        .legal-content a {
          color: #b08050;
          text-decoration: none;
        }
        .legal-content a:hover {
          text-decoration: underline;
        }
        .legal-content .legal-updated {
          font-size: 0.8rem;
          color: #78716c;
          font-style: italic;
          margin-bottom: 2rem;
          font-weight: 300;
        }
        .legal-content .legal-notice {
          background: #f5f0e8;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          font-size: 0.85rem;
          line-height: 1.7;
          color: #44403c;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .legal-content .legal-notice p {
          color: #44403c;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
