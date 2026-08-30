import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Experience } from "@lofibuddha/shared";
import { accentByCategory, colors, radius, shadow, space, tint, type } from "@/src/theme/tokens";
import { Icon, type IconName } from "@/src/components/ui/Icon";
import { Mandala } from "./Mandala";

type Props = {
  experience: Experience;
  onPress: () => void;
  /** tile = card in a grid or rail, row = compact list line */
  variant?: "tile" | "row";
  width?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function ExperienceCard({
  experience,
  onPress,
  variant = "tile",
  width,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const accent = accentByCategory[experience.category] ?? colors.gold;

  if (variant === "row") {
    return (
      <Pressable
        onPress={onPress}
        style={({ hovered, pressed }: any) => [
          styles.row,
          hovered && { backgroundColor: colors.cardHover },
          pressed && { opacity: 0.85 },
        ]}
      >
        <LinearGradient
          colors={[tint(accent, 0.85), tint(accent, 0.35)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rowArt}
        >
          <Icon name={iconFor(experience)} size={18} color={colors.ink} />
        </LinearGradient>

        <View style={styles.rowMeta}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {experience.title}
          </Text>
          <Text style={styles.rowSub} numberOfLines={1}>
            {experience.description}
          </Text>
        </View>

        <Text style={styles.rowDuration}>{experience.duration}</Text>

        {onToggleFavorite ? (
          <Pressable onPress={onToggleFavorite} hitSlop={10} style={styles.heart}>
            <Icon
              name={isFavorite ? "heart" : "heartOutline"}
              size={17}
              color={isFavorite ? accent : colors.textMuted}
            />
          </Pressable>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: any) => [
        styles.tile,
        width ? { width } : null,
        hovered && styles.tileHover,
        pressed && { opacity: 0.9 },
      ]}
    >
      <LinearGradient
        colors={[tint(accent, 0.28), "rgba(17,16,25,0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, { backgroundColor: accent }]} />
      <View style={styles.mandala} pointerEvents="none">
        <Mandala
          size={190}
          opacity={0.38}
          speed={0.3}
          detail="simple"
          colors={[accent, accent, tint(accent, 0.85)]}
        />
      </View>

      <View style={styles.tileTop}>
        <View style={[styles.pill, { borderColor: tint(accent, 0.45) }]}>
          <Text style={[styles.pillText, { color: accent }]}>{experience.duration}</Text>
        </View>
        <View style={styles.tileTopRight}>
          {experience.special ? (
            <Icon name="timer" size={15} color={colors.textSecondary} />
          ) : null}
          {onToggleFavorite ? (
            <Pressable onPress={onToggleFavorite} hitSlop={10}>
              <Icon
                name={isFavorite ? "heart" : "heartOutline"}
                size={17}
                color={isFavorite ? accent : colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.tileBottom}>
        <Text style={styles.tileTitle} numberOfLines={2}>
          {experience.title}
        </Text>
        <Text style={styles.tileDesc} numberOfLines={2}>
          {experience.description}
        </Text>
        <View style={styles.playRow}>
          <View style={[styles.playDot, { backgroundColor: accent }]}>
            <Icon name="play" size={12} color={colors.ink} />
          </View>
          <Text style={styles.playLabel}>{labelFor(experience)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function iconFor(exp: Experience): IconName {
  if (exp.special === "box-breathing") return "meditation";
  if (exp.special === "pomodoro") return "timer";
  if (exp.guide) return "voice";
  return "music";
}

function labelFor(exp: Experience) {
  if (exp.special === "box-breathing") return "Guided breath";
  if (exp.special === "pomodoro") return "Focus timer";
  return exp.guide ? "Voice guided" : "Soundscape";
}

const styles = StyleSheet.create({
  tile: {
    height: 208,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    padding: space.lg,
    justifyContent: "space-between",
    ...shadow.card,
  },
  tileHover: { borderColor: colors.hairlineStrong },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -70,
    right: -50,
    opacity: 0.15,
  },
  // Offset past the halfway point so the dense core stays off-card and only
  // the outer petals sweep through the corner.
  mandala: { position: "absolute", top: -116, right: -104 },
  tileTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tileTopRight: { flexDirection: "row", alignItems: "center", gap: space.sm },
  pill: {
    paddingHorizontal: space.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillText: { ...type.caption },
  tileBottom: { gap: space.xs },
  tileTitle: { ...type.section, fontSize: 18, color: colors.text },
  tileDesc: { ...type.bodySmall, color: colors.textSecondary },
  playRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.sm },
  playDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  playLabel: { ...type.caption, color: colors.textMuted },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  rowArt: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowMeta: { flex: 1 },
  rowTitle: { ...type.headline, fontSize: 15, color: colors.text },
  rowSub: { ...type.bodySmall, color: colors.textMuted, marginTop: 2 },
  rowDuration: { ...type.caption, color: colors.textMuted },
  heart: { padding: space.xs },
});
