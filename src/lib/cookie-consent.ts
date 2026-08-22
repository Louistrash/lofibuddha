"use client";

// ─── Cookie Consent — GDPR/AVG consent management ─────────────────────────
// Category model follows the standard consent categories.

export type ConsentCategory = "necessary" | "preferences" | "analytics" | "marketing";

export interface ConsentState {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
  version: number;
  timestamp: number;
}

export const CONSENT_VERSION = 1;
const STORAGE_KEY = "lofibuddha_cookie_consent";
const COOKIE_NAME = "lofibuddha_cookie_consent";

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true, // always on — required for core function (session, chat)
  preferences: false,
  analytics: false,
  marketing: false,
  decided: false,
  version: CONSENT_VERSION,
  timestamp: Date.now(),
};

export const CATEGORY_LABELS: Record<ConsentCategory, { title: string; desc: string; required?: boolean }> = {
  necessary: {
    title: "Strictly necessary",
    desc: "Required for the site to work — your session and chat. Always active.",
    required: true,
  },
  preferences: {
    title: "Preferences",
    desc: "Remember your choices (language, preferences) for a smoother experience.",
  },
  analytics: {
    title: "Analytics",
    desc: "Anonymous usage data to help us understand and improve the experience.",
  },
  marketing: {
    title: "Marketing",
    desc: "Personalised content and offers across the platform.",
  },
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || readCookie(COOKIE_NAME);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed as ConsentState;
  } catch {
    return null;
  }
}

export function saveConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  const data = { ...state, version: CONSENT_VERSION, timestamp: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
  // Also store as a cookie so server/middleware can read it (same-site, 6 months)
  const expires = new Date(Date.now() + 182 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; expires=${expires}; path=/; SameSite=Lax`;
}

export function hasConsented(category: ConsentCategory): boolean {
  const c = getConsent();
  if (!c || !c.decided) return category === "necessary";
  if (category === "necessary") return true;
  return c[category] === true;
}

// Dispatch a custom event so third-party script loaders can react to consent.
export function emitConsentEvent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("lofibuddha:consent", { detail: state }));
}
