import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/src/providers/AuthProvider";
import { PlayerProvider } from "@/src/providers/PlayerProvider";
import { EntitlementProvider } from "@/src/providers/EntitlementProvider";
import { PurchasesBootstrap } from "@/src/components/PurchasesBootstrap";
import { colors, font } from "@/src/theme/tokens";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function Bootstrap() {
  const { user } = useAuth();
  return <PurchasesBootstrap userId={user?.uid} />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <EntitlementProvider>
          <PlayerProvider>
            <Bootstrap />
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.bg },
                headerShadowVisible: false,
                headerTintColor: colors.gold,
                headerTitleStyle: { fontFamily: font.bold, color: colors.text, fontSize: 17 },
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="player/[id]"
                options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom" }}
              />
              <Stack.Screen name="worlds/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
              <Stack.Screen
                name="deepen"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen name="paywall" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: "modal" }} />
              <Stack.Screen name="auth/signup" options={{ headerShown: false, presentation: "modal" }} />
              <Stack.Screen name="legal/index" options={{ headerShown: false }} />
              <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
              <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
              <Stack.Screen name="legal/disclaimer" options={{ headerShown: false }} />
            </Stack>
          </PlayerProvider>
        </EntitlementProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
