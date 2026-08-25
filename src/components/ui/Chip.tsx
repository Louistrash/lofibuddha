"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
}

/** Uniforme pill — 1 stijl, 1 lijndikte (vervangt alle losse pill-stijlen). */
export default function Chip({ active = false, icon, className = "", children, ...props }: ChipProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full border text-xs font-medium px-3 py-1.5 transition-all duration-[var(--duration-fast)] ${
        active
          ? "border-accent/60 bg-accent/15 text-text-primary"
          : "border-border bg-bg-elevated text-text-secondary hover:text-text-primary hover:border-border-strong"
      } ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
