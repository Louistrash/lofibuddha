import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors, tint } from "@/src/theme/tokens";
import { DEFAULT_SCENE_THEME, type SceneTheme } from "@/src/theme/sceneThemes";
import { Mandala } from "./Mandala";

type Props = {
  theme?: SceneTheme;
  /** 0..1 — drives how far the scene opens, e.g. a breath cycle. */
  intensity?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Living backdrop for immersive surfaces: a large mandala drifting behind a
 * soft wash, both coloured by the scene theme the listener picked.
 */
export function SceneCanvas({
  theme = DEFAULT_SCENE_THEME,
  intensity = 0.5,
  children,
  style,
}: Props) {
  const { width, height } = useWindowDimensions();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [drift]);

  const haze = useAnimatedStyle(() => ({
    opacity: 0.55 + drift.value * 0.45,
    transform: [{ translateY: (drift.value - 0.5) * 36 }, { scale: 0.95 + drift.value * 0.14 }],
  }));

  const mandalaSize = Math.min(Math.max(width, height) * 0.95, 820);

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[colors.ink, tint(theme.wash, 0.14), colors.ink]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.mandalaLayer} pointerEvents="none">
        <Mandala size={mandalaSize} intensity={intensity} opacity={0.1} colors={theme.mandala} />
      </View>

      <Animated.View style={[styles.hazeLayer, haze]} pointerEvents="none">
        <Glow color={theme.wash} />
      </Animated.View>

      <LinearGradient
        colors={["transparent", tint(theme.accent, 0.06)]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(8,7,12,0.55)", colors.ink]}
        style={styles.veil}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

/** Concentric rings fake a radial falloff, which neither platform gives us for free. */
function Glow({ color }: { color: string }) {
  const rings = [
    { size: 620, opacity: 0.05 },
    { size: 470, opacity: 0.06 },
    { size: 340, opacity: 0.07 },
    { size: 220, opacity: 0.08 },
  ];
  return (
    <>
      {rings.map((r) => (
        <View
          key={r.size}
          style={[
            styles.glowRing,
            {
              width: r.size,
              height: r.size,
              borderRadius: r.size / 2,
              opacity: r.opacity,
              marginLeft: -r.size / 2,
              marginTop: -r.size / 2,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, overflow: "hidden" },
  mandalaLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  hazeLayer: { ...StyleSheet.absoluteFillObject },
  glowRing: { position: "absolute", top: "38%", left: "50%" },
  veil: { position: "absolute", left: 0, right: 0, bottom: 0, top: "45%" },
});
