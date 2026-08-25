"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
}

/** macOS-stijl segmented control: glazen track, sliding thumb, actieve staat met inner shadow. */
export default function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const layoutId = options.map((o) => o.value).join("-");
  return (
    <div className="inline-flex rounded-full bg-bg-elevated border border-border p-1 backdrop-blur-xl">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-[var(--duration-fast)] ${
              active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${layoutId}`}
                className="absolute inset-0 rounded-full bg-bg-card shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
