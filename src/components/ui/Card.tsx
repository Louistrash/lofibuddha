"use client";

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  /** Subtiele top-lit gradient, zoals Expo Surface. */
  lit?: boolean;
  dashed?: boolean;
  children: ReactNode;
}

/** Card — frosted surface op Zen Night-tokens, optionele lit-gradient. */
export default function Card({
  interactive = false,
  lit = false,
  dashed = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] border bg-bg-card backdrop-blur-xl transition-all duration-[var(--duration-base)] ${
        dashed ? "border-dashed border-2" : "border-border"
      } ${
        interactive
          ? "hover:border-border-strong hover:-translate-y-0.5 cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {lit && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, #191826 0%, #111019 100%)" }}
          aria-hidden
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
