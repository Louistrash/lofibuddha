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
    <div className="lang-select">
      <button className="lang-select-btn" onClick={() => setOpen(!open)}>
        <span>{current.flag} {current.code.toUpperCase()}</span>
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="lang-select-menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`lang-select-item ${l.code === lang ? "lang-select-item-active" : ""}`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
