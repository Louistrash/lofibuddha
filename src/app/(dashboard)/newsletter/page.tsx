"use client";

import { useState, useEffect } from "react";
import { Send, Mail, Users, Loader2, Edit3 } from "lucide-react";
import { Button, Card, PageHeader, Spinner } from "@/components/ui";

interface Subscriber { email: string; language: string; subscribedAt: string; status: string; }
interface Newsletter { id: string; subject: string; language: string; status: string; issueNumber: number; subscriberCount: number; sentAt: string | null; }

const LANGS = ["en", "nl", "es", "de", "fr", "hi"] as const;
const FLAGS: Record<string, string> = { en: "🇬🇧", nl: "🇳🇱", es: "🇪🇸", de: "🇩🇪", fr: "🇫🇷", hi: "🇮🇳" };

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [composeLang, setComposeLang] = useState("en");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ sent?: number; failed?: number; total?: number; error?: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/subscribers").then((r) => r.json()),
      fetch("/api/newsletter").then((r) => r.json()),
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
        setNewsletters((prev) => [data.issue, ...prev]);
        setSubject("");
        setContent("");
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleSend = async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletters((prev) => prev.map((n) => n.id === id ? { ...n, status: "sent", sentAt: new Date().toISOString(), subscriberCount: data.total } : n));
        setSendResult({ sent: data.sent, failed: data.failed, total: data.total });
      } else {
        setSendResult({ error: data.error || "Send failed" });
      }
    } catch (e: unknown) {
      setSendResult({ error: e instanceof Error ? e.message : "Send failed" });
    }
    setSendingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Newsletter"
        description={`"A letter of calm, once a week" — manage subscribers and compose issues in ${LANGS.length} languages.`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {LANGS.map((l) => (
          <Card key={l} className="p-3 text-center">
            <span className="text-lg">{FLAGS[l]}</span>
            <p className="text-2xl font-bold text-text-primary mt-1">{stats[l] || 0}</p>
            <p className="text-[10px] text-text-muted">subscribers</p>
          </Card>
        ))}
      </div>

      {sendResult && (
        <Card className={`p-3 text-sm ${sendResult.error ? "border-error/30 text-error" : "border-success/30 text-success"}`}>
          {sendResult.error
            ? sendResult.error
            : `Sent to ${sendResult.sent}/${sendResult.total} subscribers${sendResult.failed ? ` (${sendResult.failed} failed)` : ""}`}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Compose</h2>
          </div>

          <select
            value={composeLang}
            onChange={(e) => setComposeLang(e.target.value)}
            className="w-full bg-bg-hover border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/50"
          >
            {LANGS.map((l) => <option key={l} value={l}>{FLAGS[l]} {l.toUpperCase()}</option>)}
          </select>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line..."
            className="w-full bg-bg-hover border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent/50"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write your newsletter content... Markdown supported."
            className="w-full bg-bg-hover border border-border rounded-[var(--radius)] p-3 text-sm text-text-primary outline-none resize-none placeholder:text-text-muted focus:border-accent/50"
          />

          <Button
            onClick={handleSave}
            disabled={saving || !subject || !content}
            fullWidth
            icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          >
            Save Draft
          </Button>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={18} className="text-accent-light" />
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Issues</h2>
              <span className="text-[10px] text-text-muted">{newsletters.length}</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {newsletters.length === 0 ? (
                <p className="text-xs text-text-muted py-4 text-center">No issues yet. Compose your first newsletter!</p>
              ) : newsletters.map((nl) => (
                <div key={nl.id} className="flex items-center gap-3 p-3 rounded-[var(--radius)] border border-border bg-bg-hover/50">
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
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => handleSend(nl.id)}
                      disabled={sendingId === nl.id}
                      icon={sendingId === nl.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      className="!h-8 !px-2.5"
                    >
                      Send
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
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
          </Card>
        </div>
      </div>
    </div>
  );
}
