"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, Heart } from "lucide-react";

// ─── Language ─────────────────────────────────
type Lang = "en" | "nl" | "es" | "de" | "fr" | "hi";
const LANGS: Lang[] = ["en", "nl", "es", "de", "fr", "hi"];

const detectLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("lofibuddha-lang") as Lang;
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language.toLowerCase().split("-")[0] as Lang;
  return LANGS.includes(browser) ? browser : "en";
};

// ─── Translations ─────────────────────────────
const T = {
  comingSoon: {
    en: "Coming Soon",
    nl: "Binnenkort",
    es: "Próximamente",
    de: "Demnächst",
    fr: "Bientôt",
    hi: "जल्द आ रहा है",
  },
  headline: {
    en: "Something beautiful\nis on its way",
    nl: "Er is iets moois\nonderweg",
    es: "Algo hermoso\nestá en camino",
    de: "Etwas Schönes\nist unterwegs",
    fr: "Quelque chose de beau\narrive",
    hi: "कुछ सुंदर\nआने वाला है",
  },
  subtitle: {
    en: "A new space for lofi music, mindfulness, and slow living. We're carefully crafting an experience worth waiting for.",
    nl: "Een nieuwe plek voor lofi muziek, mindfulness en slow living. We bouwen zorgvuldig aan een ervaring die het wachten waard is.",
    es: "Un nuevo espacio para la música lofi, la atención plena y la vida lenta. Estamos creando cuidadosamente una experiencia que vale la pena esperar.",
    de: "Ein neuer Ort für Lofi-Musik, Achtsamkeit und langsames Leben. Wir gestalten sorgfältig eine Erfahrung, die das Warten lohnt.",
    fr: "Un nouvel espace pour la musique lofi, la pleine conscience et l'art de vivre lentement. Nous préparons soigneusement une expérience qui vaut la peine d'attendre.",
    hi: "लोफाई संगीत, माइंडफुलनेस और धीमे जीवन के लिए एक नया स्थान। हम ध्यानपूर्वक एक ऐसा अनुभव बना रहे हैं जो प्रतीक्षा के योग्य है।",
  },
  newsletterLabel: {
    en: "Be the first to know when we launch",
    nl: "Als eerste weten wanneer we lanceren",
    es: "Sé el primero en saber cuándo lanzamos",
    de: "Erfahre als Erster, wann wir starten",
    fr: "Sois le premier informé du lancement",
    hi: "लॉन्च के बारे में सबसे पहले जानें",
  },
  emailPlaceholder: {
    en: "your@email.com",
    nl: "jouw@email.com",
    es: "tu@email.com",
    de: "deine@email.de",
    fr: "ton@email.fr",
    hi: "आपका@ईमेल.com",
  },
  subscribe: {
    en: "Notify me",
    nl: "Houd me op de hoogte",
    es: "Avísame",
    de: "Benachrichtige mich",
    fr: "Préviens-moi",
    hi: "मुझे सूचित करें",
  },
  subscribed: {
    en: "You're on the list. Thank you.",
    nl: "Je staat op de lijst. Dank je.",
    es: "Estás en la lista. Gracias.",
    de: "Du bist auf der Liste. Danke.",
    fr: "Tu es sur la liste. Merci.",
    hi: "आप सूची में हैं। धन्यवाद।",
  },
  footerTagline: {
    en: "A space for calm in a busy world.",
    nl: "Een plek van rust in een drukke wereld.",
    es: "Un espacio de calma en un mundo ocupado.",
    de: "Ein Ort der Ruhe in einer geschäftigen Welt.",
    fr: "Un espace de calme dans un monde agité.",
    hi: "व्यस्त दुनिया में शांति का एक स्थान।",
  },
};

// ─── Page Component ───────────────────────────
export default function ComingSoonPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setLang(detectLang());
    setMounted(true);
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribed) return;
    try {
      await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: lang }),
      });
    } catch {}
    setSubscribed(true);
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf8f5",
        color: "#1c1917",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "2rem",
      }}
    >
      {/* Background Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "clamp(400px, 60vw, 800px)",
          height: "clamp(400px, 60vw, 800px)",
          borderRadius: "50%",
          filter: "blur(150px)",
          opacity: 0.12,
          background:
            "radial-gradient(circle, rgba(180,130,80,0.5) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "clamp(300px, 50vw, 600px)",
          height: "clamp(300px, 50vw, 600px)",
          borderRadius: "50%",
          filter: "blur(130px)",
          opacity: 0.1,
          background:
            "radial-gradient(circle, rgba(140,180,160,0.5) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Enso Circle */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg
          viewBox="0 0 400 400"
          style={{
            width: "min(500px, 85vw)",
            height: "min(500px, 85vw)",
            opacity: 0.05,
            animation: "ensoRotate 40s linear infinite",
          }}
        >
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="#b08050"
            strokeWidth="0.8"
            strokeDasharray="6 14"
          />
          <circle
            cx="200"
            cy="200"
            r="165"
            fill="none"
            stroke="#b08050"
            strokeWidth="0.4"
            strokeDasharray="2 22"
            opacity="0.5"
          />
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="#b08050"
            strokeWidth="0.3"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: "580px",
          width: "100%",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.65rem",
            marginBottom: "3rem",
          }}
        >
          <img
            src="/lofibuddha.png"
            alt="LofiBuddha"
            style={{ width: "40px", height: "40px", borderRadius: "10px" }}
          />
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.15rem",
              letterSpacing: "0.04em",
              color: "#44403c",
            }}
          >
            LofiBuddha
          </span>
        </div>

        {/* Label */}
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#b08050",
            marginBottom: "2rem",
            fontWeight: 500,
          }}
        >
          {T.comingSoon[lang]}
        </p>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 300,
            lineHeight: 1.15,
            color: "#1c1917",
            marginBottom: "1.75rem",
            whiteSpace: "pre-line",
          }}
        >
          {T.headline[lang]}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.8,
            color: "#78716c",
            fontWeight: 300,
            maxWidth: "440px",
            margin: "0 auto 2.5rem",
          }}
        >
          {T.subtitle[lang]}
        </p>

        {/* Newsletter Form */}
        <form
          onSubmit={handleSubscribe}
          style={{
            display: "flex",
            gap: "0.75rem",
            maxWidth: "420px",
            margin: "0 auto 3rem",
          }}
        >
          <input
            type="email"
            required
            placeholder={T.emailPlaceholder[lang]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribed}
            style={{
              flex: 1,
              padding: "0.85rem 1.25rem",
              borderRadius: "100px",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#fff",
              fontSize: "0.875rem",
              color: "#1c1917",
              outline: "none",
              fontFamily: "'Inter', system-ui, sans-serif",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(180,130,80,0.4)";
              e.target.style.boxShadow = "0 0 0 3px rgba(180,130,80,0.06)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(0,0,0,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={subscribed}
            style={{
              padding: "0.85rem 1.75rem",
              borderRadius: "100px",
              background: subscribed ? "#b08050" : "#1c1917",
              color: "#faf8f5",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 400,
              letterSpacing: "0.02em",
              cursor: subscribed ? "default" : "pointer",
              fontFamily: "'Inter', system-ui, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              transition: "background 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!subscribed) e.currentTarget.style.background = "#292524";
            }}
            onMouseLeave={(e) => {
              if (!subscribed) e.currentTarget.style.background = "#1c1917";
            }}
          >
            {subscribed ? T.subscribed[lang] : T.subscribe[lang]}
            {!subscribed && <Send size={14} />}
          </button>
        </form>

        {/* Social Links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {[
            {
              label: "YouTube",
              href: "https://www.youtube.com/@LoFi_Buddha_Music",
            },
            { label: "TikTok", href: "https://www.tiktok.com/@lofibuddha" },
            {
              label: "Instagram",
              href: "https://www.instagram.com/lofibuddha",
            },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.78rem",
                color: "#a8a29e",
                textDecoration: "none",
                letterSpacing: "0.04em",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#78716c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#a8a29e";
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.05)",
            paddingTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              color: "#a8a29e",
              letterSpacing: "0.03em",
            }}
          >
            {T.footerTagline[lang]}
          </p>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <Link
              href="/legal/privacy"
              style={{
                fontSize: "0.68rem",
                color: "#c4bfb8",
                textDecoration: "none",
              }}
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              style={{
                fontSize: "0.68rem",
                color: "#c4bfb8",
                textDecoration: "none",
              }}
            >
              Terms
            </Link>
            <span style={{ fontSize: "0.68rem", color: "#c4bfb8" }}>
              © {new Date().getFullYear()} LofiBuddha
            </span>
          </div>
        </div>
      </div>

      {/* Enso animation keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes ensoRotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `,
        }}
      />
    </div>
  );
}
