import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "@/src/components/ui/Icon";
import { colors, radius, shadow, space, tint, type } from "@/src/theme/tokens";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  duration?: string;
  moduleCount?: number;
  premium?: boolean;
};

type Props = {
  course: CourseCardData;
  locked: boolean;
  onPress: () => void;
};

/**
 * Premium course tile — a soft gold gradient, a slowly breathing halo, and a
 * crown/lock marker so a paid tier reads as "premium" rather than a plain list row.
 */
export function CourseCard({ course, locked, onPress }: Props) {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [breath]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + breath.value * 0.32,
    transform: [{ scale: 1.05 + breath.value * 0.12 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: any) => [
        styles.card,
        hovered && styles.cardHover,
        pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient
        colors={[tint(colors.gold, 0.18), "rgba(17,16,25,0.97)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.55, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none" />

      <View style={styles.topRow}>
        <View style={styles.marker}>
          <Icon name={locked ? "lock" : "crown"} size={15} color={colors.gold} />
        </View>
        {course.premium ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>Enlightened</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        {course.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {course.subtitle}
          </Text>
        ) : null}
        {course.description ? (
          <Text style={styles.desc} numberOfLines={3}>
            {course.description}
          </Text>
        ) : null}
      </View>

      <Text style={styles.meta}>
        {course.duration}
        {course.moduleCount ? ` · ${course.moduleCount} lessons` : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: 260,
    flexGrow: 1,
    minWidth: 220,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: space.xl,
    gap: space.md,
    overflow: "hidden",
    ...shadow.card,
  },
  cardHover: {
    borderColor: tint(colors.gold, 0.4),
  },
  halo: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: tint(colors.gold, 0.35),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(184,146,88,0.12)",
    borderWidth: 1,
    borderColor: "rgba(184,146,88,0.35)",
  },
  pill: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(184,146,88,0.45)",
    backgroundColor: "rgba(184,146,88,0.12)",
  },
  pillText: { ...type.caption, color: colors.gold, fontSize: 9, letterSpacing: 1 },
  body: { flex: 1, gap: space.xs },
  title: { ...type.headline, fontSize: 18, color: colors.text },
  subtitle: { ...type.caption, color: colors.goldBright },
  desc: { ...type.bodySmall, color: colors.textSecondary, lineHeight: 18 },
  meta: { ...type.caption, color: colors.textMuted },
});
