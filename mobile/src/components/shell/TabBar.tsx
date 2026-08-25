import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, layout, space, type } from "@/src/theme/tokens";
import { Icon, type IconName } from "@/src/components/ui/Icon";

export const NAV_ITEMS: {
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
}[] = [
  { name: "index", label: "Today", icon: "buddha", iconActive: "buddha" },
  { name: "explore", label: "Explore", icon: "compass", iconActive: "compassActive" },
  { name: "ai", label: "Buddha", icon: "om", iconActive: "om" },
  { name: "library", label: "Library", icon: "bookmark", iconActive: "bookmarkActive" },
  { name: "account", label: "You", icon: "person", iconActive: "personActive" },
];

/** iOS-style translucent tab bar. Phone only. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom }]}>
      {Platform.OS === "web" ? (
        <View style={[StyleSheet.absoluteFill, styles.webBlur]} />
      ) : (
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.hairline} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const item = NAV_ITEMS.find((n) => n.name === route.name);
          if (!item) return null;
          const focused = state.index === index;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={({ pressed }) => [styles.tab, pressed && { opacity: 0.6 }]}
            >
              <Icon
                name={focused ? item.iconActive : item.icon}
                size={23}
                color={focused ? colors.gold : colors.textMuted}
              />
              <Text style={[styles.label, focused && { color: colors.gold }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  webBlur: { backgroundColor: "rgba(10,9,15,0.92)" },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  row: { flexDirection: "row", height: layout.tabBarHeight },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  label: { ...type.caption, fontSize: 10, letterSpacing: 0.2, color: colors.textMuted },
});
