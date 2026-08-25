# LofiBuddha Expo (web · iOS · Android)

**Expo SDK 54** — compatible with Expo Go from the App Store / Play Store.

India LED Gold consumer app. Next.js in the repo root remains API + CMS + media host.

## Run

```bash
cd mobile
cp .env.example .env
npm start
```

Scan the QR code with **Expo Go**.

- Web: `npm run web`
- iOS simulator: `npm run ios`
- Android: `npm run android`

## Env

- `EXPO_PUBLIC_API_URL` — Next backend (default `https://lofibuddha.com`)
- Firebase `EXPO_PUBLIC_FIREBASE_*` — same project as web
- RevenueCat keys for native IAP

## EAS

```bash
npx eas-cli build --platform all --profile preview
```

## Shared catalogs

`@lofibuddha/shared` → `../packages/shared` (experiences, sounds, music, meditations, focus guides).
