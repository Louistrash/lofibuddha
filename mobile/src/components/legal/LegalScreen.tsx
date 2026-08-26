import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/src/components/ui/Icon";
import { IconButton } from "@/src/components/ui/Button";
import { LegalFooter } from "@/src/components/shell/LegalFooter";
import { useDismiss } from "@/src/lib/useDismiss";
import { useLayout } from "@/src/theme/useLayout";
import { colors, gradients, layout, radius, space, tint, type } from "@/src/theme/tokens";
import type { LegalBlock, LegalDoc } from "@/src/lib/legal-content";

/** Renders inline **bold** without pulling in a markdown dependency. */
function Rich({ text, style, bold }: { text: string; style?: any; bold?: any }) {
  const parts = text.split("**");
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={bold}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

function Block({ block, accent }: { block: LegalBlock; accent: string }) {
  if (block.kind === "h3") {
    return <Text style={styles.h3}>{block.text}</Text>;
  }

  if (block.kind === "list") {
    return (
      <View style={styles.list}>
        {block.items.map((item, i) => (
          <View key={i} style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: accent }]} />
            <Rich text={item} style={styles.listText} bold={styles.strong} />
          </View>
        ))}
      </View>
    );
  }

  if (block.kind === "notice") {
    return (
      <View style={[styles.notice, { borderColor: tint(accent, 0.35) }]}>
        <LinearGradient colors={[tint(accent, 0.12), "transparent"]} style={StyleSheet.absoluteFill} />
        <Icon name="alert" size={16} color={accent} />
        <Rich text={block.text} style={styles.noticeText} bold={styles.strong} />
      </View>
    );
  }

  return <Rich text={block.text} style={styles.p} bold={styles.strong} />;
}

const TABS: { slug: LegalDoc["slug"]; label: string }[] = [
  { slug: "privacy", label: "Privacy" },
  { slug: "terms", label: "Terms" },
  { slug: "disclaimer", label: "Disclaimer" },
];

export function LegalScreen({ doc }: { doc: LegalDoc }) {
  const dismiss = useDismiss();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const l = useLayout();

  // Keep the browser tab title meaningful on web without a separate head config.
  React.useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title = `${doc.title} — LofiBuddha`;
    }
  }, [doc.title]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[tint(doc.accent, 0.16), "transparent"]}
        style={styles.halo}
        pointerEvents="none"
      />

      <View style={[styles.close, { top: insets.top + space.md }]}>
        <IconButton icon="back" onPress={() => dismiss()} accessibilityLabel="Back" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + space["5xl"],
            paddingBottom: insets.bottom + space["4xl"],
            paddingHorizontal: l.gutter,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <Text style={[styles.script, { color: doc.accent }]}>{doc.script}</Text>
          <Text style={[styles.kicker, { color: doc.accent }]}>{doc.kicker}</Text>
          <Text style={styles.title}>{doc.title}</Text>
          <Text style={styles.updated}>Last updated: {doc.updated}</Text>

          <Rich text={doc.intro} style={styles.intro} bold={styles.strong} />

          {/* Sibling documents stay one tap away — never a dead end. */}
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const active = t.slug === doc.slug;
              return (
                <Pressable
                  key={t.slug}
                  onPress={() => router.replace(`/legal/${t.slug}` as never)}
                  disabled={active}
                  style={({ hovered }: any) => [
                    styles.tab,
                    active && { backgroundColor: tint(doc.accent, 0.16), borderColor: tint(doc.accent, 0.4) },
                    hovered && !active && { borderColor: colors.hairlineStrong },
                  ]}
                >
                  <Text style={[styles.tabText, active && { color: doc.accent }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {doc.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.h2}>{section.title}</Text>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} accent={doc.accent} />
              ))}
            </View>
          ))}

          <View style={styles.contact}>
            <Text style={styles.contactTitle}>Contact</Text>
            {doc.contact.map((c) => (
              <View key={c.label} style={styles.contactRow}>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => dismiss()}
            style={({ hovered }: any) => [styles.backHome, hovered && { borderColor: colors.hairlineStrong }]}
          >
            <Icon name="back" size={15} color={colors.textSecondary} />
            <Text style={styles.backHomeText}>Back to LofiBuddha</Text>
          </Pressable>

          <LegalFooter compact />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  halo: { position: "absolute", top: 0, left: 0, right: 0, height: 340 },
  close: { position: "absolute", left: space.lg, zIndex: 10 },
  scroll: { alignItems: "center" },
  inner: { width: "100%", maxWidth: 720 },

  script: { ...type.devanagari, letterSpacing: 3, opacity: 0.9 },
  kicker: { ...type.caption, letterSpacing: 3, marginTop: space.xs },
  title: { ...type.hero, color: colors.text, marginTop: space.sm },
  updated: { ...type.bodySmall, color: colors.textMuted, marginTop: space.sm },
  intro: { ...type.body, color: colors.textSecondary, marginTop: space.xl, lineHeight: 24 },

  tabs: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space["2xl"] },
  tab: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
  },
  tabText: { ...type.label, color: colors.textSecondary },

  section: { marginTop: space["3xl"], gap: space.md },
  h2: { ...type.section, color: colors.text },
  h3: { ...type.headline, color: colors.text, marginTop: space.sm },
  p: { ...type.body, color: colors.textSecondary, lineHeight: 24 },
  strong: { color: colors.text, fontFamily: "Manrope_600SemiBold" },

  list: { gap: space.sm },
  listItem: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  bullet: { width: 5, height: 5, borderRadius: 3, marginTop: 9 },
  listText: { ...type.body, color: colors.textSecondary, flex: 1, lineHeight: 24 },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: space.lg,
    overflow: "hidden",
    marginTop: space.xs,
  },
  noticeText: { ...type.bodySmall, color: colors.text, flex: 1, lineHeight: 21 },

  contact: {
    marginTop: space["4xl"],
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    gap: space.md,
  },
  contactTitle: { ...type.section, color: colors.text },
  contactRow: { flexDirection: "row", justifyContent: "space-between", gap: space.md },
  contactLabel: { ...type.label, color: colors.textMuted },
  contactValue: { ...type.label, color: colors.gold },

  backHome: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space["3xl"],
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
  },
  backHomeText: { ...type.label, color: colors.textSecondary },
});

export { layout };
