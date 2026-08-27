/**
 * Design tokens — the single source of truth for both surfaces.
 *
 * The Expo app (React Native) and the Next.js CMS cannot share components:
 * one renders native views, the other DOM. They can, and must, share the
 * palette and typography — otherwise the two drift apart, which is exactly
 * what happened after the Expo rebuild (the CMS kept #0a0a0c/#e0b185/SF Pro
 * while the app moved to #08070C/#E4B872/Manrope).
 *
 * mobile/src/theme/tokens.ts imports these values.
 * The CMS gets them as CSS variables via scripts/build-css-tokens.mjs.
 */

export const palette = {
  ink: "#08070C",
  inkRaised: "#101019",
  inkCard: "#15141F",
  inkHover: "#1C1A28",

  gold: "#E4B872",
  goldBright: "#F3D8A4",
  goldDeep: "#A67C3D",

  saffron: "#FF9A3D",
  jade: "#3ED9A4",
  indigo: "#6C74FF",
  lotus: "#FF5C9B",

  textPrimary: "#F6F2EA",
  textSecondary: "#9E9AAB",
  textMuted: "#63606F",

  danger: "#FF5A4E",
  success: "#39D98A",
} as const;

export const alpha = {
  hairline: "rgba(255,255,255,0.07)",
  hairlineStrong: "rgba(255,255,255,0.14)",
  goldSoft: "rgba(228,184,114,0.14)",
  goldEdge: "rgba(228,184,114,0.32)",
  scrim: "rgba(8,7,12,0.72)",
  /** Glass fills, used for the CMS rail and panels. */
  glass: "rgba(255,255,255,0.045)",
  glassStrong: "rgba(255,255,255,0.075)",
} as const;

/** Per-journey accent. One accent per surface, never mixed. */
export const journeyAccent = {
  focus: palette.saffron,
  breathe: palette.jade,
  sleep: palette.indigo,
  relax: palette.lotus,
} as const;

export const radiusScale = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** 4pt base grid. */
export const spaceScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 56,
  "6xl": 72,
} as const;

export const motion = {
  fast: "150ms",
  base: "220ms",
  slow: "380ms",
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/**
 * Manrope carries the whole system. The CMS loads it as a webfont; the app
 * loads the same family through @expo-google-fonts/manrope.
 */
export const fontFamily = {
  sans: "Manrope",
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
} as const;

/** Flat name -> value map used to emit CSS custom properties. */
export function cssVariables(): Record<string, string> {
  return {
    // Surfaces
    "bg-primary": palette.ink,
    "bg-surface": palette.inkRaised,
    "bg-card": palette.inkCard,
    "bg-hover": palette.inkHover,
    "bg-elevated": alpha.glass,
    "bg-glass": alpha.glass,
    "bg-glass-strong": alpha.glassStrong,

    // Lines
    border: alpha.hairline,
    "border-strong": alpha.hairlineStrong,
    "border-glow": alpha.goldEdge,

    // Text
    "text-primary": palette.textPrimary,
    "text-secondary": palette.textSecondary,
    "text-muted": palette.textMuted,

    // Accent
    accent: palette.gold,
    "accent-light": palette.goldBright,
    "accent-hover": palette.goldBright,
    "accent-deep": palette.goldDeep,
    "accent-glow": alpha.goldSoft,
    "accent-edge": alpha.goldEdge,

    // Journeys
    "journey-focus": journeyAccent.focus,
    "journey-breathe": journeyAccent.breathe,
    "journey-sleep": journeyAccent.sleep,
    "journey-relax": journeyAccent.relax,

    // State
    success: palette.success,
    warning: palette.saffron,
    error: palette.danger,

    // Radius
    radius: `${radiusScale.md}px`,
    "radius-sm": `${radiusScale.sm}px`,
    "radius-lg": `${radiusScale.lg}px`,
    "radius-xl": `${radiusScale.xl}px`,
    "radius-full": "9999px",

    // Spacing (8-pt names kept for backwards compatibility with existing CSS)
    "space-1": `${spaceScale.xs}px`,
    "space-2": `${spaceScale.sm}px`,
    "space-3": `${spaceScale.md}px`,
    "space-4": `${spaceScale.lg}px`,
    "space-5": `${spaceScale["2xl"]}px`,
    "space-6": `${spaceScale["3xl"]}px`,
    "space-7": `${spaceScale["5xl"]}px`,
    "space-8": `${spaceScale["6xl"]}px`,

    // Motion
    "duration-fast": motion.fast,
    "duration-base": motion.base,
    "duration-slow": motion.slow,
    "ease-out": motion.ease,
  };
}
