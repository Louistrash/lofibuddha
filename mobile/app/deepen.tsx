import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/providers/AuthProvider";
import { useEntitlement } from "@/src/providers/EntitlementProvider";
import { apiFetch } from "@/src/lib/api";
import { getOfferings, purchasePackage, restorePurchases } from "@/src/lib/purchases";
import { Button, IconButton } from "@/src/components/ui/Button";
import { LegalFooter } from "@/src/components/shell/LegalFooter";
import { colors, gradients, layout, radius, shadow, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";
import { useDismiss } from "@/src/lib/useDismiss";
import { Mandala } from "@/src/components/content/Mandala";
import { usePricing } from "@/src/lib/usePricing";

const TIERS = [
  {
    id: "zen",
    name: "Zen",
    price: "Free",
    period: "",
    accent: colors.jade,
    perks: ["Daily practice", "Core soundscapes", "Buddha AI, gently limited"],
  },
  {
    id: "mindful",
    name: "Mindful",
    priceTier: "mindful" as const,
    period: "/month",
    accent: colors.gold,
    featured: true,
    perks: [
      "Every practice and soundscape",
      "Immersive worlds",
      "Guided drip journey",
      "Unlimited Buddha AI",
    ],
  },
  {
    id: "enlightened",
    name: "Enlightened",
    priceTier: "enlightened" as const,
    period: "/month",
    accent: colors.lotus,
    perks: ["Everything in Mindful", "Full course library", "Early access to new worlds", "Priority support"],
  },
] as const;

export default function PaywallScreen() {
  const { user } = useAuth();
  const { isPro, refresh } = useEntitlement();
  const router = useRouter();
  const dismiss = useDismiss();
  const l = useLayout();
  const insets = useSafeAreaInsets();
  const pricing = usePricing();

  const [busy, setBusy] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    getOfferings().then((o) => setPackages(o?.current?.availablePackages ?? []));
  }, []);

  async function subscribe(tier: string) {
    if (tier === "zen") {
      dismiss();
      return;
    }
    setBusy(tier);
    try {
      if (Platform.OS === "web") {
        if (!user?.email) {
          Alert.alert("Sign in required", "Create an account first to subscribe.");
          return;
        }
        const res = await apiFetch(
          "/api/stripe/checkout",
          { method: "POST", body: JSON.stringify({ tier, email: user.email, ...pricing.hints }) },
          user.uid
        );
        const data = await res.json();
        if (data?.url) await WebBrowser.openBrowserAsync(data.url);
        else Alert.alert("Checkout", data?.error || "No checkout URL returned.");
        return;
      }

      const pkg =
        packages.find((p) => String(p.identifier).toLowerCase().includes(tier)) ?? packages[0];
      if (!pkg) {
        Alert.alert(
          "Store not configured",
          "Set EXPO_PUBLIC_REVENUECAT_IOS_KEY / ANDROID_KEY and publish your store products."
        );
        return;
      }
      await purchasePackage(pkg);
      if (user?.uid) {
        await apiFetch(
          "/api/entitlements/sync",
          {
            method: "POST",
            body: JSON.stringify({ uid: user.uid, email: user.email, tier, source: "revenuecat" }),
          },
          user.uid
        );
      }
      await refresh();
    } catch (e: any) {
      if (!e?.userCancelled) Alert.alert("Purchase failed", e?.message || "Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />
      {/* Mandala backdrop: one wide and slow behind the tiers, one deeper below
          in lotus so the page has layers instead of a flat wash. */}
      <View style={styles.mandalaTop} pointerEvents="none">
        <Mandala
          size={l.isMedium ? 900 : 560}
          opacity={0.13}
          speed={0.35}
          intensity={0.4}
        />
      </View>
      <View style={styles.mandalaBottom} pointerEvents="none">
        <Mandala
          size={l.isMedium ? 620 : 420}
          opacity={0.07}
          speed={0.22}
          intensity={0.2}
          detail="simple"
          colors={[colors.lotus, colors.goldDeep, colors.gold]}
        />
      </View>

      <LinearGradient
        colors={[tint(colors.gold, 0.18), "transparent"]}
        style={styles.halo}
        pointerEvents="none"
      />

      <View style={[styles.close, { top: insets.top + space.md }]}>
        <IconButton icon="close" onPress={() => dismiss()} accessibilityLabel="Close" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + space["4xl"], paddingBottom: insets.bottom + space["4xl"], paddingHorizontal: l.gutter },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>बोधि · BODHI PRO</Text>
        <Text style={styles.title}>Choose your depth</Text>
        <Text style={styles.subtitle}>
          One membership, every practice. Cancel whenever the path changes.
        </Text>

        {isPro ? (
          <View style={styles.active}>
            <Icon name="checkCircle" size={18} color={colors.jade} />
            <Text style={styles.activeText}>Your membership is active</Text>
          </View>
        ) : null}

        <View style={[styles.tiers, l.isMedium && styles.tiersRow]}>
          {TIERS.map((t) => (
            <View
              key={t.id}
              style={[
                styles.tier,
                l.isMedium && { flex: 1 },
                "featured" in t && t.featured && { borderColor: tint(t.accent, 0.45) },
              ]}
            >
              {"featured" in t && t.featured ? (
                <LinearGradient
                  colors={[tint(t.accent, 0.16), "transparent"]}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}

              <View style={styles.tierHead}>
                <Text style={[styles.tierName, { color: t.accent }]}>{t.name}</Text>
                {"featured" in t && t.featured ? (
                  <View style={[styles.tag, { backgroundColor: tint(t.accent, 0.18) }]}>
                    <Text style={[styles.tagText, { color: t.accent }]}>MOST CHOSEN</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {"priceTier" in t && t.priceTier ? pricing.price(t.priceTier) : "price" in t ? t.price : ""}
                </Text>
                {t.period ? <Text style={styles.period}>{t.period}</Text> : null}
              </View>

              <View style={styles.perks}>
                {t.perks.map((p) => (
                  <View key={p} style={styles.perk}>
                    <Icon name="check" size={14} color={t.accent} />
                    <Text style={styles.perkText}>{p}</Text>
                  </View>
                ))}
              </View>

              <Button
                label={t.id === "zen" ? "Continue free" : Platform.OS === "web" ? "Subscribe" : "Unlock"}
                variant={t.id === "zen" ? "secondary" : "primary"}
                accent={t.id === "zen" ? undefined : t.accent}
                loading={busy === t.id}
                disabled={!!busy}
                fullWidth
                onPress={() => subscribe(t.id)}
              />
            </View>
          ))}
        </View>

        {Platform.OS !== "web" ? (
          <Pressable
            style={styles.restore}
            onPress={async () => {
              await restorePurchases();
              await refresh();
            }}
          >
            <Text style={styles.restoreText}>Restore purchases</Text>
          </Pressable>
        ) : null}

        <Text style={styles.legal}>
          Payment is charged to your account at confirmation. Subscriptions renew automatically
          unless cancelled at least 24 hours before the period ends.
        </Text>

        <LegalFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  halo: { position: "absolute", top: 0, left: 0, right: 0, height: 380 },
  mandalaTop: { position: "absolute", top: -120, left: 0, right: 0, alignItems: "center" },
  mandalaBottom: { position: "absolute", bottom: -180, right: -140 },
  close: { position: "absolute", right: space.lg, zIndex: 10 },
  scroll: { alignItems: "center" },

  kicker: { ...type.caption, color: colors.gold, letterSpacing: 3 },
  title: { ...type.hero, color: colors.text, marginTop: space.sm, textAlign: "center" },
  subtitle: {
    ...type.body,
    color: colors.textSecondary,
    marginTop: space.md,
    textAlign: "center",
    maxWidth: 460,
  },
  active: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: tint(colors.jade, 0.12),
  },
  activeText: { ...type.label, color: colors.jade },

  tiers: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    gap: space.lg,
    marginTop: space["3xl"],
  },
  tiersRow: { flexDirection: "row", alignItems: "stretch" },
  tier: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    padding: space.xl,
    gap: space.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  tierHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm },
  tierName: { ...type.section },
  tag: { paddingHorizontal: space.md, paddingVertical: 3, borderRadius: radius.pill },
  tagText: { ...type.caption, fontSize: 9 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  price: { ...type.largeTitle, color: colors.text },
  period: { ...type.bodySmall, color: colors.textMuted, marginBottom: 5 },
  perks: { gap: space.sm, flex: 1 },
  perk: { flexDirection: "row", alignItems: "flex-start", gap: space.sm },
  perkText: { ...type.bodySmall, color: colors.textSecondary, flex: 1 },

  restore: { paddingVertical: space.xl },
  restoreText: { ...type.label, color: colors.textMuted },
  legal: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 480,
    marginTop: space.xl,
    lineHeight: 16,
  },
});
