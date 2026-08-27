import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, space } from "@/src/theme/tokens";

/**
 * Three dots that rise and fade in sequence — the familiar "typing" signal.
 * Replaces a spinner, which reads as loading a page rather than someone
 * composing a reply.
 */
function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 420, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, v]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + v.value * 0.65,
    transform: [{ translateY: -3 * v.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function ThinkingDots() {
  return (
    <View style={styles.row} accessibilityLabel="Buddha is reflecting">
      {[0, 140, 280].map((d) => (
        <Dot key={d} delay={d} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: space.xs },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
});
