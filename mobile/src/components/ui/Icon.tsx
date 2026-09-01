import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BuddhaIcon } from "./BuddhaIcon";

/**
 * One icon vocabulary for the whole app. Material Community is a line-based
 * set with real mindfulness glyphs (meditation, om, yoga, spa), which keeps
 * the app from drifting into rounded emoji territory.
 */
const GLYPHS = {
  // navigation
  buddha: "__buddha__",
  compass: "compass-outline",
  compassActive: "compass",
  guide: "creation-outline",
  guideActive: "creation",
  bookmark: "bookmark-outline",
  bookmarkActive: "bookmark",
  person: "account-outline",
  personActive: "account",

  // chrome
  back: "chevron-left",
  forward: "chevron-right",
  down: "chevron-down",
  close: "close",
  search: "magnify",
  clear: "close-circle",
  refresh: "refresh",
  restart: "restart",
  arrowRight: "arrow-right",
  arrowUp: "arrow-up",
  arrowRightCircle: "arrow-right-circle-outline",
  check: "check",
  checkCircle: "check-circle-outline",
  alert: "alert-circle-outline",

  // practice
  meditation: "meditation",
  om: "om",
  lotus: "flower-outline",
  spa: "spa-outline",
  yoga: "yoga",
  crown: "crown-outline",
  night: "weather-night",
  candle: "candle",
  leaf: "leaf",
  water: "water-outline",
  timer: "timer-sand",
  clock: "clock-outline",
  pulse: "heart-pulse",

  // media
  play: "play",
  pause: "pause",
  music: "music-note",
  musicOff: "music-note-outline",
  voice: "microphone-outline",
  headphones: "headphones",
  heart: "heart",
  heartOutline: "heart-outline",
  layers: "layers-outline",
  catalog: "bookshelf",
  school: "school-outline",

  // account
  mail: "email-outline",
  lock: "lock-outline",
  unlock: "lock-open-outline",
  google: "google",
  card: "credit-card-outline",
  document: "file-document-outline",
  globe: "web",
  logout: "logout",
} as const;

export type IconName = keyof typeof GLYPHS;

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  if (name === "buddha") return <BuddhaIcon size={size} color={color} />;
  return (
    <MaterialCommunityIcons
      name={GLYPHS[name] as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
      size={size}
      color={color}
    />
  );
}
