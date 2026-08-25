"use client";

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

/** Glas-card — frosted glass op de Zen Night-tokens, subtiele hover-lift. */
export default function Card({ interactive = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-border bg-bg-card backdrop-blur-xl transition-all duration-[var(--duration-base)] ${
        interactive ? "hover:border-border-strong hover:-translate-y-0.5 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
