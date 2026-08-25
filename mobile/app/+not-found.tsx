import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/src/components/ui/Logo";
import { colors, gradients, space, type } from "@/src/theme/tokens";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Lost" }} />
      <View style={styles.root}>
        <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />
        <Logo size={64} style={styles.glyph} />
        <Text style={styles.title}>This path does not exist</Text>
        <Text style={styles.body}>Every wrong turn is still a step. Return to your practice.</Text>
        <Link href="/" style={styles.link}>
          Back to Today
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    padding: space["2xl"],
    gap: space.sm,
  },
  glyph: { marginBottom: space.md },
  title: { ...type.title, color: colors.text, textAlign: "center" },
  body: { ...type.body, color: colors.textSecondary, textAlign: "center", maxWidth: 320 },
  link: { ...type.label, color: colors.gold, marginTop: space.xl },
});
