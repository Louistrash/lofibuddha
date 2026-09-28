import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, space, type } from "@/src/theme/tokens";
import { Icon } from "@/src/components/ui/Icon";

type ShelfRenderArgs = {
  /** How many items to render; `undefined` means show all. */
  limit: number | undefined;
  showAll: boolean;
};

type Props = {
  title: string;
  caption?: string;
  /** Total items in this shelf (shown in the header). */
  count?: number;
  defaultExpanded?: boolean;
  /** Controlled expand state (e.g. jump-nav force-open). */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** When set, children receive a render limit until the user taps “Show all”. */
  previewLimit?: number;
  children: React.ReactNode | ((args: ShelfRenderArgs) => React.ReactNode);
};

/**
 * Collapsible library shelf. Children mount only while expanded so heavy
 * rails (covers, workshops) do not block the first paint.
 */
export function Shelf({
  title,
  caption,
  count,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  previewLimit,
  children,
}: Props) {
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const controlled = expandedProp !== undefined;
  const expanded = controlled ? expandedProp : uncontrolled;

  const setExpanded = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  const limit =
    previewLimit != null && !showAll ? previewLimit : undefined;
  const total = count ?? 0;
  const canShowAll =
    expanded && previewLimit != null && total > previewLimit && !showAll;
  const canShowLess =
    expanded && previewLimit != null && total > previewLimit && showAll;

  const body =
    typeof children === "function"
      ? children({ limit, showAll })
      : children;

  return (
    <View style={styles.shelf}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${expanded ? "collapse" : "expand"}`}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {count != null ? (
              <Text style={styles.count}>{count}</Text>
            ) : null}
          </View>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
        <Icon
          name={expanded ? "down" : "forward"}
          size={18}
          color={expanded ? colors.goldBright : colors.gold}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {body}
          {canShowAll ? (
            <Pressable
              onPress={(e) => {
                // Prevent the parent ScrollView / shelf header from eating the tap on web.
                // @ts-expect-error RN web
                e?.stopPropagation?.();
                setShowAll(true);
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={`Show all ${total} items`}
              style={({ pressed }) => [styles.more, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.moreLabel}>Show all ({total})</Text>
              <Icon name="down" size={14} color={colors.gold} />
            </Pressable>
          ) : null}
          {canShowLess ? (
            <Pressable
              onPress={() => setShowAll(false)}
              hitSlop={8}
              style={({ pressed }) => [styles.more, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.moreLabel}>Show less</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    marginBottom: space["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingBottom: space.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.sm,
  },
  headerText: { flex: 1, gap: 2 },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: space.sm,
  },
  title: { ...type.section, color: colors.text },
  count: { ...type.caption, color: colors.textMuted },
  caption: { ...type.bodySmall, color: colors.textSecondary },
  body: { marginTop: space.md, gap: space.md },
  more: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: space.xs,
    paddingVertical: space.sm,
  },
  moreLabel: { ...type.label, color: colors.gold },
});
