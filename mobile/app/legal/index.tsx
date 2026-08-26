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
import { LEGAL_DOCS, LEGAL_UPDATED } from "@/src/lib/legal-content";
import { colors, gradients, radius, space, tint, type } from "@/src/theme/tokens";

const CARDS = [
  {
    doc: LEGAL_DOCS.privacy,
    blurb: "What we collect, what we never do with it, and how to exercise your GDPR rights.",
  },
  {
    doc: LEGAL_DOCS.terms,
    blurb: "Membership, payments, cancellation, and how our content may be used.",
  },
  {
    doc: LEGAL_DOCS.disclaimer,
    blurb: "Wellness content is not medical care — plus crisis resources if you need them now.",
  },
];

export default function LegalIndexScreen() {
  const dismiss = useDismiss();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const l = useLayout();

  React.useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.title = "Legal & Privacy — LofiBuddha";
    }
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[tint(colors.gold, 0.14), "transparent"]}
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
          <Text style={styles.script}>धर्म</Text>
          <Text style={styles.kicker}>LEGAL</Text>
          <Text style={styles.title}>Legal & Privacy</Text>
          <Text style={styles.subtitle}>
            Plain language, no dark patterns. Everything we owe you in writing, in one place.
          </Text>
          <Text style={styles.updated}>Last updated: {LEGAL_UPDATED}</Text>

          <View style={[styles.cards, l.isMedium && styles.cardsRow]}>
            {CARDS.map(({ doc, blurb }) => (
              <Pressable
                key={doc.slug}
                onPress={() => router.push(`/legal/${doc.slug}` as never)}
                style={({ hovered }: any) => [
                  styles.card,
                  l.isMedium && { flex: 1 },
                  hovered && { borderColor: tint(doc.accent, 0.45) },
                ]}
              >
                <LinearGradient
                  colors={[tint(doc.accent, 0.14), "transparent"]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.cardScript, { color: doc.accent }]}>{doc.script}</Text>
                <Text style={styles.cardTitle}>{doc.title}</Text>
                <Text style={styles.cardBlurb}>{blurb}</Text>
                <View style={styles.cardCta}>
                  <Text style={[styles.cardCtaText, { color: doc.accent }]}>Read</Text>
                  <Icon name="arrowRight" size={14} color={doc.accent} />
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.contact}>
            <Text style={styles.contactTitle}>Questions?</Text>
            <Text style={styles.contactBody}>
              Privacy requests, legal questions, or anything unclear — one address, a real human.
            </Text>
            <View style={styles.contactRow}>
              <Icon name="mail" size={15} color={colors.gold} />
              <Text style={styles.contactValue}>contact@lofibuddha.com</Text>
            </View>
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
  inner: { width: "100%", maxWidth: 900 },

  script: { ...type.devanagari, color: colors.gold, letterSpacing: 3, opacity: 0.9 },
  kicker: { ...type.caption, color: colors.gold, letterSpacing: 3, marginTop: space.xs },
  title: { ...type.hero, color: colors.text, marginTop: space.sm },
  subtitle: {
    ...type.body,
    color: colors.textSecondary,
    marginTop: space.md,
    lineHeight: 24,
    maxWidth: 560,
  },
  updated: { ...type.bodySmall, color: colors.textMuted, marginTop: space.sm },

  cards: { gap: space.lg, marginTop: space["3xl"] },
  cardsRow: { flexDirection: "row", alignItems: "stretch" },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    padding: space.xl,
    gap: space.sm,
    overflow: "hidden",
  },
  cardScript: { ...type.devanagari, letterSpacing: 2, opacity: 0.9 },
  cardTitle: { ...type.section, color: colors.text, marginTop: space.xs },
  cardBlurb: { ...type.bodySmall, color: colors.textSecondary, lineHeight: 20, flex: 1 },
  cardCta: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.md },
  cardCtaText: { ...type.label },

  contact: {
    marginTop: space["4xl"],
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    gap: space.sm,
  },
  contactTitle: { ...type.section, color: colors.text },
  contactBody: { ...type.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.xs },
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
