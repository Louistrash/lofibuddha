# Progress Dashboard — Implementation Plan

> **Voor Hermes:** bouw dit task-by-task; verifieer na elke taak met build + restart + curl.

**Goal:** Workshop-achtige leerprogress voor premium users — inschrijven op courses, dag voor dag voltooien, en voortgang terugzien in een dashboard.

**Architectuur:** JSON-file storage per Firebase-UID (`data/course-progress.json`) via bestaande `db.ts`-patronen; nieuwe API-routes `/api/courses/progress` (GET/POST); UI-extensies op `/learn/[slug]` (dag voltooien) en een nieuw Progress Dashboard-paneel in `/account`.

**Tech Stack:** Next.js App Router, Firebase Auth (bestaand), JSON-file storage (bestaand patroon), lucide-react icons.

---

## Context & Assumpties

- Firebase Auth is de enige login (Google + email). Firebase UID via header `x-fb-uid` (patroon bestaat al in `/api/chat/route.ts`).
- Premium-plans: `starter`, `focus`, `deep` in `users.json` (`plan`-veld). `free` is niet-premium.
- Courses staan in `public/data/courses.json` — 4 courses, 27 lessen totaal, elke les heeft `day`, `title`, `experience` (link naar mindfulness experience).
- `db.ts` heeft `readCollection`/`writeCollection` helpers — hergebruiken voor `course_progress` collectie.
- De chat-API zet al `lastVisitAt` en `chatCount` bij per Firebase-UID — het Progress Dashboard kan die data hergebruiken.

## Proposed Approach

1. **Data-laag**: nieuwe collectie `course_progress.json` met `{ userId, courseId, enrolledAt, completedDays: number[], completedAt? }`.
2. **API**: `GET /api/courses/progress` (lijst per user) + `POST /api/courses/progress` (enroll / toggle day complete).
3. **UI Course-pagina**: "Start course" knop (enroll) + per les een "Dag voltooid" checkbox; progressbar "3/7".
4. **Progress Dashboard** in `/account`: overzicht van ingeschreven courses, % per course, streak, laatste bezoek.
5. **Premium-gating**: volledige course alleen voor premium; free users zien dag 1 als proef (optioneel, fase 2).

---

## Step-by-Step Plan

### Taak 1: Data-laag — course_progress collectie

**Objective:** `db.ts` uitbreiden met CRUD voor course progress.

**Files:**
- Modify: `src/lib/db.ts`

**Stap 1:** Interface toevoegen na `ChatMessage`:

```ts
export interface CourseProgress {
  id: string;            // `${userId}:${courseId}`
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedDays: number[]; // day nummers die voltooid zijn
  completedAt?: string;
}
```

**Stap 2:** Helpers toevoegen (bestaand readCollection/writeCollection patroon):

```ts
export function getCourseProgress(userId: string): CourseProgress[] {
  return readCollection<CourseProgress>("course_progress").filter(p => p.userId === userId);
}
export function getCourseProgressEntry(userId: string, courseId: string): CourseProgress | undefined {
  return readCollection<CourseProgress>("course_progress").find(p => p.userId === userId && p.courseId === courseId);
}
export function enrollCourse(userId: string, courseId: string): CourseProgress {
  const all = readCollection<CourseProgress>("course_progress");
  const existing = all.find(p => p.userId === userId && p.courseId === courseId);
  if (existing) return existing;
  const entry: CourseProgress = { id: `${userId}:${courseId}`, userId, courseId, enrolledAt: new Date().toISOString(), completedDays: [] };
  all.push(entry);
  writeCollection("course_progress", all);
  return entry;
}
export function toggleCourseDay(userId: string, courseId: string, day: number): CourseProgress | undefined {
  const all = readCollection<CourseProgress>("course_progress");
  const idx = all.findIndex(p => p.userId === userId && p.courseId === courseId);
  if (idx === -1) return undefined;
  const p = all[idx];
  p.completedDays = p.completedDays.includes(day)
    ? p.completedDays.filter(d => d !== day)
    : [...p.completedDays, day].sort((a, b) => a - b);
  all[idx] = p;
  writeCollection("course_progress", all);
  return p;
}
```

**Stap 3:** Verifieer: `npm run build` groen; geen typefouten.

### Taak 2: API routes — GET/POST /api/courses/progress

**Objective:** Firebase-UID herkennen en progress lezen/schrijven.

**Files:**
- Create: `src/app/api/courses/progress/route.ts`

**Stap 1:** Maak de route:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getCourseProgress, enrollCourse, toggleCourseDay, getCourseProgressEntry } from "@/lib/db";

function getUid(req: NextRequest): string | null {
  return req.headers.get("x-fb-uid");
}

export async function GET(req: NextRequest) {
  const uid = getUid(req);
  if (!uid) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ progress: getCourseProgress(uid) });
}

export async function POST(req: NextRequest) {
  const uid = getUid(req);
  if (!uid) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = await req.json();
  const { courseId, day } = body;
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });
  if (day !== undefined) {
    const updated = toggleCourseDay(uid, courseId, day);
    return updated
      ? NextResponse.json({ progress: updated })
      : NextResponse.json({ error: "Not enrolled" }, { status: 404 });
  }
  const enrolled = enrollCourse(uid, courseId);
  return NextResponse.json({ progress: enrolled });
}
```

**Stap 2:** Verifieer met curl (na deploy):

```bash
curl -s -X POST http://localhost:3000/api/courses/progress -H "Content-Type: application/json" -H "x-fb-uid: test" -d '{"courseId":"beginners-mindfulness"}'
curl -s -X POST http://localhost:3000/api/courses/progress -H "Content-Type: application/json" -H "x-fb-uid: test" -d '{"courseId":"beginners-mindfulness","day":1}'
curl -s http://localhost:3000/api/courses/progress -H "x-fb-uid: test"
```

### Taak 3: Course-pagina — enroll + dag voltooien

**Objective:** `/learn/[slug]` laat per les een "Dag voltooid" toggle + progressbar zien.

**Files:**
- Modify: `src/app/learn/[slug]/page.tsx`

**Stap 1:** State toevoegen:

```tsx
const { user: fbUser } = useAuth();
const [progress, setProgress] = useState<{ completedDays: number[] } | null>(null);
```

**Stap 2:** Bij laden (na course fetch) progress ophalen als fbUser:

```tsx
useEffect(() => {
  if (!fbUser || !slug) return;
  fetch("/api/courses/progress", { headers: { "x-fb-uid": fbUser.uid } })
    .then(r => r.json())
    .then(d => {
      const entry = (d.progress || []).find((p: any) => p.courseId === slug);
      setProgress(entry || null);
    })
    .catch(() => {});
}, [fbUser, slug]);
```

**Stap 3:** Per module (na de Practice-knop) een voltooi-toggle:

```tsx
{fbUser && (
  <button
    onClick={async () => {
      const r = await fetch("/api/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-fb-uid": fbUser.uid },
        body: JSON.stringify({ courseId: slug, day: mod.day }),
      });
      const d = await r.json();
      if (d.progress) setProgress(d.progress);
    }}
    className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
  >
    <CheckCircle2 size={14} />
    {progress?.completedDays.includes(mod.day) ? "Dag voltooid ✓" : "Markeer dag als voltooid"}
  </button>
)}
```

**Stap 4:** Progressbar onder de header (als fbUser):

```tsx
{fbUser && progress && (
  <div className="max-w-3xl mx-auto px-6 -mt-4 mb-8">
    <div className="bg-white rounded-xl border border-stone-100 p-4">
      <div className="flex justify-between text-xs text-stone-500 mb-2">
        <span>Voortgang</span>
        <span>{progress.completedDays.length}/{course.modules.length} dagen</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${(progress.completedDays.length / course.modules.length) * 100}%` }} />
      </div>
    </div>
  </div>
)}
```

**Stap 5:** "Start course" CTA wordt "Inschrijven" als fbUser niet-enrolled:

```tsx
{fbUser && !progress && (
  <button onClick={enroll} className="...">Schrijf je in voor deze course</button>
)}
```

### Taak 4: Progress Dashboard in /account

**Objective:** Overzicht van ingeschreven courses + streak + statistieken.

**Files:**
- Modify: `src/app/account/page.tsx`

**Stap 1:** Na de bestaande drip-fetch een progress-fetch toevoegen (Firebase uid).

**Stap 2:** Nieuwe sectie "Your courses" boven de drip-journey:

```tsx
{progress.length > 0 && (
  <section>
    <h2>Your courses</h2>
    {progress.map(p => {
      const course = courses.find(c => c.slug === p.courseId);
      const pct = course ? Math.round((p.completedDays.length / course.modules.length) * 100) : 0;
      return (
        <div key={p.courseId} className="...">
          <span>{course?.title || p.courseId}</span>
          <div className="progressbar"><div style={{ width: pct + "%" }} /></div>
          <span>{pct}% · {p.completedDays.length} dagen</span>
          {p.completedAt && <Badge>Voltooid 🎉</Badge>}
        </div>
      );
    })}
  </section>
)}
```

**Stap 3:** Course voltooid detecteren: als `completedDays.length === modules.length` → `completedAt` zetten bij toggle (in Taak 2 of via client).

### Taak 5: Premium-gating (fase 2 — optioneel)

**Objective:** Volledige course alleen voor premium (`starter`/`focus`/`deep`); free users zien dag 1 als proef.

**Files:**
- Modify: `src/app/learn/[slug]/page.tsx`
- Modify: `src/app/api/courses/progress/route.ts`

**Aanpak:** API checkt `user.plan`; bij `free` alleen dag 1 unlocked. UI toont lock-icoon op dag 2+ met upgrade-CTA.

---

## Files Likely to Change

| File | Actie |
|---|---|
| `src/lib/db.ts` | Modify — CourseProgress interface + helpers |
| `src/app/api/courses/progress/route.ts` | Create — GET/POST progress API |
| `src/app/learn/[slug]/page.tsx` | Modify — enroll, day-toggle, progressbar |
| `src/app/account/page.tsx` | Modify — Progress Dashboard sectie |
| `src/app/api/courses/progress/route.ts` | Modify — premium check (fase 2) |
| `data/course_progress.json` | Auto-create bij eerste write |

## Tests / Validation

1. `npm run build` — groen na elke taak.
2. `systemctl restart lofibuddha` + `curl` de API (Taak 2 stappen).
3. Browser: `/learn/beginners-mindfulness` — enroll, dag 1-3 voltooien, progressbar bijwerken.
4. Browser: `/account` — course verschijnt met % en dagen.
5. Firebase-user flow: login → enroll → progress persistent na refresh.

## Risks, Tradeoffs, Open Questions

- **JSON-file storage** (geen DB): prima voor deze schaal (31 users), maar niet race-safe bij gelijktijdige writes — zelfde tradeoff als bestaande chat/users storage.
- **Firebase-UID als userId**: bestaande anonieme chat-users hebben cookie-sessies; hun course-progress zou verloren gaan bij upgrade naar Firebase — accepteren (progress is nieuw).
- **Open vraag**: moet het Progress Dashboard ook de **chat-statistieken** tonen (chatCount, lastVisitAt, tokens)? De data bestaat al — makkelijk toe te voegen in Taak 4.
- **Open vraag**: certificaat of badge bij course-voltooiing? (mooi voor premium-waarde, fase 2/3)
- **Open vraag**: streak-tracking (dagelijkse check-in) — aparte feature of onderdeel van dit dashboard?

---

## Execution Handoff

Plan compleet. Uitvoeren in 5 taken (data → API → course UI → dashboard → gating). Elke taak: build + restart + curl-verify.
