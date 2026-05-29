"use client";

import { useState, useEffect } from "react";
import { Send, Mail, Users, Globe, Loader2, Check, Edit3, Clock, Trash2 } from "lucide-react";

interface Subscriber { email: string; language: string; subscribedAt: string; status: string; }
interface Newsletter { id: string; subject: string; language: string; status: string; issueNumber: number; subscriberCount: number; sentAt: string | null; }

const LANGS = ["en", "nl", "es", "de", "fr", "hi"] as const;
const FLAGS: Record<string, string> = { en: "🇬🇧", nl: "🇳🇱", es: "🇪🇸", de: "🇩🇪", fr: "🇫🇷", hi: "🇮🇳" };

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Compose form
  const [composeLang, setComposeLang] = useState("en");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/subscribers").then(r => r.json()),
      fetch("/api/newsletter").then(r => r.json()),
    ]).then(([subData, nlData]) => {
      setSubscribers(subData.subscribers || []);
      setStats(subData.byLanguage || {});
      setNewsletters(nlData.newsletters || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!subject || !content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, language: composeLang }),
      });
      const data = await res.json();
      if (data.issue) {
        setNewsletters(prev => [data.issue, ...prev]);
        setSubject("");
        setContent("");
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleSend = async (id: string) => {
    await fetch("/api/newsletter", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "sent" }),
    });
    setNewsletters(prev => prev.map(n => n.id === id ? { ...n, status: "sent", sentAt: new Date().toISOString() } : n));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-light" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Newsletter</h1>
        <p className="text-text-muted mt-1">"A letter of calm, once a week" — manage subscribers and compose issues in 6 languages.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {LANGS.map(l => (
          <div key={l} className="glass p-3 text-center">
            <span className="text-lg">{FLAGS[l]}</span>
            <p className="text-2xl font-bold text-text-primary mt-1">{stats[l] || 0}</p>
            <p className="text-[10px] text-text-muted">subscribers</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Compose</h2>
          </div>
          
          <select value={composeLang} onChange={e => setComposeLang(e.target.value)}
            className="w-full bg-bg-hover border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            {LANGS.map(l => <option key={l} value={l}>{FLAGS[l]} {l.toUpperCase()}</option>)}
          </select>

          <input
            type="text" value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Subject line..."
            className="w-full bg-bg-hover border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted" />

          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            rows={8}
            placeholder="Write your newsletter content... Markdown supported."
            className="w-full bg-bg-hover border border-border rounded-xl p-3 text-sm text-text-primary outline-none resize-none placeholder:text-text-muted" />

          <button onClick={handleSave} disabled={saving || !subject || !content}
            className="btn-zen flex items-center gap-2 px-4 py-2 text-sm w-full justify-center disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Save Draft
          </button>
        </div>

        {/* Issues & Subscribers */}
        <div className="space-y-4">
          {/* Issues */}
          <div className="glass p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={18} className="text-accent-light" />
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Issues</h2>
              <span className="text-[10px] text-text-muted">{newsletters.length}</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {newsletters.length === 0 ? (
                <p className="text-xs text-text-muted py-4 text-center">No issues yet. Compose your first newsletter!</p>
              ) : newsletters.map(nl => (
                <div key={nl.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg-hover/50">
                  <span className="text-sm">{FLAGS[nl.language]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">#{nl.issueNumber} — {nl.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${nl.status === "sent" ? "bg-success/10 text-success" : "bg-bg-hover text-text-muted"}`}>
                        {nl.status}
                      </span>
                      {nl.sentAt && <span className="text-[10px] text-text-muted">{new Date(nl.sentAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  {nl.status === "draft" && (
                    <button onClick={() => handleSend(nl.id)}
                      className="p-1.5 rounded-lg bg-accent/10 text-accent-light hover:bg-accent/20 text-[10px]">
                      <Send size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent subscribers */}
          <div className="glass p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-accent-light" />
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Subscribers</h2>
              <span className="text-[10px] text-text-muted">{subscribers.length}</span>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {subscribers.slice(0, 10).map((s, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-bg-hover transition-all">
                  <span className="text-xs">{FLAGS[s.language]}</span>
                  <span className="text-xs text-text-secondary truncate flex-1">{s.email}</span>
                  <span className="text-[10px] text-text-muted">{new Date(s.subscribedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
