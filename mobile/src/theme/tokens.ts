/**
 * Bodhi design system — the Expo app face of the shared tokens.
 *
 * Two faces, one language:
 *  - phone: iOS-native feel (grouped surfaces, blur chrome, large titles)
 *  - desktop/tablet: calm dashboard (persistent sidebar, wide content grid)
 *
 * The palette lives in packages/shared/src/design-tokens.ts so the app and the
 * Next.js CMS read the exact same values; everything below derives from it.
 */

import { palette } from "@lofibuddha/shared";

export { palette };

export const colors = {
  ...palette,

  bg: palette.ink,
  bgElevated: palette.inkRaised,
  card: palette.inkCard,
  cardHover: palette.inkHover,

  hairline: "rgba(255,255,255,0.07)",
  hairlineStrong: "rgba(255,255,255,0.14)",
  goldSoft: "rgba(228,184,114,0.14)",
  goldEdge: "rgba(228,184,114,0.32)",

  text: palette.textPrimary,
  textSecondary: palette.textSecondary,
  textMuted: palette.textMuted,

  scrim: "rgba(8,7,12,0.72)",
} as const;

/** Per-journey accent. Used sparingly: one accent per surface, never mixed. */
export const accentByCategory = {
  focus: palette.saffron,
  breathe: palette.jade,
  sleep: palette.indigo,
  relax: palette.lotus,
} as const;

export type CategoryKey = keyof typeof accentByCategory;

export const gradients = {
  page: [palette.ink, "#0B0A12", "#0E0D17"] as [string, string, string],
  card: ["#191826", "#111019"] as [string, string],
  gold: ["#F3D8A4", "#E4B872"] as [string, string],
  veil: ["transparent", "rgba(8,7,12,0.55)", palette.ink] as [string, string, string],
};

/** Translucent tint per accent, for glows and selected states. */
export function tint(hex: string, alpha: number) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** 4pt base grid. */
export const space = {
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

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Manrope carries the whole system: geometric, calm, and legible at every size. */
export const font = {
  display: "Manrope_800ExtraBold",
  bold: "Manrope_700Bold",
  semibold: "Manrope_600SemiBold",
  medium: "Manrope_500Medium",
  regular: "Manrope_400Regular",
} as const;

/** Display sizes need negative tracking; small sizes need a little air. */
export const type = {
  hero: { fontFamily: font.display, fontSize: 40, lineHeight: 46, letterSpacing: -1.2 },
  largeTitle: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.9 },
  title: { fontFamily: font.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
  section: { fontFamily: font.bold, fontSize: 19, lineHeight: 24, letterSpacing: -0.35 },
  headline: { fontFamily: font.semibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: font.regular, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: font.medium, fontSize: 13, lineHeight: 17 },
  caption: { fontFamily: font.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.7 },
  devanagari: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, letterSpacing: 1.5 },
} as const;

/** Soft, wide shadows only — never harsh drop shadows. */
export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  float: {
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

export const layout = {
  /** Content never stretches past this on wide screens. */
  maxContentWidth: 1180,
  sidebarWidth: 252,
  sidebarCollapsedWidth: 76,
  tabBarHeight: 56,
  miniPlayerHeight: 64,
  topBarHeight: 64,
} as const;

export const api = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://lofibuddha.com",
};
