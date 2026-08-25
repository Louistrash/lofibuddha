import { useWindowDimensions, Platform } from "react-native";

export const breakpoints = {
  sm: 0,
  md: 700,
  lg: 1024,
  xl: 1400,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export type Layout = {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  /** Phone-sized: iOS chrome, bottom tab bar. */
  isCompact: boolean;
  /** Tablet and up: wider grids, no bottom tab bar on desktop. */
  isMedium: boolean;
  /** Desktop: persistent sidebar dashboard. */
  isDesktop: boolean;
  isWide: boolean;
  /** Number of columns for card grids. */
  columns: number;
  /** Horizontal page padding. */
  gutter: number;
};

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= breakpoints.lg;
  const isMedium = width >= breakpoints.md;
  const isWide = width >= breakpoints.xl;

  const breakpoint: Breakpoint = isWide ? "xl" : isDesktop ? "lg" : isMedium ? "md" : "sm";

  return {
    width,
    height,
    breakpoint,
    isCompact: !isMedium,
    isMedium,
    isDesktop,
    isWide,
    columns: isWide ? 4 : isDesktop ? 3 : isMedium ? 2 : 1,
    gutter: isDesktop ? 32 : isMedium ? 24 : 20,
  };
}

/** Pick a value per breakpoint, falling back down the scale. */
export function responsive<T>(
  layout: Layout,
  values: { sm: T; md?: T; lg?: T; xl?: T }
): T {
  if (layout.breakpoint === "xl") return values.xl ?? values.lg ?? values.md ?? values.sm;
  if (layout.breakpoint === "lg") return values.lg ?? values.md ?? values.sm;
  if (layout.breakpoint === "md") return values.md ?? values.sm;
  return values.sm;
}

export const isWeb = Platform.OS === "web";
export const isIOS = Platform.OS === "ios";
