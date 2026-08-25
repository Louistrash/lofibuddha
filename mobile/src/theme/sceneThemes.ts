import { palette } from "./tokens";

export type SceneTheme = {
  id: string;
  name: string;
  /** Button and control gradient, light stop first. */
  gradient: [string, string];
  /** Flat colour for progress bars, chips and icons. */
  accent: string;
  /** Warm or cool wash behind the mandala. */
  wash: string;
  /** Mandala line colours, from outer ring inwards. */
  mandala: [string, string, string];
  /** Text on top of the gradient. */
  onGradient: string;
};

export const SCENE_THEMES: SceneTheme[] = [
  {
    id: "copper",
    name: "Copper",
    gradient: ["#C9843F", "#6E3617"],
    accent: "#D9954E",
    wash: "#7A431F",
    mandala: ["#D9954E", "#A5642C", "#F0C48A"],
    onGradient: "#1A0E06",
  },
  {
    id: "ember",
    name: "Ember",
    gradient: ["#E0761F", "#6B2708"],
    accent: "#E8892F",
    wash: "#7C3A0B",
    mandala: ["#E8892F", "#A3520F", "#F7BB78"],
    onGradient: "#1B0A02",
  },
  {
    id: "plum",
    name: "Plum",
    gradient: ["#7B4397", "#2E1140"],
    accent: "#9B62B8",
    wash: "#3D1A52",
    mandala: ["#9B62B8", "#6A3A85", "#D2A9E5"],
    onGradient: "#12061A",
  },
  {
    id: "gold",
    name: "Gold",
    gradient: [palette.goldBright, palette.goldDeep],
    accent: palette.gold,
    wash: palette.goldDeep,
    mandala: [palette.gold, palette.goldDeep, palette.goldBright],
    onGradient: palette.ink,
  },
  {
    id: "midnight",
    name: "Midnight",
    gradient: ["#4B5BC4", "#171B3D"],
    accent: "#6C74FF",
    wash: "#232A5C",
    mandala: ["#7E86FF", "#3F478F", "#B9BEFF"],
    onGradient: "#080A1A",
  },
];

export const DEFAULT_SCENE_THEME = SCENE_THEMES[0];

export function getSceneTheme(id: string | null | undefined): SceneTheme {
  return SCENE_THEMES.find((t) => t.id === id) ?? DEFAULT_SCENE_THEME;
}
