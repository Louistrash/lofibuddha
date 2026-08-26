/**
 * Pricing — one source of truth for amounts, currency resolution and formatting.
 *
 * Two rules, deliberately separated:
 *  - COUNTRY decides the currency you are charged in (Stripe convention, and
 *    what the payment networks expect).
 *  - LANGUAGE decides only how that amount is written (€1,99 vs €1.99).
 *
 * Amounts are real price points per currency, never FX conversions, so the
 * numbers match the `currency_options` configured on the Stripe prices.
 */

export const CURRENCIES = ["eur", "usd"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "eur";

export type PaidTier = "mindful" | "enlightened";

export const TIER_AMOUNTS: Record<PaidTier, Record<Currency, number>> = {
  mindful: { eur: 1.99, usd: 1.99 },
  enlightened: { eur: 4.99, usd: 4.99 },
};

/** Live Stripe price IDs. Each carries currency_options for every currency above. */
export const TIER_PRICE_IDS: Record<PaidTier, string> = {
  mindful: "price_1U8ktSB7GXjClDhqrR3xTq4O",
  enlightened: "price_1U8ktTB7GXjClDhqZxNDBoY5",
};

/**
 * Europe is billed in EUR — not just the eurozone. A UK or Swiss customer
 * expects a euro price from a European service far more than a US dollar one,
 * and it avoids Intl rendering "US$1.99" for en-GB.
 */
const EUR_COUNTRIES = new Set([
  // Eurozone
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT",
  "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
  // Euro-using microstates
  "AD", "MC", "ME", "SM", "VA", "XK",
  // Rest of Europe / EEA
  "AL", "BA", "BG", "BY", "CH", "CZ", "DK", "FO", "GB", "GG", "GI", "HU",
  "IM", "IS", "JE", "LI", "MD", "MK", "NO", "PL", "RO", "RS", "SE", "UA",
]);

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

/** Country (ISO 3166-1 alpha-2) -> the currency we charge in. */
export function currencyForCountry(country?: string | null): Currency {
  if (!country) return DEFAULT_CURRENCY;
  const cc = country.trim().toUpperCase();
  if (EUR_COUNTRIES.has(cc)) return "eur";
  return "usd";
}

/** "nl-NL" -> "NL", "en" -> null. Region subtag only; a bare language says nothing about country. */
export function countryFromLocale(locale?: string | null): string | null {
  if (!locale) return null;
  const match = locale.match(/^[A-Za-z]{2,3}[-_]([A-Za-z]{2})\b/);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Timezone is a better country signal than language when the locale carries no
 * region — a browser set to plain "en" still reports Europe/Amsterdam.
 */
/** IANA zones whose region maps to euro billing. */
const EUR_TZ_REGIONS = ["Europe/", "Atlantic/Canary", "Atlantic/Madeira", "Atlantic/Faroe"];

export function currencyFromClientHints(hints: {
  country?: string | null;
  locale?: string | null;
  timeZone?: string | null;
}): Currency {
  if (hints.country) return currencyForCountry(hints.country);

  const fromLocale = countryFromLocale(hints.locale);
  if (fromLocale) return currencyForCountry(fromLocale);

  const tz = hints.timeZone?.trim();
  if (tz) {
    if (EUR_TZ_REGIONS.some((r) => tz.startsWith(r))) return "eur";
    // A resolved zone outside Europe is a real signal — "en" in America/Chicago
    // must not fall back to the European default.
    if (tz.includes("/")) return "usd";
  }

  return DEFAULT_CURRENCY;
}

/**
 * Formats using the reader's locale so notation follows the language
 * (nl-NL -> "€ 1,99", en-US -> "$1.99") while the currency stays whatever the
 * customer is actually charged.
 */
export function formatPrice(amount: number, currency: Currency, locale?: string | null): string {
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      // Plain "$"/"€" — the default would render "US$1.99" for en-GB.
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = currency === "usd" ? "$" : "€";
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export function tierPrice(tier: PaidTier, currency: Currency, locale?: string | null): string {
  return formatPrice(TIER_AMOUNTS[tier][currency], currency, locale);
}
