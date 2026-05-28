"use client";

import { Bell, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-16 border-b border-border bg-bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Logo + Search */}
      <div className="flex items-center gap-3">
        <Image
          src="/bodhi-logo.svg"
          alt="Bodhi"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <div className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-4 py-2 w-full max-w-md">
          <Search size={16} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-bg-hover text-[10px] text-text-muted font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
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
