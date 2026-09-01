import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, layout, radius, space, type } from "@/src/theme/tokens";
import { Wordmark } from "@/src/components/ui/Logo";
import { LegalFooter } from "@/src/components/shell/LegalFooter";
import { NAV_ITEMS } from "./TabBar";
import { Icon } from "@/src/components/ui/Icon";

type Props = {
  activeRoute: string;
  onNavigate: (route: string) => void;
  onUpgrade: () => void;
  isPro: boolean;
};

/** Persistent dashboard navigation. Tablet landscape and desktop only. */
export function Sidebar({ activeRoute, onNavigate, onUpgrade, isPro }: Props) {
  return (
    <View style={styles.root}>
      <Wordmark size={38} caption="Mindfulness OS" style={styles.brand} />

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = item.name === activeRoute;
          return (
            <Pressable
              key={item.name}
              onPress={() => onNavigate(item.name)}
              style={({ hovered, pressed }: any) => [
                styles.navItem,
                (hovered || pressed) && !active && styles.navItemHover,
                active && styles.navItemActive,
              ]}
            >
              {active ? <View style={styles.activeBar} /> : null}
              <Icon
                name={active ? item.iconActive : item.icon}
                size={19}
                color={active ? colors.gold : colors.textSecondary}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {!isPro ? (
        <Pressable
          onPress={onUpgrade}
          style={({ hovered }: any) => [styles.promo, hovered && { borderColor: colors.goldEdge }]}
        >
          <View style={styles.promoTitleRow}>
            <Icon name="crown" size={16} color={colors.goldBright} />
            <Text style={styles.promoTitle}>Bodhi Pro</Text>
          </View>
          <Text style={styles.promoBody}>
            Unlock every journey, world and unlimited guidance.
          </Text>
          <View style={styles.promoCta}>
            <Text style={styles.promoCtaText}>Upgrade</Text>
            <Icon name="arrowRight" size={14} color={colors.gold} />
          </View>
        </Pressable>
      ) : null}

      <LegalFooter compact />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: layout.sidebarWidth,
    paddingHorizontal: space.lg,
    paddingVertical: space["2xl"],
    borderRightWidth: 1,
    borderRightColor: colors.hairline,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  brand: { paddingHorizontal: space.sm, marginBottom: space["3xl"] },

  nav: { gap: 2 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
  },
  navItemHover: { backgroundColor: "rgba(255,255,255,0.04)" },
  navItemActive: { backgroundColor: colors.goldSoft },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 10,
    bottom: 10,
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.gold,
  },
  navLabel: { ...type.body, color: colors.textSecondary },
  navLabelActive: { color: colors.text, fontFamily: type.headline.fontFamily },

  promo: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    padding: space.lg,
    gap: space.sm,
  },
  promoTitle: { ...type.headline, color: colors.goldBright },
  promoTitleRow: { flexDirection: "row", alignItems: "center", gap: space.xs },
  promoBody: { ...type.bodySmall, color: colors.textMuted },
  promoCta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: space.xs },
  promoCtaText: { ...type.label, color: colors.gold },
});
