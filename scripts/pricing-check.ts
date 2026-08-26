import {
  currencyFromClientHints,
  countryFromLocale,
  formatPrice,
  TIER_AMOUNTS,
} from "../packages/shared/src/pricing";

const cases: [string | null, string | null][] = [
  ["nl-NL", "Europe/Amsterdam"],
  ["en-US", "UTC"],
  ["en-GB", "Europe/London"],
  ["de-DE", "Europe/Berlin"],
  ["fr-FR", "Europe/Paris"],
  ["en", "Europe/Amsterdam"],
  ["en", "America/Chicago"],
  ["es-MX", "America/Mexico_City"],
  [null, null],
];

console.log("locale   tz                    country  cur   mindful    enlightened");
console.log("-".repeat(70));
for (const [locale, timeZone] of cases) {
  const cur = currencyFromClientHints({ locale, timeZone });
  const cc = countryFromLocale(locale) ?? "-";
  const m = formatPrice(TIER_AMOUNTS.mindful[cur], cur, locale);
  const e = formatPrice(TIER_AMOUNTS.enlightened[cur], cur, locale);
  console.log(
    String(locale).padEnd(8),
    String(timeZone).padEnd(21),
    cc.padEnd(8),
    cur.padEnd(5),
    m.padEnd(10),
    e
  );
}
