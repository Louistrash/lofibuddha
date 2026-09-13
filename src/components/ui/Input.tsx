"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

/** Tekstveld met optioneel icoon — matcht Expo-formulierstijl. */
export default function Input({ icon, className = "", ...props }: InputProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-[var(--radius)] border border-border bg-bg-elevated px-4 py-3 transition-colors focus-within:border-border-strong focus-within:ring-1 focus-within:ring-accent/20">
      {icon && <span className="text-text-muted flex-shrink-0">{icon}</span>}
      <input
        className={`flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted ${className}`}
        {...props}
      />
    </div>
  );
}
