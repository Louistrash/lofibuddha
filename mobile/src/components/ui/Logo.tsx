import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius, space, type } from "@/src/theme/tokens";

const SOURCE = require("../../../assets/images/logo.png");

/** The Buddha mark on its own. Used anywhere a title needs an anchor. */
export function Logo({ size = 32, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Image source={SOURCE} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

/** Mark plus wordmark, for navigation and headers. */
export function Wordmark({
  size = 30,
  caption,
  style,
}: {
  size?: number;
  caption?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.lockup, style]}>
      <Logo size={size} />
      <View>
        <Text style={[styles.name, { fontSize: size }]}>LofiBuddha</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.goldEdge,
    alignItems: "center",
    justifyContent: "center",
  },
  lockup: { flexDirection: "row", alignItems: "center", gap: space.md },
  name: {
    ...type.headline,
    color: "#FFC861",
    textShadowColor: "rgba(255, 200, 97, 0.65)",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  caption: { ...type.caption, color: colors.textMuted },
});

export const logoSource = SOURCE;
export const logoRadius = radius.pill;
