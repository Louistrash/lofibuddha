"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Moon, Send, Sparkles, LogOut, MessageCircle,
  Clock, Zap, Crown, User,
} from "lucide-react";

// ─── Mock packages (replace with real data from Stripe/Firebase) ──
const USER_PACKAGE = {
  name: "Zen Beginner",
  tokensLeft: 8,
  maxTokens: 10,
  chatModel: "Buddha AI — Free",
};

// ─── AI Buddha responses (mock — connect to real API) ──
const buddhaResponses = [
  "The mind is everything. What you think, you become. Take a deep breath and feel the present moment.",
  "Peace comes from within. Do not seek it without. Close your eyes and listen to the silence between your thoughts.",
  "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go.",
  "You are the sky. Everything else — it's just the weather. Let the clouds pass without attachment.",
  "Every morning we are born again. What we do today is what matters most. Begin with gratitude.",
];

type Message = {
  role: "user" | "buddha";
  text: string;
  time: Date;
};

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "buddha", text: "Welcome, seeker. I am your AI Buddha guide. How can I bring peace to your mind today? 🧘", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [tokens, setTokens] = useState(USER_PACKAGE.tokensLeft);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || tokens <= 0) return;

    const userMsg: Message = { role: "user", text: input.trim(), time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTokens((t) => t - 1);
    setIsTyping(true);

    // Simulate AI Buddha response (replace with real API call)
    setTimeout(() => {
      const reply = buddhaResponses[Math.floor(Math.random() * buddhaResponses.length)];
      setMessages((prev) => [...prev, { role: "buddha", text: reply, time: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: "260px", background: "rgba(15,15,15,0.9)", borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", padding: "24px 16px",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <Moon size={22} color="#d4b48a" strokeWidth={1.5} />
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "18px", color: "#f5ede0" }}>
            LofiBuddha
          </span>
        </div>

        {/* User info */}
        <div style={{
          background: "rgba(196,148,100,0.06)", border: "1px solid rgba(196,148,100,0.1)",
          borderRadius: "14px", padding: "14px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(196,148,100,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color="#d4b48a" />
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#e8e2d8", margin: 0 }}>{user.displayName || "Seeker"}</p>
              <p style={{ fontSize: "11px", color: "#6b655a", margin: 0 }}>{USER_PACKAGE.name}</p>
            </div>
          </div>
          {/* Token bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", color: "#6b655a", display: "flex", alignItems: "center", gap: "4px" }}>
                <Zap size={10} color="#d4b48a" /> Tokens
              </span>
              <span style={{ fontSize: "10px", color: "#8a8278" }}>{tokens}/{USER_PACKAGE.maxTokens}</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(tokens/USER_PACKAGE.maxTokens)*100}%`,
                background: tokens <= 2 ? "linear-gradient(90deg, #b06050, #c08070)" : "linear-gradient(90deg, #c49464, #d4b48a)",
                borderRadius: "2px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        {USER_PACKAGE.name === "Zen Beginner" && (
          <div style={{
            background: "linear-gradient(135deg, rgba(196,148,100,0.08), rgba(180,130,80,0.04))",
            border: "1px solid rgba(196,148,100,0.15)", borderRadius: "14px",
            padding: "14px", marginBottom: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Crown size={14} color="#d4b48a" />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#d4b48a" }}>Upgrade</span>
            </div>
            <p style={{ fontSize: "11px", color: "#7a7468", margin: "0 0 10px", lineHeight: 1.5 }}>
              Unlimited chats, custom meditations, and ad-free experience.
            </p>
            <a href="/signup" style={{
              display: "block", textAlign: "center", fontSize: "11px", fontWeight: 600,
              color: "#0a0a0a", background: "linear-gradient(135deg, #c49464, #b08050)",
              borderRadius: "8px", padding: "8px", textDecoration: "none",
            }}>
              View Plans
            </a>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "transparent", border: "none",
          color: "#6b655a", fontSize: "13px", fontWeight: 500,
          cursor: "pointer", padding: "8px 0", fontFamily: "'Inter', system-ui, sans-serif",
          marginTop: "auto",
        }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* ── Chat Area ── */}
      <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Chat header */}
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px",
          display: "flex", alignItems: "center", gap: "10px", background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)",
        }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(196,148,100,0.2), rgba(180,130,80,0.1))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} color="#d4b48a" />
          </div>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#e8e2d8", margin: 0 }}>AI Buddha</h2>
            <p style={{ fontSize: "11px", color: "#6b655a", margin: 0 }}>{isTyping ? "Typing..." : "Online — ready to guide you"}</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "70%", padding: "14px 18px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(196,148,100,0.15), rgba(180,130,80,0.08))"
                  : "rgba(26,26,24,0.8)",
                border: msg.role === "user" ? "1px solid rgba(196,148,100,0.2)" : "1px solid rgba(255,255,255,0.05)",
              }}>
                <p style={{ fontSize: "14px", color: "#e8e2d8", lineHeight: 1.6, margin: 0 }}>
                  {msg.text}
                </p>
                <span style={{ fontSize: "10px", color: "#4a4540", marginTop: "6px", display: "block" }}>
                  {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", gap: "4px", padding: "12px 18px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d4b48a", animation: "bounce 0.6s infinite alternate" }} />
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d4b48a", animation: "bounce 0.6s 0.2s infinite alternate" }} />
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d4b48a", animation: "bounce 0.6s 0.4s infinite alternate" }} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px" }}>
          {tokens <= 0 && (
            <div style={{ textAlign: "center", marginBottom: "8px", fontSize: "12px", color: "#c08070" }}>
              No tokens left today. <a href="/signup" style={{ color: "#d4b48a" }}>Upgrade for unlimited</a>
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tokens <= 0 ? "Out of tokens for today..." : "Ask the Buddha anything..."}
              disabled={tokens <= 0}
              rows={1}
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px", padding: "14px 18px", color: "#e8e2d8", fontSize: "14px",
                fontFamily: "'Inter', system-ui, sans-serif", outline: "none", resize: "none",
              }}
            />
            <button onClick={handleSend} disabled={tokens <= 0 || !input.trim()} style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: tokens > 0 && input.trim() ? "linear-gradient(135deg, #c49464, #b08050)" : "rgba(255,255,255,0.05)",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: tokens > 0 && input.trim() ? "pointer" : "default",
              transition: "all 0.2s ease", flexShrink: 0,
            }}>
              <Send size={16} color={tokens > 0 && input.trim() ? "#0a0a0a" : "#4a4540"} />
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce { to { transform: translateY(-4px); opacity: 0.4; } }`}</style>
    </div>
  );
}
