"use client";

import { useState, useEffect } from "react";
import {
  Key, Palette, Bell, Shield, Globe, Save,
  Sun, Moon, Monitor, CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accent, setAccent] = useState("sienna");
  const [apiKeys, setApiKeys] = useState({
    deepseek: "",
    gemini: "",
    openai: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bodhi-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.accent) setAccent(parsed.accent);
        if (parsed.apiKeys) setApiKeys(parsed.apiKeys);
      } catch {}
    }
  }, []);

  const handleSave = () => {
    const settings = { theme, accent, apiKeys };
    localStorage.setItem("bodhi-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themes: { key: "dark" | "light" | "system"; icon: typeof Moon; label: string }[] = [
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "light", icon: Sun, label: "Light" },
    { key: "system", icon: Monitor, label: "System" },
  ];

  const accents = [
    { key: "sienna", name: "Sienna", color: "#c49464" },
    { key: "amber", name: "Amber", color: "#d4b48a" },
    { key: "sage", name: "Sage", color: "#7a9a6a" },
    { key: "rose", name: "Rose", color: "#b06050" },
    { key: "ocean", name: "Ocean", color: "#5a8a9a" },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">
          Customize your Bodhi Hermes OS experience.
        </p>
      </div>

      {/* ── Theme ── */}
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

        {/* Theme toggle */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">Theme</label>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  theme === t.key
                    ? "border-accent bg-accent/10 text-accent-light"
                    : "border-border bg-bg-hover text-text-muted hover:border-accent/30"
                }`}
              >
                <t.icon size={18} className="mx-auto mb-1" />
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">Accent Color</label>
          <div className="flex gap-2 flex-wrap">
            {accents.map((a) => (
              <button
                key={a.key}
                onClick={() => setAccent(a.key)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                  accent === a.key
                    ? "border-accent bg-accent/10 text-accent-light"
                    : "border-border bg-bg-hover text-text-muted hover:border-accent/30"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: a.color }}
                />
                {a.name}
              </button>
            ))}
          </div>
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
            <p className="text-xs text-text-muted">
              Stored locally in your browser — never sent to our servers.
            </p>
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

      {/* ── Save ── */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn-zen flex items-center gap-2 px-6 py-2.5">
          <Save size={16} />
          Save Settings
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 size={16} />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}
