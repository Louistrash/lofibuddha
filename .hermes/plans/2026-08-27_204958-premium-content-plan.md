# Premium Content Plan — Workshops & Materiaal voor LofiBuddha

> **Doel:** het premium aanbod (Mindful €1,99 / Enlightened €4,99) uitbreiden met
> workshops en materiaal dat we **daadwerkelijk kunnen genereren** met de tools die
> er al zijn: ElevenLabs (stem, soundscapes, lo-fi muziek), PDF-generatie, en de
> bestaande meditatie/drip/course-infrastructuur.

**Datum:** 2026-08-27 · **Status:** voorstel ter goedkeuring — nog niets uitgevoerd.

---

## 1. Huidige staat (wat er al is)

**Audio (genereerd, live):**
- 12 guided meditations — `packages/shared/src/meditations.ts` + `data/meditations/audio/`
- 5 focus-guides — `packages/shared/src/focus-guides.ts`
- Soundscapes (20s loops) + temple lo-fi soundtracks (4 min) — `sounds.ts` / `music.ts`
- 4 journeys (Focus / Breathe / Sleep / Relax) + immersive worlds

**Premium-belofte (paywall, `mobile/app/deepen.tsx`):**
- **Mindful**: "Guided drip journey" + "Unlimited Buddha AI" + worlds
- **Enlightened**: "Full course library" + early access + priority support

**Al aanwezig maar verouderd:**
- `data/drip-content.json` — 30-dagen "Mindful Path" (PDF-downloads, playlists, course-modules)
  ⚠️ bevat nog dode links: `https://aibuddha.net/#chat` en `/browse` (bestaan niet meer)
- `(dashboard)/courses/page.tsx` — course-beheer in het CMS, inhoud nog generiek

**Generatie-capaciteit (bewezen werkend):**
- `scripts/generate-meditation.mjs` → TTS-stem per segment, per-segment loudnorm, chime + stilte
- ElevenLabs Sound Generation (20s) + Music (4 min)
- PDF-skills beschikbaar (pdf / nano-pdf) voor workbooks

---

## 2. Wat we gaan aanbieden (concreet)

### A. Workshops — multi-dag series (de kern)

Elke workshop = 4–7 korte geleide sessies (stem, 5–10 min elk) rond één thema,
plus een sluitstuk (PDF of eind-sessie). Genereerbaar met het bestaande
meditatie-script (zelfde stem `AXLSCss8z8nhbNGqAebH`).

| Workshop | Dagen | Basis | Nieuw werk |
|---|---|---|---|
| **Deep Sleep Reset** | 7 | deep-sleep (bestaand) | 6 nieuwe sessies + slaaphygiëne-PDF |
| **From Anxiety to Ease** | 5 | anxiety-release, grounding | 3 nieuwe + adem-toolkit |
| **The Morning Ritual** | 7 | morning-gratitude | 6 nieuwe ochtend-sessies |
| **Loving-Kindness Immersion** | 7 | loving-kindness | 6 nieuwe metta-sessies |
| **Deep Work Sprint** | 5 | focus-guides (5 stuks) | bundelen + intro/outro |
| **The Witness — Beyond Thought** | 4 | the-witness | 3 advanced sessies |

**Framing:** workshops zijn *series met progressie*, geen losse meditaties — dat
onderscheidt ze van de gratis content en rechtvaardigt de prijs.

### B. Premium materiaal (losse producten)

1. **Slaapverhalen** — 10–15 min rustige vertellingen met stem ("bedtime stories")
2. **Sound baths** — langere ambient-sessies (5–10 min, uit de sound generation/music)
3. **Ademhalingstoolkit** — box, 4-7-8, coherent breathing, alternate nostril (guided)
4. **Affirmatie-sessies** — korte thematische affirmaties (zelfliefde, focus, loslaten)
5. **PDF-workbooks** — bij elke workshop een download (pdf-skill)
6. **Mandala-audiogrammen** — korte stem + mandala-visueel (scene + voice)

---

## 3. Tier-indeling

| Product | Mindful | Enlightened |
|---|---|---|
| Drip journey (bestaand) | ✅ | ✅ |
| Soundscapes + worlds | ✅ | ✅ |
| **Workshops (basis: Sleep, Anxiety)** | ✅ | ✅ |
| **Alle workshops** | — | ✅ |
| Slaapverhalen | 2 voorbeelden | alle |
| Ademhalingstoolkit | ✅ | ✅ |
| PDF-workbooks | ✅ | ✅ |
| Early access worlds + nieuwe series | — | ✅ |

**Regel:** Mindful krijgt de *smalle* kern; Enlightened ontsluit de *volledige*
bibliotheek. Dat is precies wat de paywall nu al belooft ("full course library").

---

## 4. Generatie-workflow (per product)

1. **Script schrijven** — segmenten (`text` + `pauseAfter`) in `packages/shared/src/`
   (nieuw `workshops.ts` naast `meditations.ts`, zelfde vorm zodat het bestaande
   script en de player het direct oppakken).
2. **Stem genereren** — `node scripts/generate-meditation.mjs <id> workshops`
   (script al gefixt: per-segment loudnorm −23 LUFS, chime + pauzes).
3. **Luidheid meten + beluisteren** — `ffmpeg volumedetect`; Louis luistert vóór
   go-live (hij verwerpt slechte audio snel).
4. **PDF** (optioneel) — pdf-skill, opslaan onder `data/` en serveren via een
   drip/course-download-route.
5. **Registreren** — in de app-paywall/entitlements koppelen (content al achter
   `hasUnlimitedTokens`/plan-logica).
6. **Deploy** — `expo export` + `npm run build` + `systemctl restart`; verifiëren
   via `/api/...` (no-cache, 200).

---

## 5. Fasering (één fase tegelijk, elke fase eindigt werkend)

- **Fase 1 — Fundament:** workshops-framework (`workshops.ts` + player-koppeling)
  én de dode drip-links (`aibuddha.net`, `/browse`) vervangen door live routes.
- **Fase 2 — Eerste workshop:** "Deep Sleep Reset" (7 sessies + slaap-PDF) — de
  flagship om te zien of het aanslaat.
- **Fase 3 — Materiaal:** ademhalingstoolkit + 2 slaapverhalen + 1 sound bath.
- **Fase 4 — Uitbouw:** Anxiety → Morning → Loving-Kindness → Witness workshops.
- **Fase 5 — Entitlements:** alles achter de juiste tier (Mindful vs Enlightened).

---

## 6. Beslissingen (bevestigd door Louis)

- **Dead links** — verwijderd uit `drip-content.json` (aibuddha.net, /browse, /account?tab=… → /ai, /explore, /category/breathe, /account). ✅
- **Chat-taal** — Buddha reageert nu in de taal van het bericht (NL↔EN detectie). ✅
- **Workshops** — **los verkopen én** via abonnement (Stripe Checkout + entitlements voor beide).
- **Taal content** — alles Engels; alleen de chat past zich aan de gebruiker aan.
- **Sessielengte** — **20 minuten** per sessie (niet 5). Meer segmenten per workshop, langere TTS-runs.
- **Sounds langer** — 9 loop-able soundscapes zijn van 20s → **~56s** verlengd (3 takes + crossfade). ✅

## 7. Risico's

- **ElevenLabs-kosten** — 20-min sessies = ~2-3× meer TTS per workshop; langere sounds = 3× per geluid. Batch per product.
- **Stem-consistentie** — vaste voice ID aanhouden.
- **Kwaliteit** — Louis keurt audio goed vóór deploy; lange sessies zijn moeilijker te beluisteren, dus per workshop in stukken aanleveren.

---

## 7. Definitie van klaar (per workshop)

- [ ] Alle sessies gegenereerd, genormaliseerd (−23 LUFS), geen clipping
- [ ] Louis heeft geluisterd en akkoord gegeven
- [ ] Live via `/api/...` (200, no-cache), speelbaar in de player
- [ ] Achter de juiste tier, niet zichtbaar voor gratis gebruikers
- [ ] Geen dode links in drip/course-routes


---

## 8. Realtime TTS en de dagelijkse affirmatie

### Status
- Geen realtime TTS in gebruik. `/api/tts` bestaat (POST, ElevenLabs, 2500 tekens,
  non-streaming) maar wordt **nergens aangeroepen** — dode infra.
- Alle audio is nu vooraf gegenereerd (eenmalige kosten, gratis per luister).

### Kansen (geprioriteerd)
1. **Buddha AI met stem — "meditation on demand"** — killer-feature: chat-antwoord
   wordt live ingesproken, uniek per gebruiker.
2. **Dagelijkse check-in met stem** — semi-gestandaardiseerd, cachebaar.
3. **Affirmatie van de dag** — kort, cachebaar, laag risico. **Als eerste oppakken.**

### Afweging
- Realtime = kosten per antwoord (DeepSeek + ElevenLabs per chatbericht).
- Vooraf gegenereerd = eenmalig, gratis per luister.
- Latency: non-streaming 2-5s; streaming (websocket) <1s.

### Stappenplan (realtime, later als fase)
1. Streaming TTS (ElevenLabs websocket) i.p.v. de non-streaming `/api/tts`.
2. Stem achter **Enlightened**-tier (rechtvaardigt 4,99, dekt kosten).
3. Cache terugkerende uitingen (check-in, affirmaties, standaardzinnen).
4. "Meditation on demand" als **losse aankoop** (los + abbo).
5. Chat-UI: play-knop op elk antwoord + streaming progress.

### Fase 1 (nu): Affirmatie van de dag
- Bibliotheek ~30 affirmaties, vooraf ingesproken (eenmalig, gratis per luister).
- API `/api/affirmations/today` -> tekst + audio-URL, roterend op datum.
- Mooie kaart op de **Today**-tab: bekijken + beluisteren.
