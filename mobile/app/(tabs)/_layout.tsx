import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs, usePathname, useRouter } from "expo-router";
import { TabBar, NAV_ITEMS } from "@/src/components/shell/TabBar";
import { Sidebar } from "@/src/components/shell/Sidebar";
import { MiniPlayer } from "@/src/components/shell/MiniPlayer";
import { useEntitlement } from "@/src/providers/EntitlementProvider";
import { colors } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";

export default function TabLayout() {
  const l = useLayout();
  const router = useRouter();
  const pathname = usePathname();
  const { isPro } = useEntitlement();

  const activeRoute =
    NAV_ITEMS.find((item) =>
      item.name === "index" ? pathname === "/" : pathname.startsWith(`/${item.name}`)
    )?.name ?? "index";

  return (
    <View style={styles.root}>
      {l.isDesktop ? (
        <Sidebar
          activeRoute={activeRoute}
          isPro={isPro}
          onUpgrade={() => router.push("/paywall")}
          onNavigate={(route) => router.push(route === "index" ? "/" : (`/${route}` as never))}
        />
      ) : null}

      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.bg },
          }}
          tabBar={(props) => (l.isDesktop ? null : <TabBar {...props} />)}
        >
          {NAV_ITEMS.map((item) => (
            <Tabs.Screen key={item.name} name={item.name} options={{ title: item.label }} />
          ))}
        </Tabs>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: colors.bg },
  content: { flex: 1 },
});
