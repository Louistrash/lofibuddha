# Task: Create & verify in-app purchases for LofiBuddha (App Store + Play Store)

You are setting up **in-app purchases (subscriptions)** for **LofiBuddha**, a
mindfulness/meditation app. Work against BOTH stores and verify your work.

## App details
- App name: LofiBuddha
- Android package: `com.lofibuddha.app`
- iOS bundle ID: `com.lofibuddha.app`
- App Store Connect app ID: `6809886537`
- Apple team ID: `QR69NLYHRX`
- Apple Developer account: `patricknieborg@me.com`

## Subscriptions (2 tiers — monthly, auto-renewing)
| Tier | Product ID | Price (EUR) | Price (USD) | Unlocks |
|------|-----------|-------------|-------------|---------|
| Mindful | `mindful_monthly` | €1.99 | $1.99 | Workshops (multi-night series), premium meditations, soundtracks |
| Enlightened | `enlightened_monthly` | €4.99 | $4.99 | Everything (courses, workshops, all premium content) |

## Part A — App Store (iOS)
1. Create a **subscription group** named `LofiBuddha Premium`.
2. Create **2 auto-renewable subscriptions** inside that group:
   - `mindful_monthly` — €1.99 (and $1.99 USD)
   - `enlightened_monthly` — €4.99 (and $4.99 USD)
3. Configure the price for **EUR and USD** at minimum.
4. Add localizations (English primary, Dutch secondary).
5. Both subscriptions at **level 1** in the group.

## Part B — Google Play (Android)
1. Create **2 subscriptions** (Google Play Billing):
   - `mindful_monthly` — base plan (auto-renewing monthly), €1.99 / $1.99
   - `enlightened_monthly` — base plan (auto-renewing monthly), €4.99 / $4.99
2. Each gets a **base plan** with monthly auto-renewal.

## Part C — Verify (do not skip)
1. Confirm both products exist in BOTH stores.
2. Confirm product IDs are exactly `mindful_monthly` and `enlightened_monthly`.
3. Confirm prices are exactly €1.99 and €4.99 (EUR + USD).
4. Report back: final product IDs, price points, store status, and any
   warnings/errors encountered.

## Hard constraints
- Product IDs MUST be exactly: `mindful_monthly`, `enlightened_monthly`.
- Prices MUST be exactly €1.99 and €4.99 (with $1.99 / $4.99 USD).
- Do NOT create any additional products or change app metadata.

## Credentials (already on the server at /opt/data/bodhi-dashboard)
- **Google Play:** service account JSON at `secrets/google-play-service-account.json`
  (package `com.lofibuddha.app`, uses the edit-flow; see `scripts/play-api.py`).
- **App Store Connect API:** key ID + issuer ID + `.p8` private key (in `secrets/`).
- Apple credentials in `mobile/eas.json` (`appleId`, `appleTeamId`, `ascAppId`).

## Note on tier-gating (for reference — do NOT change code, just report)
- `workshops` require the **Mindful** tier or higher (`isPro`).
- `courses` require the **Enlightened** tier (`tier === "enlightened"`).
