# LofiBuddha Content API — v1 Blueprint

Status: **ontwerp** (nog niet gebouwd)
Doel: een publieke, versieerde API die (a) de eigen apps voedt én (b) als fundament dient voor een toekomstige **Muse connector** (Meta's personal AI agent).

---

## 1. Waarom een publieke API?

De content bestaat al intern (Next.js API-routes, same-origin, deels achter auth). Een Muse-connector heeft een **publiek, stabiel, gedocumenteerd** oppervlak nodig zodat een externe agent kan:
1. **ontdekken** wat er is (catalogus),
2. **selecteren** op intent ("help me slapen" → slaap-story/soundscape),
3. **afspelen** (audio streamen),
4. **betalen** (premium via Stripe Link) en dan toegang krijgen.

Zelfde laag bedient later ook web-embeds, partners en de eigen mobile-app (één bron van waarheid).

---

## 2. Design-principes

- **REST + JSON**, versieerd via URL-prefix `/v1`.
- **Publieke catalogus** (lezen = gratis, geen auth) → ontdekbaar voor agents.
- **Premium-gating** per item via een `tier`-veld, afgedwongen bij audio.
- **API-key auth** (`X-API-Key`) voor premium + hogere rate limits.
- **Audio via HTTP Range-requests** (MP3) — nodig voor streamen/seek.
- **CORS open** voor catalogus; key vereist voor premium endpoints.

---

## 3. Base URL & auth

| | |
|---|---|
| Base URL | `https://api.lofibuddha.com/v1` |
| Auth | `X-API-Key: <key>` (alleen premium-endpoints) |
| Tiers | `free` · `mindful` (€1.99) · `enlightened` (€4.99) |

Entitlement-model (komt overeen met bestaande gating):
- `free` — losse meditaties, soundscapes, deel van de muziek, artikelen, affirmaties, focus/breathe.
- `mindful` — workshops (multi-night series), slaapverhalen, ademtoolkit.
- `enlightened` — courses + alles.

---

## 4. Endpoints

### Catalogus (publiek, geen auth)

| Methode | Pad | Beschrijving |
|---|---|---|
| GET | `/v1/meditations` | lijst guided meditations |
| GET | `/v1/meditations/{id}` | detail + `audio_url` |
| GET | `/v1/workshops` | premium series (meta, geen segmenttekst) |
| GET | `/v1/workshops/{id}` | detail + sessies |
| GET | `/v1/tracks` | muziek-tracks |
| GET | `/v1/tracks/{id}` | detail + `audio_url` |
| GET | `/v1/sounds` | soundscapes + mixer modes |
| GET | `/v1/courses` | courses (en/nl) |
| GET | `/v1/affirmations/today` | affirmatie van de dag |
| GET | `/v1/articles` | blog-artikelen |
| GET | `/v1/search?q=…&intent=relax|sleep|focus|breathe` | intent-gedreven zoek (voor agents) |

### Audio (streamen — premium achter API-key)

| Methode | Pad | Tier |
|---|---|---|
| GET | `/v1/meditations/{id}/audio` | free |
| GET | `/v1/workshops/{id}/audio` | mindful |
| GET | `/v1/tracks/{id}/audio` | free/mindful |
| GET | `/v1/sounds/{slug}/audio` | free |
| GET | `/v1/courses/{id}/audio` | enlightened |

Audio-antwoord: `Content-Type: audio/mpeg`, **`Accept-Ranges: bytes`**, ondersteunt `Range: bytes=…`.

### Betalen / entitlements (voor de Muse-connector)

| Methode | Pad | Beschrijving |
|---|---|---|
| POST | `/v1/checkout` | maak een Stripe (Link) checkout voor een tier |
| GET | `/v1/entitlements` | (met API-key) wat een gebruiker mag afspelen |

> Voor Muse: de agent draait de betaling via **Stripe Link** (Meta's rail), LofiBuddha krijgt een checkout/session terug en verleent daarna toegang. Het `entitlements`-endpoint beantwoordt simpel "mag deze key `workshops`/`courses`?".

---

## 5. JSON-schema's (gebaseerd op de échte datamodellen)

### Meditation
```json
{
  "id": "ocean-breath",
  "title": "Ocean Breath",
  "description": "Breathe with the tide…",
  "duration": "6 min",
  "durationSeconds": 360,
  "theme": "Breath",
  "tier": "free",
  "background": "off",
  "hasAudio": true,
  "audioUrl": "/v1/meditations/ocean-breath/audio",
  "segments": [ { "text": "…", "pauseAfter": 14 } ]
}
```

### Workshop (premium)
```json
{
  "id": "deep-sleep-reset-1",
  "title": "Deep Sleep Reset — Night 1: Letting Go",
  "description": "…",
  "duration": "10 min",
  "theme": "Deep Sleep Reset",
  "category": "sleep",
  "tier": "mindful",
  "cover": "…",
  "music": "temple-rain",
  "sessions": [ { "id": "…", "title": "…" } ]
}
```

### Track
```json
{
  "id": "temple-rain",
  "title": "Temple Rain",
  "description": "Rain on a temple roof…",
  "durationSeconds": 180,
  "mood": "Sacred",
  "tier": "free",
  "coverUrl": "/images/music-covers/temple-rain.webp",
  "audioUrl": "/v1/tracks/temple-rain/audio"
}
```

### Sound
```json
{ "slug": "gentle-rain", "name": "Gentle Rain", "description": "…", "category": "Water", "tier": "free" }
```

### Course
```json
{
  "id": "beginners-mindfulness",
  "slug": "beginners-mindfulness",
  "level": "beginner",
  "duration": "7 days",
  "tier": "enlightened",
  "title": { "en": "Beginner's Mindfulness", "nl": "…" }
}
```

### Lijst-envelop (consistent)
```json
{ "data": [ … ], "total": 47, "next": "/v1/tracks?offset=20" }
```

---

## 6. Het intent-search endpoint (belangrijk voor agents)

Agents zoals Muse vragen niet "geef me id X", maar "help me slapen". Daarom een intent-endpoint:

```
GET /v1/search?intent=sleep&limit=5
→ { "matches": [ { "type": "workshop", "id": "sleep-story-lake", "title": "The Quiet Lake",
                   "tier": "mindful", "score": 0.98 }, … ] }
```

Mapt `intent` op bestaande `theme`/`category`/`mood`-velden (sleep→slaapverhalen/soundscapes, relax→release/grounding, etc.).

---

## 7. Fouten & rate limits

- `401` — ontbrekende/ongeldige API-key op een premium-endpoint.
- `402` — juiste key, maar tier niet ontgrendeld (→ wijs naar `/v1/checkout`).
- `404` — onbekend id/slug.
- `416` — ongeldige Range-header.
- Rate limits: catalogus ruim (bijv. 60/min per IP), premium hoger per key.

---

## 8. Implementatie-stappen (van huidige staat → v1)

1. **`/v1`-router** in Next.js, mapt 1:1 op de bestaande interne routes (meditations, music-tracks, sounds, courses, affirmations, articles) — velden al aanwezig.
2. **`tier` + `durationSeconds` toevoegen** aan de gedeelde datamodellen (`packages/shared/src/*`).
3. **`/v1/search`** bouwen op theme/category/mood.
4. **Audio-endpoints** → Range-requests (nu al via `existsSync` + bestand-serve; range-ondersteuning toevoegen).
5. **API-key auth** (`X-API-Key`) + key-vault (secrets) + entitlement-check tegen Stripe (`/api/subscriptions/status` bestaat al).
6. **`/v1/checkout`** → bestaande Stripe-checkout hergebruiken; Stripe Link aanzetten (voor de Muse-rail).
7. **OpenAPI-spec + docs** publiceren (`/v1/openapi.json`).

---

## 9. Wat er al is vs. wat nieuw is

| Onderdeel | Status |
|---|---|
| Content-datamodellen (meditations/workshops/tracks/sounds/courses/affirmations) | ✅ bestaand |
| Interne API-routes | ✅ bestaand |
| Stripe-checkout + subscription-status | ✅ bestaand |
| `/v1` publieke, versieerde laag | 🆕 |
| `tier`-veld + premium-gating op audio | 🆕 |
| `/v1/search` (intent) | 🆕 |
| Audio Range-requests | 🆕 (deels) |
| API-key auth + key-vault | 🆕 |
| OpenAPI-spec | 🆕 |
