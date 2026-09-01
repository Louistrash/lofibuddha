import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/src/components/ui/Screen";
import { Surface, GroupedList } from "@/src/components/ui/Surface";
import { ListRow, Badge } from "@/src/components/ui/Primitives";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/providers/AuthProvider";
import { useEntitlement } from "@/src/providers/EntitlementProvider";
import { useFavorites } from "@/src/lib/useFavorites";
import { apiFetch } from "@/src/lib/api";
import { restorePurchases } from "@/src/lib/purchases";
import { api, colors, gradients, radius, space, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";

export default function AccountScreen() {
  const { user, signOut, loading } = useAuth();
  const { isPro, tier, dripDay, refresh } = useEntitlement();
  const { favorites, recent } = useFavorites();
  const router = useRouter();
  const l = useLayout();
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    if (!user?.email) return;
    setBusy(true);
    try {
      const res = await apiFetch(
        "/api/stripe/portal",
        { method: "POST", body: JSON.stringify({ email: user.email }) },
        user.uid
      );
      const data = await res.json();
      if (data?.url) await WebBrowser.openBrowserAsync(data.url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="You" subtitle="Membership, preferences and practice">
      {loading ? null : user ? (
        <Surface lit style={[styles.profile, l.isMedium && styles.profileRow]}>
          <LinearGradient colors={gradients.gold} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.displayName || user.email || "M").charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>

          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.name}>{user.displayName || "Member"}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <Badge
                label={isPro ? `Bodhi ${tier ?? "Pro"}` : "Free"}
                accent={isPro ? colors.gold : colors.textSecondary}
              />
              {dripDay != null ? <Badge label={`Day ${dripDay}`} accent={colors.jade} /> : null}
            </View>
          </View>

          <View style={styles.miniStats}>
            <MiniStat value={recent.length} label="Sessions" />
            <MiniStat value={favorites.length} label="Saved" />
          </View>
        </Surface>
      ) : (
        <Surface lit style={styles.guest}>
          <Text style={styles.name}>Practice as a guest</Text>
          <Text style={styles.email}>
            Sign in to sync favorites, chat history and your membership across devices.
          </Text>
          <View style={styles.guestActions}>
            <Button label="Sign in" onPress={() => router.push("/auth/login")} />
            <Button
              label="Create account"
              variant="secondary"
              onPress={() => router.push("/auth/signup")}
            />
          </View>
        </Surface>
      )}

      <GroupedList title="Membership" style={styles.group}>
        <ListRow
          label={isPro ? "Your plan" : "Upgrade to Bodhi Pro"}
          value={isPro ? (tier ?? "Pro") : undefined}
          icon="crown"
          onPress={() => router.push("/deepen")}
        />
        {Platform.OS === "web" && user ? (
          <ListRow
            label="Manage subscription"
            value={busy ? "Opening…" : "Stripe"}
            icon="card"
            iconColor={colors.indigo}
            onPress={openPortal}
          />
        ) : null}
        {Platform.OS !== "web" ? (
          <ListRow
            label="Restore purchases"
            icon="refresh"
            iconColor={colors.indigo}
            onPress={async () => {
              await restorePurchases();
              await refresh();
            }}
          />
        ) : null}
      </GroupedList>

      <GroupedList title="Practice" style={styles.group}>
        <ListRow
          label="Saved practices"
          value={String(favorites.length)}
          icon="heartOutline"
          iconColor={colors.lotus}
          onPress={() => router.push("/library")}
        />
        <ListRow
          label="Recently played"
          value={String(recent.length)}
          icon="clock"
          iconColor={colors.jade}
          onPress={() => router.push("/library")}
        />
      </GroupedList>

      <GroupedList title="About" style={styles.group}>
        <ListRow
          label="Legal & privacy"
          icon="document"
          iconColor={colors.textSecondary}
          onPress={() => WebBrowser.openBrowserAsync(`${api.baseUrl}/legal`)}
        />
        <ListRow
          label="LofiBuddha on the web"
          icon="globe"
          iconColor={colors.textSecondary}
          onPress={() => WebBrowser.openBrowserAsync(api.baseUrl)}
        />
      </GroupedList>

      {user ? (
        <GroupedList style={styles.group}>
          <ListRow label="Sign out" icon="logout" iconColor={colors.danger} destructive onPress={() => signOut()} />
        </GroupedList>
      ) : null}

      <View style={styles.footer}>
        <Icon name="lotus" size={16} color={colors.textMuted} />
        <Text style={styles.footerText}>सर्वे भवन्तु सुखिनः</Text>
      </View>
    </Screen>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: { gap: space.lg, marginBottom: space["2xl"] },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...type.title, color: colors.ink },
  name: { ...type.title, color: colors.text },
  email: { ...type.body, color: colors.textSecondary },
  badgeRow: { flexDirection: "row", gap: space.sm, marginTop: space.xs },
  miniStats: { flexDirection: "row", gap: space["2xl"] },
  miniStat: { alignItems: "center" },
  miniValue: { ...type.title, fontSize: 20, color: colors.goldBright },
  miniLabel: { ...type.caption, color: colors.textMuted },

  guest: { gap: space.md, marginBottom: space["2xl"] },
  guestActions: { flexDirection: "row", gap: space.md, marginTop: space.sm, flexWrap: "wrap" },

  group: { marginBottom: space.xl },
  footer: {
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space["3xl"],
  },
  footerText: { ...type.devanagari, fontSize: 13, color: colors.textMuted },
});
