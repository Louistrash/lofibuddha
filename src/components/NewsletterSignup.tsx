"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterSignup({ label }: { label?: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || done) return;
    try {
      await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setDone(true);
  }

  return (
    <form onSubmit={submit} className="mt-4 flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={done}
        className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors"
        style={{ background: done ? "#7a9a6a" : "#E4B872", color: "#1a1308" }}
      >
        {done ? "✓" : <Send size={14} />} {done ? "Thanks" : label || "Notify me"}
      </button>
    </form>
  );
}
