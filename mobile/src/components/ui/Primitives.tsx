import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, space, type } from "@/src/theme/tokens";
import { Icon, type IconName } from "@/src/components/ui/Icon";

export function SectionHeader({
  title,
  caption,
  actionLabel,
  onAction,
  accent = colors.gold,
}: {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  accent?: string;
}) {
  return (
    <View style={styles.section}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.action}>
          <Text style={[styles.actionLabel, { color: accent }]}>{actionLabel}</Text>
          <Icon name="forward" size={14} color={accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** iOS grouped-list row. Use inside GroupedList. */
export function ListRow({
  label,
  value,
  icon,
  iconColor = colors.gold,
  onPress,
  destructive,
  right,
}: {
  label: string;
  value?: string;
  icon?: IconName;
  iconColor?: string;
  onPress?: () => void;
  destructive?: boolean;
  right?: React.ReactNode;
}) {
  const body = (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: `${iconColor}22` }]}>
          <Icon name={icon} size={16} color={iconColor} />
        </View>
      ) : null}
      <Text style={[styles.rowLabel, destructive && { color: colors.danger }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {right}
        {onPress && !right ? (
          <Icon name="forward" size={16} color={colors.textMuted} />
        ) : null}
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        hovered && { backgroundColor: colors.cardHover },
        pressed && { backgroundColor: colors.cardHover, opacity: 0.9 },
      ]}
    >
      {body}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  accent = colors.gold,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  accent?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.chip,
        active && { backgroundColor: accent, borderColor: accent },
        hovered && !active && { borderColor: colors.hairlineStrong },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.chipText, active && { color: colors.ink }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({ label, accent = colors.gold }: { label: string; accent?: string }) {
  return (
    <View style={[styles.badge, { borderColor: `${accent}55`, backgroundColor: `${accent}1A` }]}>
      <Text style={[styles.badgeText, { color: accent }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

export function EmptyState({
  icon = "lotus",
  title,
  message,
}: {
  icon?: IconName;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={22} color={colors.gold} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: space.lg,
    gap: space.lg,
  },
  sectionTitle: { ...type.section, color: colors.text },
  sectionCaption: { ...type.bodySmall, color: colors.textMuted, marginTop: 2 },
  action: { flexDirection: "row", alignItems: "center", gap: 2 },
  actionLabel: { ...type.label },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    gap: space.md,
    minHeight: 52,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { ...type.body, color: colors.text, flex: 1 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: space.sm, maxWidth: "50%" },
  rowValue: { ...type.bodySmall, color: colors.textSecondary },

  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  chipText: { ...type.label, color: colors.textSecondary },

  badge: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: { ...type.caption },

  empty: {
    alignItems: "center",
    paddingVertical: space["4xl"],
    paddingHorizontal: space["2xl"],
    gap: space.sm,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  emptyTitle: { ...type.headline, color: colors.text },
  emptyMessage: { ...type.bodySmall, color: colors.textMuted, textAlign: "center", maxWidth: 320 },
});
