"use client";

import { useState, useEffect } from "react";

const LANGS = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
] as const;

export default function LangToggle() {
  const [lang, setLang] = useState("en");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bodhi-lang");
    if (stored && LANGS.some((l) => l.code === stored)) {
      setLang(stored);
    }
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".lang-select")) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const changeLang = (code: string) => {
    setLang(code);
    localStorage.setItem("bodhi-lang", code);
    setOpen(false);
    if (typeof window !== "undefined" && (window as any).bodhiSetLang) {
      (window as any).bodhiSetLang(code);
    } else {
      window.location.reload();
    }
  };

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div className="lang-select" style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          padding: "0.4rem 0.6rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#78716c",
          fontSize: "0.75rem",
          fontFamily: '"Inter", sans-serif',
          borderRadius: 6,
        }}
      >
        <span>
          {current.flag} {current.code.toUpperCase()}
        </span>
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
            padding: "0.4rem",
            minWidth: 140,
            display: "flex",
            flexDirection: "column",
            zIndex: 200,
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                border: "none",
                background: l.code === lang ? "#f5f0e8" : "none",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: l.code === lang ? "#1c1917" : "#78716c",
                fontFamily: '"Inter", sans-serif',
                borderRadius: 8,
                width: "100%",
                textAlign: "left",
                fontWeight: l.code === lang ? 500 : 300,
              }}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
