import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, radius, shadow, space, type } from "@/src/theme/tokens";

type SurfaceProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Adds a subtle top-lit gradient. Use for hero and feature cards. */
  lit?: boolean;
  padded?: boolean;
  onPress?: () => void;
  accent?: string;
};

export function Surface({ children, style, lit, padded = true, onPress, accent }: SurfaceProps) {
  const content = (
    <>
      {lit ? (
        <LinearGradient colors={gradients.card} style={StyleSheet.absoluteFill} />
      ) : null}
      {accent ? <View style={[styles.accentEdge, { backgroundColor: accent }]} /> : null}
      {children}
    </>
  );

  const base = [
    styles.surface,
    padded && styles.padded,
    !lit && { backgroundColor: colors.card },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed, hovered }: any) => [
          ...base,
          hovered && styles.hovered,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={base}>{content}</View>;
}

/** iOS-style inset grouped container. Children are ListRow items. */
export function GroupedList({
  children,
  title,
  style,
}: {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={style}>
      {title ? <Text style={styles.groupTitle}>{title.toUpperCase()}</Text> : null}
      <View style={styles.group}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <View style={styles.separator} /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    ...shadow.card,
  },
  padded: { padding: space.xl },
  hovered: { borderColor: colors.hairlineStrong },
  pressed: { opacity: 0.85 },
  accentEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  groupTitle: {
    ...type.caption,
    color: colors.textMuted,
    marginBottom: space.sm,
    marginLeft: space.lg,
  },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginLeft: space["3xl"],
  },
});
