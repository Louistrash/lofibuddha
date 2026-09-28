# LofiBuddha — iOS & Android build/submit (EAS)

Laatst bijgewerkt: 2026-09-28

## Samenvatting

Builds lopen via **EAS** (Expo cloud build-service). De trigger gebeurt vanaf een
machine met EAS CLI + login — **niet** vanaf de productie-server (daar staat geen
EAS CLI). Deze doc is er zodat de IDE/manager de build vanaf de repo kan oppakken.

## Waarom nu een nieuwe build nodig is

Er zijn nieuwe yoga-geleide audio's toegevoegd:

- 10 yoga pose-guides in `packages/shared/src/meditations.ts`
- 10 yoga experiences in `packages/shared/src/experiences.ts`
- `public/data/courses.json`: yoga-modules gekoppeld aan de bijpassende experiences

De **website** (lofibuddha.com) is al gedeployed. De **native app** (iOS/Android)
compileert `experiences.ts` in de app-bundle en moet daarom opnieuw gebouwd worden
om deze content te laden.

## Vereisten op de build-machine (eenmalig)

1. EAS CLI: `npm i -g eas-cli`
2. Inloggen: `eas login` (of exporteer `EXPO_TOKEN`)
3. iOS signing: geldige App Store Connect API key (`.p8`) — zie credentials hieronder
4. Android: Google Play service account JSON

## Build commando's (draaien vanuit `mobile/`)

```bash
# Preview (intern, beide platforms)
npx eas-cli build --platform all --profile preview

# Productie per platform
npx eas-cli build --platform ios --profile production
npx eas-cli build --platform android --profile production

# Submits
npx eas-cli submit --platform ios --profile production
npx eas-cli submit --platform android --profile production
```

## Config-bestanden

- `mobile/eas.json` — build profielen (`development` / `preview` / `production`) + submit-config
- `mobile/app.json` — Expo app config
  - EAS projectId: `df92ceb2-e009-411c-a53f-794e0f9474ba`
  - EAS owner: `lofibuddha`

## Credentials (in `secrets/` — NIET in git, `.gitignore` regel `secrets/`)

| Doel | Bestand | Status |
|------|---------|--------|
| iOS ASC API key | `secrets/asc-key.p8` (key id `6RU3BF3VAK`, issuer `69a6de89-bb66-47e3-e053-5b8c7c11a4d1`, team `QR69NLYHRX`) | aanwezig, maar gaf eerder **401 NOT_AUTHORIZED** → verifieer/regeneer in App Store Connect |
| Android Play SA | `secrets/google-play-service-account.json` (package `com.lofibuddha.app`) | aanwezig |

## Actiepunten vóór een productie-build

- [ ] **iOS key**: verifieer/regeneer `asc-key.p8` in App Store Connect
      (*Users & Access → Integrations → App Store Connect API*). De oude key gaf 401.
- [ ] **Android SA pad**: `eas.json` verwijst naar `./google-service-account.json`
      (relatief t.o.v. `mobile/`), maar het bestand staat in `secrets/google-play-service-account.json`.
      Kopieer het naar `mobile/` of pas het pad in `eas.json` aan.
- [ ] **Login**: `eas login` op de build-machine (EAS owner `lofibuddha`).

## App-identifiers & submit-metadata (al geconfigureerd)

- **App Store Connect**: app id `6809886537`, appleId `patricknieborg@me.com`, team `QR69NLYHRX`
- **Google Play**: package `com.lofibuddha.app`, productie-track `draft`
- Store-metadata + App Review polish zijn al via de IDE gecommit
  (zie git commit *"Ship store metadata, legal links, and paywall polish for App Review"* — auteur Patrick).
- Abonnementen (IAP) zijn al gedocumenteerd in `docs/iap-manager-prompt.md`.

## Productie-server (ter referentie)

- De server (`lofibuddha.com`) deelt enkel API/data/audio via `/api/*` + de Expo **web**-app (`mobile/dist`).
- Native builds draaien elders; deze server hoeft géén EAS CLI.
