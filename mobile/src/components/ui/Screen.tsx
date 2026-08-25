import React from "react";
import { ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradients, layout, space, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { Logo } from "@/src/components/ui/Logo";
import { LegalFooter } from "@/src/components/shell/LegalFooter";

type Props = {
  children: React.ReactNode;
  /** Large title, iOS-style on phone, dashboard heading on desktop. */
  title?: string;
  subtitle?: string;
  /** Rendered to the right of the title on wide screens, below it on phones. */
  actions?: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

/**
 * Page shell. Keeps content within a readable column on desktop and
 * reserves room for the tab bar and mini player on phones.
 */
export function Screen({ children, title, subtitle, actions, scroll = true, contentStyle }: Props) {
  const l = useLayout();
  const insets = useSafeAreaInsets();
  const { experience } = usePlayer();

  const bottomInset =
    (l.isDesktop ? space["3xl"] : layout.tabBarHeight + insets.bottom + space["2xl"]) +
    (experience ? layout.miniPlayerHeight + space.md : 0);

  const header =
    title || actions ? (
      <View style={[styles.header, l.isMedium && styles.headerRow]}>
        <View style={styles.titleGroup}>
          {/* The sidebar already carries the brand, so the mark only anchors titles without one. */}
          {title && !l.isDesktop ? <Logo size={40} /> : null}
          <View style={{ flex: 1 }}>
            {title ? (
              <Text style={[l.isDesktop ? type.largeTitle : type.hero, styles.title]}>{title}</Text>
            ) : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    ) : null;

  const body = (
    <View
      style={[
        styles.content,
        { paddingHorizontal: l.gutter, maxWidth: layout.maxContentWidth },
        contentStyle,
      ]}
    >
      {header}
      {children}
      {/* Desktop shows the legal links in the sidebar instead. */}
      {scroll && !l.isDesktop ? <LegalFooter /> : null}
    </View>
  );

  if (!scroll) {
    return (
      <View style={styles.root}>
        <Backdrop />
        <View style={[styles.centerer, { paddingTop: l.isDesktop ? space["2xl"] : insets.top }]}>
          {body}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Backdrop />
      <ScrollView
        contentContainerStyle={[
          styles.centerer,
          {
            paddingTop: l.isDesktop ? space["2xl"] : insets.top + space.sm,
            paddingBottom: bottomInset,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {body}
      </ScrollView>
    </View>
  );
}

function Backdrop() {
  return (
    <>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[colors.goldSoft, "transparent"]}
        style={styles.halo}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  halo: { position: "absolute", top: 0, left: 0, right: 0, height: 320 },
  centerer: { alignItems: "center", minHeight: "100%" },
  content: { width: "100%" },
  header: { marginBottom: space["2xl"], gap: space.lg },
  headerRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  titleGroup: { flex: 1, flexDirection: "row", alignItems: "center", gap: space.lg },
  title: { color: colors.text },
  subtitle: { ...type.body, color: colors.textSecondary, marginTop: space.sm },
  actions: { flexDirection: "row", alignItems: "center", gap: space.md },
});
