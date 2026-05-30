"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, Trash2 } from "lucide-react";

export default function HermesPage() {
  const [messages, setMessages] = useState<Array<{role:string;content:string;timestamp:number}>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/hermes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages.slice(-10) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || "🧘 Stilte...",
        timestamp: Date.now()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Verbinding verbroken.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 140px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(180,128,80,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={22} color="#c49464" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e8e4df", margin: 0 }}>Hermes AI</h1>
            <p style={{ fontSize: 12, color: "#928b84", margin: 0 }}>Powered by DeepSeek · Bodhi zen mode</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} style={{ padding: 8, borderRadius: 12, border: "none", background: "transparent", color: "#928b84", cursor: "pointer" }}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="glass rounded-2xl p-5 mb-4 overflow-y-auto border border-border-glow" style={{ height: "calc(100vh - 340px)" }}>
        {messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(180,128,80,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Bot size={28} color="#c49464" />
            </div>
            <p style={{ color: "#c4bfb8", fontSize: 14, margin: "0 0 4px" }}>Welcome to Bodhi Hermes</p>
            <p style={{ color: "#928b84", fontSize: 12, margin: "0 0 24px" }}>Your AI assistant for lofibuddha.com</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 320 }}>
              {["Write a zen quote", "5-minute meditation script", "Lofi video caption ideas", "YouTube Shorts hooks"].map(text => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setInput(text)}
                  style={{
                    fontSize: 12, color: "#928b84", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
                    padding: "10px 12px", textAlign: "left", cursor: "pointer"
                  }}
                >{text}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 12, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(180,128,80,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={14} color="#c49464" />
                  </div>
                )}
                <div style={{
                  maxWidth: "80%", borderRadius: 16,
                  padding: "12px 16px", fontSize: 14, lineHeight: 1.5,
                  background: msg.role === "user" ? "rgba(180,128,80,0.15)" : "rgba(255,255,255,0.04)",
                  color: "#e8e4df"
                }}>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                  <span style={{ fontSize: 10, color: "#928b84", display: "block", marginTop: 4 }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {msg.role === "user" && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={14} color="#928b84" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(180,128,80,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={14} color="#c49464" />
                </div>
                <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 16 }}>
                  <Loader2 size={18} color="#c49464" className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-border-glow">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask Hermes anything..."
          disabled={loading}
          className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-accent text-bg-primary hover:bg-accent-light transition-all disabled:opacity-40 cursor-pointer"
        >
          <Send size={16} />
        </button>
      </div>

      <p style={{ fontSize: 12, color: "#928b84", textAlign: "center", marginTop: 12 }}>
        Join our community · lofibuddha.com
      </p>
    </div>
  );
}
