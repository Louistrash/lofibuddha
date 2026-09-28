import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { space } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";

/**
 * Horizontal rail on phones, wrapping grid on wider screens.
 * Pass `wrap` to force a wrapping grid (e.g. after “Show all”).
 */
export function CardRail({
  children,
  minCardWidth = 260,
  columns,
  wrap = false,
}: {
  children: React.ReactNode;
  minCardWidth?: number;
  columns?: number;
  /** Force wrapping grid even on compact layouts. */
  wrap?: boolean;
}) {
  const l = useLayout();
  const items = React.Children.toArray(children).filter(Boolean);

  if (l.isCompact && !wrap) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        snapToInterval={minCardWidth + space.md}
        decelerationRate="fast"
      >
        {items.map((child, i) => (
          <View key={i} style={{ width: minCardWidth }}>
            {child}
          </View>
        ))}
      </ScrollView>
    );
  }

  const cols = columns ?? l.columns;

  return (
    <View style={styles.grid}>
      {items.map((child, i) => (
        <View key={i} style={[styles.cell, { flexBasis: `${100 / cols}%` }]}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { gap: space.md, paddingRight: space.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.sm },
  cell: { paddingHorizontal: space.sm, paddingBottom: space.lg },
});
