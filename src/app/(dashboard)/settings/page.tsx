"use client";

import { useState, useEffect } from "react";
import {
  Key, Palette, Bell, Shield, Globe, Save, Music2,
  Sun, Moon, Monitor, CheckCircle2, Loader2,
} from "lucide-react";

// ── Accent color definitions ──

const accentMap: Record<string, { primary: string; light: string; glow: string }> = {
  sienna: { primary: "#c49464", light: "#d4b48a", glow: "rgba(196,148,100,0.15)" },
  amber:  { primary: "#d4b48a", light: "#e0c9a0", glow: "rgba(212,180,138,0.15)" },
  sage:   { primary: "#7a9a6a", light: "#8fae7e", glow: "rgba(122,154,106,0.15)" },
  rose:   { primary: "#b06050", light: "#c47868", glow: "rgba(176,96,80,0.15)" },
  ocean:  { primary: "#5a8a9a", light: "#6e9eae", glow: "rgba(90,138,154,0.15)" },
  plum:   { primary: "#9a6aaa", light: "#ae7ebe", glow: "rgba(154,106,170,0.15)" },
};

// ── Apply settings to DOM ──

function applyTheme(theme: "dark" | "light" | "system") {
  const html = document.documentElement;
  if (theme === "light") {
    html.classList.remove("dark");
    html.style.colorScheme = "light";
  } else if (theme === "dark") {
    html.classList.add("dark");
    html.style.colorScheme = "dark";
  } else {
    // System
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
  }
}

function applyAccent(key: string) {
  const colors = accentMap[key] || accentMap.sienna;
  const root = document.documentElement;
  root.style.setProperty("--accent", colors.primary);
  root.style.setProperty("--accent-light", colors.light);
  root.style.setProperty("--accent-glow", colors.glow);
}

// ── Load saved settings ──

const DEFAULT_SETTINGS = { theme: "dark" as const, accent: "sienna", apiKeys: { deepseek: "", gemini: "", openai: "" } };

function loadSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS, apiKeys: { ...DEFAULT_SETTINGS.apiKeys } };
  try {
    const saved = localStorage.getItem("bodhi-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults — handles missing fields from old localStorage formats
      return {
        theme: parsed.theme || DEFAULT_SETTINGS.theme,
        accent: parsed.accent || DEFAULT_SETTINGS.accent,
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...(parsed.apiKeys || {}) },
      };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS, apiKeys: { ...DEFAULT_SETTINGS.apiKeys } };
}

// ── Component ──

export default function SettingsPage() {
  const [initialized, setInitialized] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accent, setAccent] = useState("sienna");
  const [apiKeys, setApiKeys] = useState({ deepseek: "", gemini: "", openai: "" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load on mount
  useEffect(() => {
    try {
      const settings = loadSettings();
      setTheme(settings.theme);
      setAccent(settings.accent);
      setApiKeys(settings.apiKeys);
      applyTheme(settings.theme);
      applyAccent(settings.accent);
    } catch (err) {
      // Corrupt settings — reset to defaults
      console.warn("Settings load failed, resetting:", err);
      localStorage.removeItem("bodhi-settings");
      setTheme("dark");
      setAccent("sienna");
      setApiKeys({ deepseek: "", gemini: "", openai: "" });
    }
    setInitialized(true);
  }, []);

  // Apply theme changes immediately
  const handleThemeChange = (t: "dark" | "light" | "system") => {
    setTheme(t);
    applyTheme(t);
  };

  // Apply accent changes immediately
  const handleAccentChange = (a: string) => {
    setAccent(a);
    applyAccent(a);
  };

  // Save all settings
  const handleSave = () => {
    setSaving(true);
    const settings = { theme, accent, apiKeys };
    localStorage.setItem("bodhi-settings", JSON.stringify(settings));
    applyTheme(theme);
    applyAccent(accent);

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 400);
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-accent-light" />
      </div>
    );
  }

  const themes: { key: "dark" | "light" | "system"; icon: typeof Moon; label: string }[] = [
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "light", icon: Sun, label: "Light" },
    { key: "system", icon: Monitor, label: "System" },
  ];

  const accents = Object.entries(accentMap).map(([key, val]) => ({
    key, name: key.charAt(0).toUpperCase() + key.slice(1), color: val.primary,
  }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">Customize your Bodhi Hermes OS experience.</p>
      </div>

      {/* ── Appearance ── */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center">
            <Palette size={20} className="text-text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Appearance</h3>
            <p className="text-xs text-text-muted">Choose your theme and accent color.</p>
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">Theme</label>
          <div className="flex gap-2">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => handleThemeChange(t.key)}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                    theme === t.key
                      ? "border-accent bg-accent/10 text-accent-light"
                      : "border-border bg-bg-hover text-text-muted hover:border-accent/30"
                  }`}>
                  <Icon size={18} className="mx-auto mb-1" />
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">Accent Color</label>
          <div className="flex gap-2 flex-wrap">
            {accents.map((a) => (
              <button key={a.key} onClick={() => handleAccentChange(a.key)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                  accent === a.key
                    ? "border-accent bg-accent/10 text-accent-light"
                    : "border-border bg-bg-hover text-text-muted hover:border-accent/30"
                }`}>
                <span className="w-3.5 h-3.5 rounded-full inline-block ring-2 ring-offset-1 ring-offset-bg-hover transition-all"
                  style={{ backgroundColor: a.color, "--tw-ring-color": a.color } as any} />
                {a.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-bg-hover rounded-xl p-4 flex items-center gap-3">
          <span className="text-xs text-text-muted">Preview:</span>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-md" style={{ backgroundColor: "var(--accent)" }} />
            <div className="w-6 h-6 rounded-md" style={{ backgroundColor: "var(--accent-light)" }} />
            <div className="w-6 h-6 rounded-md border" style={{ borderColor: "var(--accent)" }} />
          </div>
          <code className="text-[10px] text-accent-light ml-auto">{accent}</code>
        </div>
      </div>

      {/* ── API Keys ── */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center">
            <Key size={20} className="text-text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">API Keys</h3>
            <p className="text-xs text-text-muted">Stored locally in your browser — never sent to our servers.</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: "deepseek", label: "DeepSeek API Key", hint: "Content generation" },
            { key: "gemini", label: "Gemini API Key", hint: "Vision & fallback" },
            { key: "openai", label: "OpenAI API Key", hint: "Optional backup" },
          ].map((api) => (
            <div key={api.key}>
              <label className="text-xs text-text-muted mb-1 block">
                {api.label} <span className="opacity-50">· {api.hint}</span>
              </label>
              <input
                type="password"
                value={(apiKeys as any)[api.key]}
                onChange={(e) => setApiKeys({ ...apiKeys, [api.key]: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-bg-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono placeholder:text-text-muted outline-none focus:border-accent/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── TikTok API ── */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center">
            <Music2 size={20} className="text-pink-400" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">TikTok Integration</h3>
            <p className="text-xs text-text-muted">Connect your TikTok account via OAuth. <a href="https://developers.tiktok.com/apps/" target="_blank" rel="noopener" className="text-accent-light hover:underline">Get keys →</a></p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Client Key</label>
            <input
              type="text"
              defaultValue=""
              placeholder="awb..."
              onChange={(e) => { /* set via ENV */ }}
              className="w-full bg-bg-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono placeholder:text-text-muted outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Client Secret</label>
            <input
              type="password"
              defaultValue=""
              placeholder="••••••••"
              onChange={(e) => { /* set via ENV */ }}
              className="w-full bg-bg-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono placeholder:text-text-muted outline-none focus:border-accent/50"
            />
          </div>
        </div>
        <p className="text-[10px] text-text-muted bg-bg-hover rounded-lg p-3 leading-relaxed">
          🔐 Set these in <code className="text-accent-light">.env.local</code> or the container environment variables. Then restart the server. These keys enable automatic TikTok posting.
        </p>
      </div>

      {/* ── Notifications ── */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center">
            <Bell size={20} className="text-text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Notifications</h3>
            <p className="text-xs text-text-muted">Manage your notification preferences.</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "Video render complete", checked: true },
            { label: "New content generated", checked: true },
            { label: "Weekly analytics report", checked: false },
            { label: "Community updates", checked: false },
          ].map((n) => (
            <label key={n.label} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg-hover cursor-pointer transition-all">
              <input type="checkbox" defaultChecked={n.checked}
                className="w-4 h-4 rounded accent-accent bg-bg-hover border-border" />
              <span className="text-sm text-text-secondary">{n.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Save ── */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving}
          className="btn-zen flex items-center gap-2 px-6 py-2.5 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success animate-in fade-in">
            <CheckCircle2 size={16} /> Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}
