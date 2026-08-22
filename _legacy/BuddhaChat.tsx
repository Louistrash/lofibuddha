"use client";

import { useState, useEffect, useRef } from "react";

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

export default function BuddhaChat() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"onboarding" | "nameInput" | "chatting">("onboarding");
  const [step, setStep] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth").then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setPhase("chatting"); loadMsgs(); }
    });
  }, []);

  // Typewriter
  useEffect(() => {
    if (phase !== "onboarding") return;
    if (step >= WELCOME.length) { setTimeout(() => setPhase("nameInput"), 600); return; }
    const full = WELCOME[step];
    if (charIdx < full.length) { const t = setTimeout(() => setCharIdx(i => i + 1), 25); return () => clearTimeout(t); }
    const t = setTimeout(() => { setStep(s => s + 1); setCharIdx(0); }, 1500);
    return () => clearTimeout(t);
  }, [phase, step, charIdx]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [step, charIdx, messages, phase]);

  async function loadMsgs() { const r = await fetch("/api/chat/history"); if (r.ok) setMessages((await r.json()).messages || []); }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault(); const name = input.trim(); if (!name || loading) return;
    setLoading(true); setInput("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (r.ok) {
      const d = await r.json(); setUser(d.user); setPhase("chatting");
      setMessages([{ id: "n", role: "user", content: name }]);
      try {
        const cr = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: name }) });
        const cd = await cr.json();
        if (cr.ok) setMessages(p => [...p, { id: "a", role: "assistant", content: cd.message, deepLink: cd.deepLink }]);
      } catch {}
    }
    setLoading(false);
  }

  async function sendMsg(text: string) {
    if (loading) return; setLoading(true);
    setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: text }]);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const d = await r.json();
      if (r.ok) setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: d.message, deepLink: d.deepLink }]);
    } catch {}
    setLoading(false);
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault(); if (!input.trim() || loading) return;
    const text = input.trim(); setInput(""); setLoading(true);
    setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: text }]);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const d = await r.json();
      if (r.ok) setMessages(p => [...p, { id: Date.now().toString(), role: "assistant", content: d.message, deepLink: d.deepLink }]);
    } catch {}
    setLoading(false);
  }

  function renderAssistantContent(content: string) {
    return content.split("\n").filter(Boolean).map((line, i) => (
      <p key={i}>{line.trim()}</p>
    ));
  }

  // Split assistant message into separate bubbles on ---
  function renderAssistantBubbles(content: string) {
    const parts = content.split("\n---");
    return parts.map((part, i) => {
      const text = part.trim().replace(/^---\s*/, "");
      if (!text) return null;
      return (
        <div key={i} className={i === 0 ? "msg-assistant" : "msg-assistant clickable-bubble"} onClick={i > 0 ? () => sendMsg(text) : undefined}>
          <div className="bubble" style={{ maxWidth: "fit-content" }}>
            <p>{text}</p>
          </div>
        </div>
      );
    });
  }

  return (
    <div className="chat-container">
      {/* Sticky header */}
      <header className="chat-header">
        <img src="/bodhi-icon.png" alt="" className="chat-avatar animate-breathe" />
        <div className="chat-header-text">
          <span className="chat-name">Lofi Buddha</span>
          {phase !== "chatting" && <span className="chat-subtitle">your calm companion</span>}
        </div>
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
                      <p>{line}</p>
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
                          <p>{line}</p>
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

        {/* NAME INPUT */}
        {phase === "nameInput" && (
          <div className="onboarding">
            {WELCOME.map((line, i) => (
              <div key={i} className="msg-assistant">
                <div className="bubble" style={{ maxWidth: line.length > 50 ? "90%" : "fit-content" }}>
                  <p>{line}</p>
                </div>
              </div>
            ))}
            <div className="msg-assistant">
              <div className="bubble"><p>what should i call you?</p></div>
            </div>
          </div>
        )}

        {/* CHAT MESSAGES */}
        {phase === "chatting" && messages.map(msg => (
          <div key={msg.id} className={msg.role === "user" ? "msg-user" : undefined}>
            {msg.role === "assistant"
              ? renderAssistantBubbles(msg.content)
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

        {phase === "chatting" && loading && <ThinkingDots />}

      </main>

      {/* Input area */}
      {(phase === "nameInput" || phase === "chatting") && (
        <div className="chat-input-area">
          {phase === "nameInput" && (
            <form onSubmit={handleNameSubmit}>
              <div className="input-row">
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="your name..." disabled={loading} autoFocus />
                <button type="submit" disabled={!input.trim() || loading}>→</button>
              </div>
            </form>
          )}
          {phase === "chatting" && (
            <form onSubmit={handleSend}>
              <div className="input-row">
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="tell me how you feel..." disabled={loading} />
                <button type="submit" disabled={!input.trim() || loading}>→</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="chat-footer">
        music × focus × calm × visual worlds × ai
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
