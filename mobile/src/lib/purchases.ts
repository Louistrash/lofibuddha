import { Platform } from "react-native";

export const ENTITLEMENT_ID = "bodhi_pro";
export const OFFERING_TIERS = ["zen", "mindful", "enlightened"] as const;

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "";

type PurchasesModule = typeof import("react-native-purchases");

let Purchases: PurchasesModule["default"] | null = null;

async function loadPurchases() {
  if (Platform.OS === "web") return null;
  if (Purchases) return Purchases;
  const mod = await import("react-native-purchases");
  Purchases = mod.default;
  return Purchases;
}

export async function configurePurchases(appUserId?: string | null) {
  const P = await loadPurchases();
  if (!P) return;
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) return;
  P.setLogLevel(modLogLevel(P));
  P.configure({ apiKey, appUserID: appUserId || undefined });
}

function modLogLevel(P: PurchasesModule["default"]) {
  return (P as any).LOG_LEVEL?.INFO ?? 1;
}

export async function getOfferings() {
  const P = await loadPurchases();
  if (!P || !(Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY)) return null;
  try {
    return await P.getOfferings();
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: any) {
  const P = await loadPurchases();
  if (!P) throw new Error("Purchases unavailable on web");
  return P.purchasePackage(pkg);
}

export async function restorePurchases() {
  const P = await loadPurchases();
  if (!P) return null;
  return P.restorePurchases();
}

export async function hasProEntitlement(): Promise<boolean> {
  const P = await loadPurchases();
  if (!P) return false;
  try {
    const info = await P.getCustomerInfo();
    return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
  } catch {
    return false;
  }
}
