import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mandala } from "@/src/components/content/Mandala";
import { Icon, type IconName } from "@/src/components/ui/Icon";
import { colors, radius, space, tint, type } from "@/src/theme/tokens";

/**
 * Sound categories carry their own colour and glyph so the grid reads at a
 * glance instead of being a wall of identical chips.
 */
const BY_CATEGORY: Record<string, { accent: string; icon: IconName }> = {
  Water: { accent: colors.jade, icon: "water" },
  Nature: { accent: "#7FD98A", icon: "leaf" },
  Warmth: { accent: colors.saffron, icon: "candle" },
  Wind: { accent: "#8FB8FF", icon: "spa" },
  Spiritual: { accent: colors.gold, icon: "om" },
  Ambient: { accent: colors.indigo, icon: "night" },
  Noise: { accent: colors.textSecondary, icon: "pulse" },
  Music: { accent: colors.lotus, icon: "music" },
};

export function soundStyle(category: string) {
  return BY_CATEGORY[category] ?? { accent: colors.gold, icon: "music" as IconName };
}

type Props = {
  label: string;
  caption: string;
  category: string;
  active?: boolean;
  /** Overrides the category colour, for soundtracks. */
  accent?: string;
  icon?: IconName;
  onPress: () => void;
};

/**
 * A mandala card. The whole surface is the touch target — the previous chip put
 * onPress on a <Text> with the caption outside it, so half of what you could
 * see was not tappable, which read as the tile being dead.
 */
export function SoundCard({
  label,
  caption,
  category,
  active = false,
  accent: accentOverride,
  icon: iconOverride,
  onPress,
}: Props) {
  const base = soundStyle(category);
  const accent = accentOverride ?? base.accent;
  const icon = iconOverride ?? base.icon;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}, ${caption}${active ? ", playing" : ""}`}
      android_ripple={{ color: tint(accent, 0.18) }}
      style={({ pressed, hovered }: any) => [
        styles.card,
        {
          borderColor: active ? tint(accent, 0.55) : colors.hairline,
          backgroundColor: active ? tint(accent, 0.1) : colors.card,
        },
        hovered && !active && { borderColor: tint(accent, 0.32) },
        pressed && { transform: [{ scale: 0.975 }], opacity: 0.9 },
      ]}
    >
      {/* Mandala backdrop — golden style, brighter once the sound is running.
          The category keeps its colour on the badge/border; the mandala stays
          a consistent brand gold. */}
      <View style={styles.mandala} pointerEvents="none">
        <Mandala
          size={168}
          opacity={active ? 0.3 : 0.14}
          speed={active ? 0.5 : 0.16}
          intensity={active ? 0.55 : 0.25}
          detail="simple"
          colors={[colors.gold, colors.goldBright, tint(colors.gold, 0.72) as unknown as string]}
        />
      </View>

      <LinearGradient
        colors={[tint(accent, active ? 0.2 : 0.1), "transparent"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.badge, { backgroundColor: tint(accent, 0.16) }]}>
        <Icon name={icon} size={16} color={accent} />
      </View>

      <View style={styles.text}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
        <Text style={[styles.caption, active && { color: accent }]} numberOfLines={1}>
          {active ? "Playing" : caption}
        </Text>
      </View>

      {active ? <View style={[styles.dot, { backgroundColor: accent }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 148,
    maxWidth: 260,
    minHeight: 128,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.lg,
    overflow: "hidden",
    justifyContent: "space-between",
    // Web only: a real cursor makes it obvious the card is interactive.
    cursor: "pointer",
  } as any,
  mandala: {
    position: "absolute",
    right: -46,
    bottom: -52,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { gap: 2, marginTop: space.md },
  label: { ...type.headline, color: colors.text },
  caption: { ...type.caption, color: colors.textMuted },
  dot: {
    position: "absolute",
    top: space.lg,
    right: space.lg,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
