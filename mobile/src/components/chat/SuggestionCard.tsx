import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mandala } from "@/src/components/content/Mandala";
import { Icon } from "@/src/components/ui/Icon";
import { colors, radius, space, tint, type } from "@/src/theme/tokens";
import type { JourneySuggestion } from "@/src/lib/chat-intent";

/**
 * Offered inside the conversation instead of navigating on its own. The old
 * behaviour called router.push() the moment a keyword matched, so the app threw
 * you out of the chat mid-sentence. Now Buddha proposes and you decide.
 */
export function SuggestionCard({
  suggestion,
  onPress,
}: {
  suggestion: JourneySuggestion;
  onPress: () => void;
}) {
  const { accent, title, tagline, script } = suggestion;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title} — ${tagline}`}
      style={({ pressed, hovered }: any) => [
        styles.card,
        { borderColor: tint(accent, 0.4) },
        hovered && { borderColor: tint(accent, 0.65) },
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}
    >
      <LinearGradient
        colors={[tint(accent, 0.16), "transparent"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.mandala} pointerEvents="none">
        <Mandala size={130} opacity={0.22} speed={0.2} intensity={0.4} detail="simple"
          colors={[accent, tint(accent, 0.7) as unknown as string, colors.goldBright]} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.script, { color: accent }]}>{script}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.tagline}>{tagline}</Text>
      </View>

      <View style={[styles.cta, { backgroundColor: tint(accent, 0.18) }]}>
        <Text style={[styles.ctaText, { color: accent }]}>Open</Text>
        <Icon name="arrowRight" size={14} color={accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.card,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    overflow: "hidden",
    cursor: "pointer",
  } as any,
  mandala: { position: "absolute", right: -34, bottom: -40 },
  body: { flex: 1, gap: 1 },
  script: { ...type.devanagari, fontSize: 12, letterSpacing: 2, opacity: 0.95 },
  title: { ...type.headline, color: colors.text },
  tagline: { ...type.caption, color: colors.textMuted },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  ctaText: { ...type.label, fontSize: 12 },
});
