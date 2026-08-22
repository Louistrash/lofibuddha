"use client";

import { useEffect, useState } from "react";
import {
  getConsent,
  saveConsent,
  emitConsentEvent,
  DEFAULT_CONSENT,
  CATEGORY_LABELS,
  type ConsentState,
  type ConsentCategory,
} from "@/lib/cookie-consent";

export default function CookieConsent() {
  const [state, setState] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (!existing || !existing.decided) {
      setState(DEFAULT_CONSENT);
      setShowBanner(true);
    } else {
      setState(existing);
    }
    const open = () => { setShowBanner(false); setShowPrefs(true); };
    window.addEventListener("lofibuddha:open-consent", open);
    return () => window.removeEventListener("lofibuddha:open-consent", open);
  }, []);

  function commit(next: ConsentState) {
    setState(next);
    saveConsent(next);
    emitConsentEvent(next);
    setShowBanner(false);
    setShowPrefs(false);
  }

  function acceptAll() {
    commit({
      ...(state || DEFAULT_CONSENT),
      preferences: true,
      analytics: true,
      marketing: true,
      decided: true,
    });
  }

  function rejectAll() {
    commit({
      ...(state || DEFAULT_CONSENT),
      preferences: false,
      analytics: false,
      marketing: false,
      decided: true,
    });
  }

  function toggle(cat: ConsentCategory) {
    if (cat === "necessary") return;
    setState((s) => (s ? { ...s, [cat]: !s[cat] } : s));
  }

  function savePrefs() {
    if (!state) return;
    commit({ ...state, decided: true });
  }

  if (!showBanner && !showPrefs && !state?.decided) return null;

  return (
    <>
      {/* Floating manage button — always available to withdraw consent */}
      {state?.decided && !showBanner && (
        <button className="cc-manage" onClick={() => setShowPrefs(true)} aria-label="Cookie preferences">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v.01M12 12v.01M12 16v.01M12 7.5a4.5 4.5 0 0 1 4.5 4.5" />
          </svg>
        </button>
      )}

      {/* Preferences modal */}
      {showPrefs && (
        <div className="cc-overlay" onClick={() => setShowPrefs(false)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="cc-title">Cookie preferences</h3>
            <p className="cc-sub">
              Choose which cookies you allow. Necessary cookies are always on so the site can function.
            </p>
            <div className="cc-cats">
              {(Object.keys(CATEGORY_LABELS) as ConsentCategory[]).map((cat) => {
                const meta = CATEGORY_LABELS[cat];
                const checked = state?.[cat] ?? (cat === "necessary");
                return (
                  <label key={cat} className={`cc-cat ${meta.required ? "cc-cat-locked" : ""}`}>
                    <span className="cc-cat-info">
                      <span className="cc-cat-title">{meta.title}</span>
                      <span className="cc-cat-desc">{meta.desc}</span>
                    </span>
                    <span className={`cc-toggle ${checked ? "cc-toggle-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={meta.required}
                        onChange={() => toggle(cat)}
                      />
                      <span className="cc-toggle-knob" />
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="cc-actions">
              <button className="cc-btn cc-btn-ghost" onClick={() => { setShowPrefs(false); if (!state?.decided) setShowBanner(true); }}>
                Back
              </button>
              <button className="cc-btn cc-btn-primary" onClick={savePrefs}>
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      {showBanner && (
        <div className="cc-banner">
          <div className="cc-banner-text">
            <span className="cc-banner-dot" aria-hidden="true">🍪</span>
            <p>
              We use cookies to keep LofiBuddha calm and personal — and to understand what helps you focus.
              See our <a href="/legal/privacy" className="cc-link">Privacy Policy</a>.
            </p>
          </div>
          <div className="cc-banner-actions">
            <button className="cc-btn cc-btn-primary" onClick={acceptAll}>Accept all</button>
            <button className="cc-btn cc-btn-ghost" onClick={rejectAll}>Reject all</button>
            <button className="cc-btn cc-btn-text" onClick={() => { setShowBanner(false); setShowPrefs(true); }}>
              Customize
            </button>
          </div>
        </div>
      )}
    </>
  );
}
