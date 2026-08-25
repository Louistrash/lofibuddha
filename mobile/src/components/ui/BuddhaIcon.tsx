import React from "react";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  /** Thicker strokes read better below ~24px. */
  strokeWidth?: number;
};

/**
 * The LofiBuddha mark as a true icon: a meditating Buddha wearing headphones,
 * drawn simply enough to stay legible at tab-bar size.
 */
export function BuddhaIcon({ size = 24, color = "currentColor", strokeWidth }: Props) {
  const sw = strokeWidth ?? (size <= 26 ? 1.5 : 1.25);
  const stroke = {
    stroke: color,
    strokeWidth: sw,
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* headphone band */}
      <Path d="M3.6 13.2v-2.1a8.4 8.4 0 0 1 16.8 0v2.1" {...stroke} />
      {/* ear cups */}
      <Rect x={2.1} y={11.4} width={3.4} height={5.4} rx={1.7} {...stroke} />
      <Rect x={18.5} y={11.4} width={3.4} height={5.4} rx={1.7} {...stroke} />
      {/* ushnisha */}
      <Circle cx={12} cy={4.5} r={1.5} {...stroke} />
      {/* head */}
      <Ellipse cx={12} cy={11.1} rx={4.5} ry={5.1} {...stroke} />
      {/* closed eyes */}
      <Path d="M9.5 11.1c.5.7 1.4.7 1.9 0" {...stroke} />
      <Path d="M12.6 11.1c.5.7 1.4.7 1.9 0" {...stroke} />
      {/* urna */}
      <Circle cx={12} cy={8.2} r={0.45} fill={color} stroke="none" />
      {/* shoulders and robe */}
      <Path d="M5 21.6c.9-2.9 3.4-4.6 7-4.6s6.1 1.7 7 4.6" {...stroke} />
      <Path d="M9.6 19.2c1.5.9 3.3.9 4.8 0" {...stroke} />
    </Svg>
  );
}
