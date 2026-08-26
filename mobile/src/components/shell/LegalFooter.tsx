import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, space, type } from "@/src/theme/tokens";

const LINKS = [
  { label: "Privacy", path: "/legal/privacy" },
  { label: "Terms", path: "/legal/terms" },
  { label: "Disclaimer", path: "/legal/disclaimer" },
];

/**
 * Legal links live inside the app on every platform. Navigating in-app (instead
 * of opening lofibuddha.com in a browser) keeps the design consistent and gives
 * the user a real way back — an external tab was a dead end.
 */
export function LegalFooter({ compact }: { compact?: boolean }) {
  const router = useRouter();

  return (
    <View style={[styles.root, compact && styles.compact]}>
      <View style={[styles.links, compact && styles.linksCompact]}>
        {LINKS.map((link) => (
          <Pressable
            key={link.path}
            onPress={() => router.push(link.path as never)}
            style={({ hovered }: any) => [hovered && { opacity: 0.7 }]}
          >
            <Text style={styles.link}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.copy}>© {new Date().getFullYear()} LofiBuddha</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    gap: space.sm,
    paddingTop: space["3xl"],
    paddingBottom: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    marginTop: space["3xl"],
  },
  compact: { paddingTop: space.lg, paddingBottom: 0, marginTop: space.xl },
  links: { flexDirection: "row", flexWrap: "wrap", gap: space.lg, justifyContent: "center" },
  linksCompact: { gap: space.md },
  link: { ...type.caption, color: colors.textSecondary },
  copy: { ...type.caption, color: colors.textMuted },
});
