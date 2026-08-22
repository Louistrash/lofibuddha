"use client";

import Link from "next/link";
import LangToggle from "./lang-toggle";

export default function LegalLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-page">
      {/* Nav */}
      <nav className="legal-nav">
        <div className="legal-nav-inner">
          <Link href="/" className="legal-nav-home">
            <img src="/bodhi-icon.png" alt="LofiBuddha" className="legal-nav-icon" />
            <span className="legal-nav-name">LofiBuddha</span>
          </Link>
          <div className="legal-nav-right">
            <LangToggle />
            <Link href="/" className="legal-nav-back">← Back</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="legal-main">
        <div className="legal-glow" aria-hidden="true" />
        <div className="legal-content">{children}</div>
      </main>

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <span className="legal-footer-copy">&copy; {new Date().getFullYear()} LofiBuddha. All rights reserved.</span>
          <div className="legal-footer-links">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
