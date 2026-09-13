"use client";

interface SpinnerProps {
  size?: number;
  className?: string;
}

/** Loading spinner — gebruikt design tokens i.p.v. hardcoded kleuren. */
export default function Spinner({ size = 24, className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-2 border-accent/15 border-t-accent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
