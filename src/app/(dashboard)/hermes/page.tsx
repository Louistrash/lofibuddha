"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, Sparkles, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function HermesPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bodhi-chat");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("bodhi-chat", JSON.stringify(messages.slice(-100)));
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/hermes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages.slice(-10) }),
      });

      const data = await res.json();

      if (data.reply) {
        const aiMsg: Message = { role: "assistant", content: data.reply, timestamp: Date.now() };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errMsg: Message = {
          role: "assistant",
          content: "🧘 *Stilte...* De AI is even in meditatie. Probeer het opnieuw.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch {
      const errMsg: Message = {
        role: "assistant",
        content: "⚠️ Verbinding verbroken. Check of de server online is.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("bodhi-chat");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <Bot size={22} className="text-accent-light" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Hermes AI</h1>
            <p className="text-xs text-text-muted">Powered by DeepSeek · Bodhi zen mode</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-2 rounded-xl hover:bg-bg-hover text-text-muted hover:text-error transition-all"
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 glass rounded-2xl p-5 mb-4 overflow-y-auto space-y-4 border border-border-glow">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
            <Sparkles size={40} className="text-accent-light zen-breath" />
            <div>
              <p className="text-text-secondary text-sm font-medium">Welcome to lofibuddha.com</p>
              <p className="text-text-muted text-xs mt-1">Relax and unwind · Mindfulness and relaxation</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                "Write a zen quote",
                "5-minute meditation script",
                "Lofi video caption ideas",
                "YouTube Shorts hooks",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="text-xs text-text-muted bg-bg-hover hover:bg-bg-card border border-border rounded-xl px-3 py-2 text-left transition-all hover:border-accent/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-accent-light" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent/15 text-text-primary rounded-br-md"
                  : "bg-bg-hover text-text-primary rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[10px] text-text-muted mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} className="text-text-secondary" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={14} className="text-accent-light" />
            </div>
            <div className="bg-bg-hover rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 size={18} className="animate-spin text-accent-light" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-border-glow">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Hermes anything..."
          disabled={loading}
          className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-accent text-bg-primary hover:bg-accent-light transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>

      <p className="text-xs text-text-muted text-center mt-3 zen-breath">
        Join our community · lofibuddha.com
      </p>
    </div>
  );
}
