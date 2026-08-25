import React from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { api, colors, space, type } from "@/src/theme/tokens";

const LINKS = [
  { label: "Privacy", path: "/legal/privacy" },
  { label: "Terms", path: "/legal/terms" },
  { label: "Disclaimer", path: "/legal/disclaimer" },
];

/**
 * Legal links are a web requirement only. On iOS and Android the same
 * information lives in the store listing and the Account screen.
 */
export function LegalFooter({ compact }: { compact?: boolean }) {
  if (Platform.OS !== "web") return null;

  const open = (path: string) => {
    Linking.openURL(`${api.baseUrl.replace(/\/$/, "")}${path}`);
  };

  return (
    <View style={[styles.root, compact && styles.compact]}>
      <View style={[styles.links, compact && styles.linksCompact]}>
        {LINKS.map((link) => (
          <Pressable
            key={link.path}
            onPress={() => open(link.path)}
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
