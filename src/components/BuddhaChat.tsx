"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_EMAIL = "infoappsnl@gmail.com";

interface User {
  id: string; name?: string; email?: string; tokens: number; plan: string;
  chatCount?: number; isAnonymous?: boolean;
}
interface Message { id: string; role: "user" | "assistant"; content: string; deepLink?: { url: string; label: string } | null; }

const WELCOME = [
  "Namaste \uD83D\uDE4F I'm LoFi Buddha \u2014 your AI-powered calm companion.",
  "I'm here to listen, to guide, and to sit with you in stillness.",
  "A quiet space to breathe, reflect, and reconnect with yourself. \uD83E\uDEB7",
];

// Default tap-able choices when Buddha asks a question without offering any
const FALLBACK_CHOICES = [
  "play some calm sound",
  "show me a scene to picture",
  "guide my breathing",
  "help me focus",
];

// Calm proverbs shared when the action choices appear
const QUOTES = [
  "breathe — you are exactly where you need to be",
  "stillness is not the absence of thought, but the space between them",
  "the quieter you become, the more you can hear",
  "peace comes from within — do not seek it without",
  "this moment is all there is. rest in it",
  "let go of what was, and welcome what is",
  "the mind is like water — still it, and everything becomes clear",
  "you are not your thoughts — you are the one watching them",
];

function pickQuote(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) h = (h * 31 + content.charCodeAt(i)) | 0;
  return QUOTES[Math.abs(h) % QUOTES.length];
}

// Direct path actions: when a choice matches an intent, open the experience instead of chatting
const INTENT_ROUTES: Array<{ match: RegExp; path: string }> = [
  { match: /breathe|breath|inhale|exhale/i, path: "/breathe" },
  { match: /anxious|anxiety|stress|overwhelmed|overwhelm|restless|panic|nervous|busy/i, path: "/breathe" },
  { match: /pomodoro|focus session|focus timer|timer|countdown|25 min|50 min|10 min/i, path: "/focus" },
  { match: /guide me|guided|lead me/i, path: "/mindfulness?meditation=stillness-within" },
  { match: /sleep|tired|insomnia|exhausted|bedtime/i, path: "/sleep" },
  { match: /meditat|relax|unwind|zen|stillness|inner peace/i, path: "/mindfulness?meditation=stillness-within" },
  { match: /focus|concentrate|study|deep work|reading|coding|code/i, path: "/focus" },
  { match: /listen|sound|music|noise|ambient|rain|ocean|forest|nature|fire|waves/i, path: "/mindfulness" },
];

function resolveIntent(text: string): string | null {
  for (const r of INTENT_ROUTES) {
    if (r.match.test(text)) return r.path;
  }
  return null;
}

// Slow typewriter for assistant messages, so the user can read along calmly
function TypingText({ text, speed = 35, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    setCount(0);
    if (!text) { onDoneRef.current?.(); return; }
    let i = 0;
    const t = setInterval(() => {
      i++;
      setCount(i);
      if (i >= text.length) {
        clearInterval(t);
        onDoneRef.current?.();
      }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <>{text.slice(0, count)}</>;
}

// Assistant message: type main text, then a thinking wobble, then reveal quote + choices
function AssistantMessage({ content, onChoice }: { content: string; onChoice: (text: string) => void }) {
  const parts = content.split("\n---");
  const main = parts[0]?.trim();
  let choices = parts.slice(1).map(p => p.trim()).filter(Boolean);
  if (choices.length === 0 && /\?\s*$/.test(main)) {
    choices = FALLBACK_CHOICES;
  }
  const [typed, setTyped] = useState(false);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (!typed || choices.length === 0) return;
    setThinking(true);
    const t = setTimeout(() => setThinking(false), 2000);
    return () => clearTimeout(t);
  }, [typed]);

  return (
    <>
      {main && (
        <div className="msg-assistant">
          <div className="bubble" style={{ maxWidth: "fit-content" }}>
            <p><TypingText text={main} onDone={() => setTyped(true)} /></p>
          </div>
        </div>
      )}
      {typed && thinking && choices.length > 0 && <ThinkingDots />}
      {typed && !thinking && choices.length > 0 && (
        <>
          <div className="choice-grid">
            {choices.map((text, i) => (
              <div key={i} className={`choice-bubble choice-${i % 4}`} onClick={() => onChoice(text)}>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="quote-bubble">
            <span className="quote-mark">🪷</span>
            <p className="quote-text">{pickQuote(content)}</p>
          </div>
        </>
      )}
    </>
  );
}

// Renders a welcome line, wrapping the lotus emoji in a span for sizing
function renderWelcomeText(line: string) {
  const lotus = "\uD83E\uDEB7";
  if (!line.includes(lotus)) return line;
  const idx = line.indexOf(lotus);
  return (
    <>
      {line.slice(0, idx)}
      <span className="welcome-lotus">{lotus}</span>
      {line.slice(idx + lotus.length)}
    </>
  );
}

export default function BuddhaChat() {
  const router = useRouter();
  const { user: fbUser, loading: fbLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"onboarding" | "nameInput" | "chatting">("onboarding");
  const [step, setStep] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [language, setLanguage] = useState<string>("english");
  const [langOpen, setLangOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customLang, setCustomLang] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;
  const isFbUser = !!fbUser;

  // Firebase user herkend → naam automatisch, direct naar chatten met check-in
  useEffect(() => {
    if (!fbLoading && fbUser) {
      const fb = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "friend",
        email: fbUser.email || undefined,
        tokens: 5000,
        plan: fbUser.email === ADMIN_EMAIL ? "admin" : "free",
      };
      setUser(fb);
      setPhase("chatting");
      // Laad eerdere chat én stuur een check-in als terugkerende user
      loadMsgs();
      const timeout = setTimeout(() => {
        // Alleen check-in als er nog geen chat-berichten zijn (nieuwe sessie)
        setMessages(prev => {
          if (prev.length > 0) return prev;
          sendCheckin(fb.name || "");
          return prev;
        });
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [fbUser, fbLoading]);

  // Check-in boodschap bij terugkeer: hoe gaat het, hoe was je slaap?
  async function sendCheckin(name: string) {
    setLoading(true);
    try {
      const r = await chatRequest(`check-in: ${name} opened a new session`);
      const d = await r.json();
      if (r.ok) {
        setMessages(p => [...p, { id: "checkin-" + Date.now(), role: "assistant", content: d.message, deepLink: d.deepLink }]);
      }
    } catch {}
    setLoading(false);
  }

  // Oude sessie-check blijft voor anonieme gebruikers
  useEffect(() => {
    if (fbLoading || fbUser) return;
    fetch("/api/auth").then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setPhase("chatting"); loadMsgs(); }
    });
  }, [fbLoading, fbUser]);

  useEffect(() => {
    const saved = localStorage.getItem("lofibuddha_lang");
    if (saved) {
      const norm = saved === "nl" ? "nederlands" : saved === "en" ? "english" : saved;
      setLanguage(norm);
    }
  }, []);

  function selectLang(lang: string) {
    setLanguage(lang);
    localStorage.setItem("lofibuddha_lang", lang);
    setLangOpen(false);
    setShowCustom(false);
    setCustomLang("");
  }

  function submitCustom(e: React.FormEvent) {
    e.preventDefault();
    const lang = customLang.trim();
    if (lang) selectLang(lang);
  }

  const langLabel = language === "english" ? "EN" : language === "nederlands" ? "NL" : "🌐";

  // Typewriter
  useEffect(() => {
    if (phase !== "onboarding") return;
    if (step >= WELCOME.length) { setTimeout(() => setPhase("nameInput"), 600); return; }
    const full = WELCOME[step];
    if (charIdx < full.length) { const t = setTimeout(() => setCharIdx(i => i + 1), 65); return () => clearTimeout(t); }
    const t = setTimeout(() => { setStep(s => s + 1); setCharIdx(0); }, 1500);
    return () => clearTimeout(t);
  }, [phase, step, charIdx]);

  // Auto-scroll: follow content as it types and reveals (choices, quotes)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollToBottom = () => { el.scrollTop = el.scrollHeight; };
    scrollToBottom();
    const mo = new MutationObserver(scrollToBottom);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);

  async function chatRequest(message: string) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const extra: Record<string, string> = {};
    if (fbUser) {
      headers["x-fb-uid"] = fbUser.uid;
      extra.fbName = fbUser.displayName || fbUser.email?.split("@")[0] || "";
      extra.fbEmail = fbUser.email || "";
    }
    return fetch("/api/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({ message, language, ...extra }),
    });
  }

  async function loadMsgs() { const r = await fetch("/api/chat/history"); if (r.ok) setMessages((await r.json()).messages || []); }

  async function resetChat() {
    // Firebase-user: log uit en ga terug naar onboarding
    if (fbUser) {
      await signOut(auth).catch(() => {});
      setUser(null);
      setMessages([]);
      setInput("");
      setLoading(false);
      setPhase("onboarding");
      setStep(0);
      setCharIdx(0);
      return;
    }
    await fetch("/api/auth", { method: "DELETE" }).catch(() => {});
    setUser(null);
    setMessages([]);
    setInput("");
    setLoading(false);
    setPhase("onboarding");
    setStep(0);
    setCharIdx(0);
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault(); const name = input.trim(); if (!name || loading) return;
    setLoading(true); setInput("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (r.ok) {
      const d = await r.json(); setUser(d.user); setPhase("chatting");
      // Don't show the name as a bubble — Buddha answers with the name instead
      try {
        const cr = await chatRequest(name);
        const cd = await cr.json();
        if (cr.ok) setMessages(p => [...p, { id: "a", role: "assistant", content: cd.message, deepLink: cd.deepLink }]);
      } catch {}
    }
    setLoading(false);
  }

  async function sendMsg(text: string) {
    // Intent choices open the experience directly — no text, no link
    const path = resolveIntent(text);
    if (path) { router.push(path); return; }
    if (loading) return; setLoading(true);
    // Choice clicks: don't echo the answer back, just respond to it
    try {
      const r = await chatRequest(text);
      const d = await r.json();
      if (r.ok) {
        setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: d.message, deepLink: d.deepLink }]);
      } else {
        setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: d.error || "buddha is meditating. please try again." }]);
      }
    } catch {
      setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: "connection lost. please try again." }]);
    }
    setLoading(false);
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault(); if (!input.trim() || loading) return;
    const text = input.trim(); setInput(""); setLoading(true);
    setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: text }]);
    try {
      const r = await chatRequest(text);
      const d = await r.json();
      if (r.ok) {
        setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: d.message, deepLink: d.deepLink }]);
      } else {
        setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: d.error || "buddha is meditating. please try again." }]);
      }
    } catch {
      setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: "connection lost. please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="chat-container">
      {/* Sticky header */}
      <header className="chat-header">
        <img src="/bodhi-icon.png" alt="" className="chat-avatar animate-breathe" />
        <div className="chat-header-text">
          <span className="chat-name">
            Lofi Buddha
            {isAdmin && <span className="chat-admin-badge" title="Admin">admin</span>}
            {isFbUser && !isAdmin && <span className="chat-member-badge" title="Member">member</span>}
          </span>
          {phase === "chatting" && user ? (
            <span className="chat-subtitle">welkom terug, {user.name} 🙏</span>
          ) : (
            <span className="chat-subtitle">your calm companion</span>
          )}
        </div>
        <div className="chat-lang-wrap">
          <button
            className="chat-lang"
            onClick={() => setLangOpen(o => !o)}
            title="Language"
            aria-label="switch language"
          >
            {langLabel}
          </button>
          {langOpen && (
            <div className="chat-lang-menu">
              <button className={language === "english" ? "chat-lang-item-active" : ""} onClick={() => selectLang("english")}>English</button>
              <button className={language === "nederlands" ? "chat-lang-item-active" : ""} onClick={() => selectLang("nederlands")}>Nederlands</button>
              <button className={showCustom ? "chat-lang-item-active" : ""} onClick={() => setShowCustom(true)}>Anders…</button>
              {showCustom && (
                <form className="chat-lang-custom" onSubmit={submitCustom}>
                  <input
                    value={customLang}
                    onChange={e => setCustomLang(e.target.value)}
                    placeholder="jouw taal (bv. français)"
                    autoFocus
                  />
                  <button type="submit" aria-label="save">✓</button>
                </form>
              )}
            </div>
          )}
        </div>
        <button className="chat-refresh" onClick={resetChat} title="restart" aria-label="restart">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </header>

      {/* Scrollable area */}
      <main className="chat-scroll" ref={scrollRef}>

        {/* ONBOARDING */}
        {phase === "onboarding" && (
          <div className="onboarding">
            {WELCOME.map((line, i) => {
              if (i > step) return null;
              const isCurrent = i === step;
              const stillTyping = isCurrent && charIdx < line.length;
              const text = isCurrent ? line.slice(0, charIdx) + (stillTyping ? "|" : "") : line;

              // Already fully typed messages render as normal
              if (!isCurrent) {
                return (
                  <div key={i} className="msg-assistant">
                    <div className="bubble" style={{ maxWidth: line.length > 50 ? "90%" : "fit-content" }}>
                      <p>{renderWelcomeText(line)}</p>
                    </div>
                  </div>
                );
              }

              // Current message: show typing, then dots when done
              return (
                <div key={i}>
                  {stillTyping ? (
                    <div className="msg-assistant">
                      <div className="bubble" style={{ maxWidth: line.length > 50 ? "90%" : "fit-content" }}>
                        <p>{text}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="msg-assistant">
                        <div className="bubble" style={{ maxWidth: line.length > 50 ? "90%" : "fit-content" }}>
                          <p>{renderWelcomeText(line)}</p>
                        </div>
                      </div>
                      <ThinkingDots />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NAME INPUT — welcome messages stay, name question fades in */}
        {phase === "nameInput" && (
          <div className="onboarding">
            {WELCOME.map((line, i) => (
              <div key={i} className="msg-assistant">
                <div className="bubble" style={{ maxWidth: line.length > 50 ? "90%" : "fit-content" }}>
                  <p>{renderWelcomeText(line)}</p>
                </div>
              </div>
            ))}
            <div className="msg-assistant question-bubble animate-fade-in">
              <div className="bubble"><p>what should i call you?</p></div>
            </div>
          </div>
        )}

        {/* CHATTING — welcome messages persist, conversation flows below */}
        {phase === "chatting" && (
          <div className="onboarding">
            {WELCOME.map((line, i) => (
              <div key={i} className="msg-assistant">
                <div className="bubble" style={{ maxWidth: line.length > 50 ? "90%" : "fit-content" }}>
                  <p>{renderWelcomeText(line)}</p>
                </div>
              </div>
            ))}

            {messages.map(msg => (
              <div key={msg.id} className={`${msg.role === "user" ? "msg-user" : undefined} animate-fade-in`}>
                {msg.role === "assistant"
                  ? <AssistantMessage content={msg.content} onChoice={sendMsg} />
                  : <div className="bubble"><p>{msg.content}</p></div>
                }
                {msg.role === "assistant" && msg.deepLink && (
                  <a href={msg.deepLink.url} className="deep-link">
                    <span>{msg.deepLink.label}</span>
                    <span className="deep-link-arrow">→</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {phase === "chatting" && loading && <ThinkingDots />}

      </main>

      {/* Input area — single unified input, smooth phase change */}
      {(phase === "nameInput" || phase === "chatting") && (
        <div className="chat-input-area">
          <form onSubmit={phase === "nameInput" ? handleNameSubmit : handleSend}>
            <div className={`input-row ${phase === "nameInput" ? "input-row-name" : ""}`}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (phase === "nameInput") handleNameSubmit(e);
                    else handleSend(e);
                  }
                }}
                placeholder={phase === "nameInput" ? "your name..." : "tell me how you feel..."}
                disabled={loading}
                autoFocus={phase === "nameInput"}
                enterKeyHint="go"
              />
              <button type="submit" disabled={!input.trim() || loading}>→</button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="chat-footer">
        <span className="chat-footer-tag">music × focus × calm × visual worlds × ai</span>
        <nav className="chat-footer-links">
          <Link href="/mindfulness">mindfulness</Link>
          <Link href="/legal/privacy">privacy</Link>
          <Link href="/legal/terms">terms</Link>
          <Link href="/legal/disclaimer">disclaimer</Link>
        </nav>
      </footer>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="thinking-dots">
      <span /><span /><span />
    </div>
  );
}
