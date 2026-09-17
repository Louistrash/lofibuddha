"use client";

import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Settings } from "lucide-react";
import { CMS_NAV, isNavActive } from "@/lib/cms-nav";

export default function CmsTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

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

  const settingsActive = isNavActive(pathname, "/settings");

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-bg-primary/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-5 py-3 sm:px-6 lg:px-8">
        <Link href="/content" className="flex min-w-0 shrink-0 items-center gap-3 group">
          <NextImage
            src="/icon-transparent.png"
            alt="LofiBuddha"
            width={36}
            height={36}
            className="rounded-xl ring-1 ring-border/70 transition-all group-hover:ring-accent/35"
          />
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-bold tracking-tight text-text-primary">LofiBuddha</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">CMS</p>
          </div>
        </Link>

        <form
          onSubmit={handleSearch}
          className="ml-auto flex min-w-0 flex-1 max-w-md items-center gap-2 rounded-full border border-border bg-bg-card/80 px-3.5 py-2"
        >
          <Search size={15} className="shrink-0 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full min-w-0 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </form>

        <Link
          href="/settings"
          aria-label="Settings"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
            settingsActive
              ? "border-accent/40 bg-accent/15 text-accent-light"
              : "border-border bg-bg-card/80 text-text-secondary hover:border-accent/25 hover:text-text-primary"
          }`}
        >
          <Settings size={16} />
        </Link>
      </div>

      <div
        className="mx-auto flex max-w-[1180px] gap-1.5 overflow-x-auto px-5 pb-3 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CMS_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-all duration-200 ${
                active
                  ? "bg-accent/12 text-accent-light"
                  : "text-text-secondary hover:bg-bg-hover/80 hover:text-text-primary"
              }`}
            >
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent" aria-hidden />
              )}
              <Icon size={15} className={active ? "text-accent" : "text-text-muted"} />
              <span className={`whitespace-nowrap ${active ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-light">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
