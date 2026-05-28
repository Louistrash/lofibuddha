"use client";

import { useState } from "react";
import { Bell, Search, User, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuToggle: () => void;
  mobileOpen: boolean;
}

export default function Header({ onMenuToggle, mobileOpen }: HeaderProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    // Simple navigation based on keywords
    if (q.includes("video") || q.includes("render")) router.push("/video");
    else if (q.includes("social") || q.includes("post") || q.includes("calendar")) router.push("/social");
    else if (q.includes("content") || q.includes("generate") || q.includes("write")) router.push("/content");
    else if (q.includes("image") || q.includes("generate img")) router.push("/images");
    else if (q.includes("setting") || q.includes("theme") || q.includes("api")) router.push("/settings");
    else if (q.includes("analytics") || q.includes("stats")) router.push("/analytics");
    else if (q.includes("studio") || q.includes("podcast")) router.push("/studio");
    else if (q.includes("course")) router.push("/courses");
    else if (q.includes("hermes") || q.includes("chat") || q.includes("ai")) router.push("/hermes");
    else router.push("/content"); // default fallback
  };

  return (
    <header className="h-16 border-b border-border bg-bg-surface/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      {/* Left: hamburger (mobile) + Logo + Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Hamburger — alleen op mobiel */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo — verborgen op hele kleine schermen */}
        <Image
          src="/bodhi-logo.svg"
          alt="Bodhi"
          width={28}
          height={28}
          className="rounded-lg flex-shrink-0 hidden sm:block"
        />

        {/* Search form — compact op mobiel */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-3 py-2 flex-1 max-w-md min-w-0">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full min-w-0"
          />
          <button type="submit" className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-bg-hover text-[10px] text-text-muted font-mono hover:text-text-primary transition-colors flex-shrink-0">
            ⌘K
          </button>
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 sm:gap-3 ml-2 flex-shrink-0">
        <button className="p-2 rounded-xl hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all">
          <Bell size={18} />
        </button>
        <Link
          href="/settings"
          className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-all"
        >
          <User size={16} className="text-accent-light" />
        </Link>
      </div>
    </header>
  );
}
