"use client";

import type { SceneType } from "@/lib/experiences";

interface SceneProps {
  type: SceneType;
  /** "card" = kleine mini-scene achtergrond, "full" = player achtergrond */
  variant?: "card" | "full";
  /** adem-sync: 0-1 voortgang binnen de huidige ademfase (alleen breathe) */
  breathe?: number;
}

/**
 * Levende scene-visualisatie — CSS-only, geen afbeeldingen.
 * Card variant: subtiele mini-scene achter de kaart.
 * Full variant: schermvullende scene voor de player.
 */
export default function Scene({ type, variant = "card", breathe = 1 }: SceneProps) {
  const cls = `scene scene-${type} scene-${variant}`;

  return (
    <div className={cls} aria-hidden="true">
      {/* ── OCEAN ── */}
      {type === "ocean" && (
        <>
          <div className="scene-sun" />
          <div className="scene-sea">
            <span className="scene-wave" />
            <span className="scene-wave" />
            <span className="scene-wave" />
          </div>
          <div className="scene-glow" />
        </>
      )}

      {/* ── RAIN ── */}
      {type === "rain" && (
        <>
          <div className="scene-sky" />
          <div className="scene-rain">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{ "--x": `${(i * 37) % 100}%`, "--d": `${0.5 + (i % 5) * 0.35}s`, "--delay": `${(i % 7) * 0.4}s` } as React.CSSProperties} />
            ))}
          </div>
          <div className="scene-glow" />
        </>
      )}

      {/* ── NIGHT ── */}
      {type === "night" && (
        <>
          <div className="scene-sky" />
          <div className="scene-moon" />
          <div className="scene-stars">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} style={{ "--x": `${(i * 29) % 100}%`, "--y": `${(i * 17) % 60}%`, "--d": `${(i % 6) * 1.4}s` } as React.CSSProperties} />
            ))}
          </div>
        </>
      )}

      {/* ── NATURE ── */}
      {type === "nature" && (
        <>
          <div className="scene-sky" />
          <div className="scene-grass" />
          <div className="scene-leaves">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ "--x": `${(i * 41) % 100}%`, "--d": `${2 + (i % 4) * 0.8}s`, "--delay": `${(i % 3) * 0.7}s` } as React.CSSProperties} />
            ))}
          </div>
        </>
      )}

      {/* ── TEMPLE ── */}
      {type === "temple" && (
        <>
          <div className="scene-sky" />
          <div className="scene-bell" />
          <div className="scene-dust">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ "--angle": `${i * 45}deg`, "--delay": `${(i % 4) * 1.2}s` } as React.CSSProperties} />
            ))}
          </div>
        </>
      )}

      {/* ── BREATHE ── */}
      {type === "breathe" && (
        <div className="scene-breathe">
          <div
            className="scene-breathe-core"
            style={variant === "full" ? { transform: `scale(${0.7 + breathe * 0.9})` } : undefined}
          >
            <span className="scene-breathe-ring" />
            <span className="scene-breathe-ring" />
            <span className="scene-breathe-ring" />
          </div>
        </div>
      )}

      {/* ── FOCUS ── */}
      {type === "focus" && (
        <>
          <div className="scene-sky" />
          <div className="scene-focus-ring">
            <span className="scene-focus-core" />
            <span className="scene-focus-beam" />
          </div>
        </>
      )}
    </div>
  );
}
