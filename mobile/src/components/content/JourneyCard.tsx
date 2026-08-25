import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { accentByCategory, colors, radius, shadow, space, tint, type } from "@/src/theme/tokens";
import type { CategoryKey } from "@/src/theme/tokens";
import { Icon } from "@/src/components/ui/Icon";
import { Mandala } from "./Mandala";

export function JourneyCard({
  id,
  name,
  tagline,
  script,
  count,
  onPress,
  width,
  compact,
}: {
  id: CategoryKey;
  name: string;
  tagline: string;
  script: string;
  count: number;
  onPress: () => void;
  width?: number;
  compact?: boolean;
}) {
  const accent = accentByCategory[id] ?? colors.gold;

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: any) => [
        styles.card,
        compact && styles.compact,
        width ? { width } : null,
        hovered && { borderColor: tint(accent, 0.5) },
        pressed && { opacity: 0.9 },
      ]}
    >
      <LinearGradient
        colors={[tint(accent, 0.32), "rgba(15,14,23,0.96)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, { backgroundColor: accent }]} />
      <View style={[styles.mandala, compact && styles.mandalaCompact]} pointerEvents="none">
        <Mandala
          size={compact ? 170 : 200}
          opacity={0.4}
          speed={0.35}
          detail="simple"
          colors={[accent, accent, tint(accent, 0.85)]}
        />
      </View>

      <Text style={[styles.script, { color: tint(accent, 0.9) }]}>{script}</Text>

      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.tagline} numberOfLines={1}>
          {tagline}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.count}>{count} sessions</Text>
        <View style={[styles.arrow, { backgroundColor: tint(accent, 0.22) }]}>
          <Icon name="arrowRight" size={14} color={accent} />
        </View>
      </View>
    </Pressable>
  );
}

export function WorldCard({
  title,
  subtitle,
  script,
  accent,
  onPress,
  width,
}: {
  title: string;
  subtitle: string;
  script: string;
  accent: string;
  onPress: () => void;
  width?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: any) => [
        styles.world,
        width ? { width } : null,
        hovered && { borderColor: tint(accent, 0.5) },
        pressed && { opacity: 0.9 },
      ]}
    >
      <LinearGradient
        colors={[tint(accent, 0.45), "rgba(12,11,19,0.9)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.worldMandala} pointerEvents="none">
        <Mandala
          size={210}
          opacity={0.34}
          speed={0.3}
          detail="simple"
          colors={[accent, accent, tint(accent, 0.85)]}
        />
      </View>

      <View style={styles.worldTop}>
        <Text style={[styles.worldScript, { color: tint(accent, 0.95) }]}>{script}</Text>
        <View style={styles.liveTag}>
          <View style={[styles.liveDot, { backgroundColor: accent }]} />
          <Text style={styles.liveText}>IMMERSIVE</Text>
        </View>
      </View>
      <View>
        <Text style={styles.worldTitle}>{title}</Text>
        <Text style={styles.worldSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 176,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    padding: space.lg,
    justifyContent: "space-between",
    ...shadow.card,
  },
  compact: { height: 148 },
  orb: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -70,
    right: -40,
    opacity: 0.16,
  },
  // Offset past the halfway point so the dense core stays off-card and only
  // the outer petals sweep through the corner.
  mandala: { position: "absolute", bottom: -124, right: -108 },
  mandalaCompact: { bottom: -106, right: -92 },
  worldMandala: { position: "absolute", top: -128, right: -116 },
  script: { ...type.devanagari, fontSize: 17 },
  body: { gap: 2 },
  name: { ...type.title, fontSize: 21, color: colors.text },
  tagline: { ...type.bodySmall, color: colors.textSecondary },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  count: { ...type.caption, color: colors.textMuted },
  arrow: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  world: {
    height: 152,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    padding: space.lg,
    justifyContent: "space-between",
    ...shadow.card,
  },
  worldTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  worldScript: { ...type.devanagari, fontSize: 20 },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { ...type.caption, fontSize: 9, color: colors.textSecondary },
  worldTitle: { ...type.section, color: colors.text },
  worldSub: { ...type.bodySmall, color: colors.textMuted, marginTop: 2 },
});
