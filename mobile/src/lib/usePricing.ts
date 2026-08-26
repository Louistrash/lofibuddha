import { useMemo } from "react";
import { Platform, NativeModules } from "react-native";
import {
  DEFAULT_CURRENCY,
  currencyFromClientHints,
  formatPrice,
  type Currency,
  type PaidTier,
  TIER_AMOUNTS,
} from "@lofibuddha/shared";

/** Device locale, e.g. "nl-NL". Drives notation only, never the currency. */
function deviceLocale(): string | null {
  if (Platform.OS === "web") {
    if (typeof navigator === "undefined") return null;
    return navigator.language || (navigator as any).languages?.[0] || null;
  }
  const ios = NativeModules.SettingsManager?.settings?.AppleLocale
    || NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];
  const android = NativeModules.I18nManager?.localeIdentifier;
  return (ios || android || null)?.replace("_", "-") ?? null;
}

function deviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/**
 * Country decides the currency, language decides the notation.
 * Returns the hints so checkout can send them for server-side resolution —
 * the client's opinion is a hint, never the authority.
 */
export function usePricing() {
  return useMemo(() => {
    const locale = deviceLocale();
    const timeZone = deviceTimeZone();
    const currency: Currency = currencyFromClientHints({ locale, timeZone });

    return {
      locale,
      timeZone,
      currency,
      isDefaultCurrency: currency === DEFAULT_CURRENCY,
      /** Formatted price for a paid tier, e.g. "€ 1,99" or "$1.99". */
      price(tier: PaidTier) {
        return formatPrice(TIER_AMOUNTS[tier][currency], currency, locale);
      },
      /** Hints to POST to /api/stripe/checkout. */
      hints: { locale, timeZone },
    };
  }, []);
}
