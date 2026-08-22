"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src="/bodhi-icon.png" alt="" className="site-footer-logo" />
          <span className="site-footer-name">LofiBuddha</span>
          <p className="site-footer-tag">your personal space to focus, create and unwind.</p>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-head">Navigate</span>
          <Link href="/" className="site-footer-link">Home</Link>
          <Link href="/mindfulness" className="site-footer-link">Mindfulness</Link>
          <Link href="/mindfulness/breathe" className="site-footer-link">Breathe</Link>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-head">Legal</span>
          <Link href="/legal/privacy" className="site-footer-link">Privacy Policy</Link>
          <Link href="/legal/terms" className="site-footer-link">Terms of Service</Link>
          <Link href="/legal/disclaimer" className="site-footer-link">Disclaimer</Link>
          <button
            className="site-footer-link site-footer-cookie-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("lofibuddha:open-consent"))}
          >
            Cookie settings
          </button>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>music × focus × calm × visual worlds × ai</span>
        <span>© {new Date().getFullYear()} LofiBuddha</span>
      </div>
    </footer>
  );
}
