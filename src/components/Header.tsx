"use client";

import { useState } from "react";
import { Bell, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCmsPageMeta } from "@/lib/cms-nav";

interface HeaderProps {
  onMenuToggle: () => void;
  mobileOpen: boolean;
}

export default function Header({ onMenuToggle, mobileOpen }: HeaderProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const meta = getCmsPageMeta(pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    if (q.includes("video") || q.includes("render")) router.push("/video");
    else if (q.includes("social") || q.includes("post") || q.includes("calendar")) router.push("/social");
    else if (q.includes("content") || q.includes("generate") || q.includes("write")) router.push("/content");
    else if (q.includes("image")) router.push("/images");
    else if (q.includes("setting") || q.includes("theme") || q.includes("api")) router.push("/settings");
    else if (q.includes("analytics") || q.includes("stats")) router.push("/analytics");
    else if (q.includes("studio") || q.includes("podcast")) router.push("/studio");
    else if (q.includes("course")) router.push("/courses");
    else if (q.includes("hermes") || q.includes("chat") || q.includes("ai")) router.push("/hermes");
    else router.push("/content");
  };

  return (
    <header className="h-16 shrink-0 border-b border-border bg-bg-primary/90 backdrop-blur-xl flex items-center justify-between px-3 sm:px-5 sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors flex-shrink-0"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="min-w-0 hidden sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted leading-none mb-0.5">
            CMS
          </p>
          <h1 className="text-sm font-semibold text-text-primary truncate leading-tight">
            {meta.title}
          </h1>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-bg-card border border-border rounded-full px-3.5 py-2 flex-1 max-w-md min-w-0 ml-auto sm:ml-4"
        >
          <Search size={15} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full min-w-0"
          />
        </form>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all"
          aria-label="Notifications"
        >
          <Bell size={17} />
        </button>
        <Link
          href="/settings"
          className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center hover:bg-accent/25 transition-all"
          aria-label="Settings"
        >
          <span className="text-xs font-bold text-accent-light">B</span>
        </Link>
      </div>
    </header>
  );
}
