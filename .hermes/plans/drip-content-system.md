# LofiBuddha Drip Content Systeem — Uitvoeringsplan

## Architectuur

Drie lagen die samenwerken:
1. **Subscription state** — Stripe webhook → subscriber.json (tier, startDate, dripDay)
2. **Content delivery** — API endpoint `/api/drip?day=N&tier=T` → unlocked content
3. **Email automation** — Resend SMTP → welcome sequence + weekly digest

## Data model

```ts
// public/data/subscribers.json — uitgebreid
{
  "email": "user@example.com",
  "tier": "mindful",           // zen | mindful | enlightened
  "startDate": "2026-06-01",
  "dripDay": 7,                // welke dag in de drip cycle
  "unlockedCourses": ["beginners-mindfulness"],
  "lastEmailSent": "2026-06-03",
  "language": "en",
  "status": "active"
}
```

## Content kalender per tier

### Zen Beginner (Free) — Always available
| Dag | Content |
|-----|---------|
| Elke dag | AI Buddha chat (10/day), Lofi radio, Box breathing |
| Altijd | Browse page videos (6 free videos) |

### Mindful Path (€4,99) — 4-week drip
| Dag | Content | Type | Status |
|-----|---------|------|--------|
| 1 | Welcome email: "Your Mindful Path Begins" | Email | 📝 te bouwen |
| 1 | AI Buddha chat (unlimited) | Feature | ✅ live |
| 2 | Lofi playlist #1: Morning Calm | Audio | ✅ audio files in /public/audio/ |
| 3 | Course unlock: Beginner's Mindfulness (Day 1-2) | Course | ✅ courses.json ready |
| 5 | Breathwork guide: 4-4-4 technique | Page | 📝 te bouwen |
| 7 | Week 1 digest email + playlist #2 | Email | 📝 te bouwen |
| 9 | Course unlock: Beginner's Mindfulness (Day 3-5) | Course | ✅ ready |
| 12 | Yoga Foundations course (Day 1-3) | Course | ✅ ready |
| 14 | Week 2 digest + new playlist | Email | 📝 te bouwen |
| 16 | Course unlock: Beginner's Mindfulness (Day 6-7) | Course | ✅ ready |
| 19 | Breathwork Essentials course (Day 1-2) | Course | ✅ ready |
| 21 | Week 3 digest | Email | 📝 te bouwen |
| 23 | Yoga Foundations (Day 4-7) | Course | ✅ ready |
| 26 | Lofi & Deep Focus course (Day 1-3) | Course | ✅ ready |
| 28 | Week 4 digest + "What's next" | Email | 📝 te bouwen |
| 30+ | Weekly playlist + full library access | Ongoing | ✅ browse page |

### Enlightened Path (€12,99) — All Mindful + exclusives
| Dag | Extra content (bovenop Mindful) | Type | Status |
|-----|------|------|--------|
| 1 | Personal intake: 5 vragen over doelen | Form | 📝 te bouwen |
| 1 | Eerste personalized daily meditation | AI-gen | 📝 te bouwen |
| 3 | Spiritual roadmap PDF | Download | 📝 te bouwen |
| 7 | Guided breathwork video (10-min) | Video | 📝 te bouwen |
| 14 | 1-on-1 AI Buddha deep dive sessie | Chat | ✅ via AI Buddha |
| 21 | Custom lofi mix (gegenereerd op mood) | Audio | 📝 te bouwen |
| 28 | Monthly reflection template | PDF | 📝 te bouwen |
| 30+ | Wekelijkse personalized meditations | AI-gen | 📝 te bouwen |

## Fase 1: Fundament (deze sprint)

### 1.1 Subscriber state bijwerken
- Stripe webhook breidt subscriber.json uit met tier/startDate/dripDay
- `src/app/api/stripe/webhook/route.ts` — check.subscription.created/updated → write enriched subscriber

### 1.2 Drip API endpoint
- `src/app/api/drip/route.ts` — GET /api/drip?email=X → returns unlocked content voor vandaag
- Leest subscriber.json, berekent dripDay, returned content object

### 1.3 Subscriber dashboard pagina
- `src/app/account/page.tsx` — simpele pagina: "Je bent op dag X van je reis"
- Toont unlocked courses, playlists, volgende unlock
- Link naar AI Buddha chat, browse library

### 1.4 Welcome email (Resend)
- `src/app/api/newsletter/send/route.ts` uitbreiden met trigger emails
- Template: "Your Mindful Path Begins" / "The Enlightened Path Awaits"
- Verstuurd bij Stripe checkout.session.completed

## Fase 2: Rijke content (volgende sprint)

### 2.1 Breathwork guide pagina
- `/breathe` — 4-4-4 box breathing animated guide
- Bestaande code van aibuddha.net breathing visualizer hergebruiken

### 2.2 Personalized daily meditation (AI-gen)
- AI Buddha chat context: "Genereer een 5-min meditatie voor [naam] die vandaag [emotie] voelt"
- Opgeslagen als text, getoond in subscriber dashboard

### 2.3 Spiritual roadmap
- Intake form → AI Buddha genereert personalized 4-week plan
- PDF download met weekplanning

### 2.4 Weekly playlist curator
- Script dat wekelijks nieuwe playlist samenstelt uit /public/audio/
- Gepusht naar subscriber dashboard + email

## Fase 3: Community & retentie

### 3.1 Streak systeem
- Check of subscriber daily inlogt / chat met AI Buddha
- Badges: 7-day, 30-day, 100-day streaks

### 3.2 Monthly live sessie
- Zoom/Stream link in Enlightened dashboard
- Thema: seasonal mindfulness

### 3.3 Challenge systeem
- 7-day, 14-day, 30-day challenges
- Daily check-in, progress bar, completion badge

---

## Nu te bouwen (Fase 1 — vandaag)

1. Subscriber state: webhook uitbreiden met drip fields
2. `/api/drip` endpoint
3. `/account` subscriber pagina
4. Welcome email template
