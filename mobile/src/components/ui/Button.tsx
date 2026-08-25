import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, type IconName } from "./Icon";
import { colors, gradients, radius, space, type } from "@/src/theme/tokens";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accent?: string;
  /** Two-stop background for primary buttons. Overrides `accent`. */
  gradient?: readonly [string, string];
  /** Foreground colour on a gradient background. */
  onGradient?: string;
  style?: ViewStyle;
};

const heights: Record<Size, number> = { sm: 36, md: 46, lg: 54 };

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading,
  disabled,
  fullWidth,
  accent,
  gradient,
  onGradient,
  style,
}: Props) {
  const height = heights[size];
  const isPrimary = variant === "primary";
  const fill = gradient ?? (accent ? ([accent, accent] as const) : gradients.gold);
  const fg = isPrimary ? (onGradient ?? colors.ink) : accent || colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, hovered }: any) => [
        styles.base,
        { height, paddingHorizontal: size === "sm" ? space.lg : space["2xl"] },
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        fullWidth && { alignSelf: "stretch" },
        hovered && { opacity: 0.92 },
        pressed && { opacity: 0.78, transform: [{ scale: 0.99 }] },
        (disabled || loading) && { opacity: 0.45 },
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={fill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={size === "sm" ? 16 : 19} color={fg} /> : null}
          <Text
            style={[
              type.headline,
              { color: fg, fontSize: size === "sm" ? 14 : 16 },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** Circular icon-only control (play, close, favorite). */
export function IconButton({
  icon,
  onPress,
  size = 44,
  color = colors.text,
  background = "rgba(255,255,255,0.08)",
  accessibilityLabel,
}: {
  icon: IconName;
  onPress: () => void;
  size?: number;
  color?: string;
  background?: string;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed, hovered }: any) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background,
        },
        hovered && { opacity: 0.85 },
        pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
      ]}
    >
      <Icon name={icon} size={size * 0.46} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  ghost: { backgroundColor: "transparent" },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  iconButton: { alignItems: "center", justifyContent: "center" },
});
