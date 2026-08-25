"use client";

import { Play, Pause } from "lucide-react";

interface PlayButtonProps {
  playing?: boolean;
  size?: number; // diameter in px
  onClick?: () => void;
  className?: string;
}

/** Strakke cirkel-playknop — geen glow, SF-stijl icoon. */
export default function PlayButton({ playing = false, size = 48, onClick, className = "" }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={playing ? "Pause" : "Play"}
      className={`relative rounded-full flex items-center justify-center text-[#0a0a0c] transition-all duration-[var(--duration-fast)] hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size, background: "rgba(255,255,255,0.92)" }}
    >
      {playing ? <Pause size={Math.round(size * 0.4)} /> : <Play size={Math.round(size * 0.4)} style={{ marginLeft: Math.round(size * 0.06) }} />}
    </button>
  );
}
