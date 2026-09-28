# IAP Dual-Store Status — Handoff voor Hermes Manager

> **Status update (2026-09-15):** dual-store in-app purchases zijn grotendeels aangelegd. Geen app-code gewijzigd voor gating; alleen store-setup + verify-scripts.

## Doel

Twee maandelijkse abonnementen in Apple App Store Connect én Google Play, gekoppeld aan LofiBuddha Premium:

| Product ID | Prijs | Rol |
|---|---|---|
| `mindful_monthly` | €/$1.99 | basis premium |
| `enlightened_monthly` | €/$4.99 | higher tier |

Lokalisaties: EN + NL. Play: monthly base plans. ASC: subscription group **LofiBuddha Premium**.

## Wat klaar is

### Google Play — KLAAR
- Beide subscriptions aangemaakt/geverifieerd als **ACTIVE** via `scripts/iap-play.mjs` (service account JWT).
- Monthly base plans aanwezig.
- Script kan opnieuw: `node scripts/iap-play.mjs` (ensure/verify).

### App Store Connect — DEELS KLAAR
- App ID: `6809886537`
- Subscription group: **LofiBuddha Premium** (`22387297`)
- Producten:
  - `mindful_monthly` → `6812415576`
  - `enlightened_monthly` → `6812419603`
- Setup via ASC UI (geen lokale `.p8` voor API); helper script: `scripts/iap-asc.mjs` (vereist `.p8` als API-route later).

**Mindful:** prijs NL + equalize, EN+NL localizations, availability (alle landen) — **compleet**.

**Enlightened:** product + prijs + availability + EN/NL localizations — **compleet** (fix was max 55 chars description; te lange copy gaf ASC-fout).

## Open / aandacht

1. **Review screenshots** — per subscription nog uploaden onder Review Information (bestand klaargezet: `secrets/iap-review-screenshot.png`). File-upload via automation geblokkeerd.
2. **Subscription levels** — nog Mindful=1, Enlightened=2. Sleep Enlightened naar level 1 (hoogste tier) of beide op level 1.
3. **Add for Review** — pas na screenshots; eerste group moet mee met app-versie 1.0.
4. **App-code / RevenueCat** — geen code-wijzigingen; gating blijft binary `isPro`.
5. **Scripts:** `scripts/iap-play.mjs`, `scripts/iap-asc.mjs` (descriptions gecorrigeerd ≤55 chars).

## Tier-gating (rapport only — geen code)

Huidige app: binary Pro/niet-Pro. Twee store-SKUs bestaan nu wel; app onderscheidt de tiers nog niet. Volgende stap (als gewenst): RevenueCat offerings/entitlements mappen op `mindful` vs `enlightened` + UI-gating.

## Verificatie

- Play: `node scripts/iap-play.mjs` → beide ACTIVE.
- ASC: group page https://appstoreconnect.apple.com/apps/6809886537/distribution/subscription-groups/22387297 — mindful klaar; enlightened mist localizations.

## Hermes: geen actie verplicht

Dit is een status-handoff. Geen build/deploy gevraagd. Als je verder pakt: eerst enlightened EN+NL localizations in ASC fixen, daarna optioneel levels + RevenueCat tier-wiring.
