import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { palette, tint } from "@/src/theme/tokens";

const VIEW = 100;
const C = VIEW / 2;

/** Teardrop petal pointing up from the centre, mirrored around the vertical axis. */
function petal(inner: number, outer: number, width: number) {
  const top = C - outer;
  const base = C - inner;
  const belly = C - (inner + (outer - inner) * 0.55);
  return [
    `M ${C} ${base}`,
    `C ${C - width} ${belly}, ${C - width} ${top + 2}, ${C} ${top}`,
    `C ${C + width} ${top + 2}, ${C + width} ${belly}, ${C} ${base}`,
    "Z",
  ].join(" ");
}

type RingProps = {
  count: number;
  inner: number;
  outer: number;
  width: number;
  color: string;
  fill?: string;
  strokeWidth?: number;
  opacity: number;
};

function Ring({ count, inner, outer, width, color, fill, strokeWidth = 0.5, opacity }: RingProps) {
  const d = useMemo(() => petal(inner, outer, width), [inner, outer, width]);
  const angles = useMemo(
    () => Array.from({ length: count }, (_, i) => (360 / count) * i),
    [count]
  );

  return (
    <G opacity={opacity}>
      {angles.map((a) => (
        <Path
          key={a}
          d={d}
          transform={`rotate(${a} ${C} ${C})`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill={fill ?? "none"}
          strokeLinejoin="round"
        />
      ))}
    </G>
  );
}

/** One rotating layer. Rotation lives on the container so the SVG stays static. */
function Layer({
  duration,
  reverse,
  children,
}: {
  duration: number;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
  }, [duration, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(spin.value, [0, 1], reverse ? [360, 0] : [0, 360])}deg` }],
  }));

  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

type Props = {
  size?: number;
  /** 0..1 — a breath or progress value that gently opens the mandala. */
  intensity?: number;
  /** Overall visibility. Keep low for backgrounds. */
  opacity?: number;
  /** Ring colours from the outside in. Defaults to gold and bronze. */
  colors?: readonly [string, string, string];
  /** Slows or stops the drift. Use 0 for a still, decorative mandala. */
  speed?: number;
  /**
   * "simple" drops the finest ring. Use it when many mandalas share a screen —
   * the detail is invisible at small sizes but the SVG cost is not.
   */
  detail?: "full" | "simple";
  style?: ViewStyle;
  children?: React.ReactNode;
};

const DEFAULT_COLORS = [palette.gold, palette.goldDeep, palette.goldBright] as const;

/**
 * Slow gold-and-bronze mandala. Three rings drift at different speeds and
 * directions so the pattern never repeats visibly.
 */
export function Mandala({
  size = 320,
  intensity = 0.5,
  opacity = 1,
  colors = DEFAULT_COLORS,
  speed = 1,
  detail = "full",
  style,
  children,
}: Props) {
  const fine = detail === "full";
  const [outer, mid, inner] = colors;
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [breath]);

  const breathing = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.035 + intensity * 0.06 }],
    opacity: 0.82 + breath.value * 0.18,
  }));

  return (
    <View style={[{ width: size, height: size, opacity }, styles.root, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, breathing]}>
        <Layer duration={170000 / speed}>
          <Svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" height="100%">
            <Circle cx={C} cy={C} r={48} stroke={mid} strokeWidth={0.3} fill="none" opacity={0.5} />
            <Ring
              count={fine ? 32 : 16}
              inner={40}
              outer={49}
              width={fine ? 1.4 : 2.2}
              color={outer}
              strokeWidth={0.3}
              opacity={0.45}
            />
          </Svg>
        </Layer>

        <Layer duration={120000 / speed} reverse>
          <Svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" height="100%">
            <Circle cx={C} cy={C} r={34} stroke={mid} strokeWidth={0.35} fill="none" opacity={0.6} />
            <Ring
              count={fine ? 16 : 12}
              inner={22}
              outer={38}
              width={4.5}
              color={mid}
              fill={tint(mid, 0.08)}
              strokeWidth={0.45}
              opacity={0.75}
            />
          </Svg>
        </Layer>

        <Layer duration={85000 / speed}>
          <Svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" height="100%">
            <Ring
              count={8}
              inner={9}
              outer={24}
              width={5.5}
              color={outer}
              fill={tint(outer, 0.08)}
              strokeWidth={0.5}
              opacity={0.85}
            />
            {fine ? (
              <Ring
                count={8}
                inner={5}
                outer={13}
                width={3}
                color={inner}
                fill={tint(inner, 0.1)}
                strokeWidth={0.4}
                opacity={0.7}
              />
            ) : null}
          </Svg>
        </Layer>

        <Svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Circle cx={C} cy={C} r={5} stroke={inner} strokeWidth={0.4} fill={tint(inner, 0.12)} />
          <Circle cx={C} cy={C} r={1.6} fill={inner} opacity={0.6} />
        </Svg>
      </Animated.View>

      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center" },
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});
