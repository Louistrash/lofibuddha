// ── Newsletter Email Sender (Resend + SMTP fallback) ──
// POST /api/newsletter/send — actually send a newsletter to subscribers

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const NEWSLETTER_DB = join(process.cwd(), "public", "data", "newsletters.json");
const SUBSCRIBER_DB = join(process.cwd(), "public", "data", "subscribers.json");
const COURSES_DB = join(process.cwd(), "public", "data", "courses.json");

const LANG_NAMES: Record<string, string> = {
  en: "English", nl: "Nederlands", es: "Español", de: "Deutsch", fr: "Français", hi: "हिन्दी"
};

const LANG_LABELS: Record<string, Record<string, string>> = {
  en: { greeting: "Welcome back, friend", tip: "Mindfulness Tip", track: "Lofi Track of the Week", courses: "Explore Our Courses", cta: "Visit lofibuddha.com", unsubscribe: "Unsubscribe", footer: "You received this email because you subscribed at lofibuddha.com" },
  nl: { greeting: "Welkom terug", tip: "Mindfulness Tip", track: "Lofi Track van de Week", courses: "Ontdek Onze Cursussen", cta: "Bezoek lofibuddha.com", unsubscribe: "Uitschrijven", footer: "Je ontvangt deze mail omdat je je hebt ingeschreven op lofibuddha.com" },
  es: { greeting: "Bienvenido de nuevo", tip: "Consejo de Mindfulness", track: "Canción Lofi de la Semana", courses: "Explora Nuestros Cursos", cta: "Visita lofibuddha.com", unsubscribe: "Darse de baja", footer: "Recibes este correo porque te suscribiste en lofibuddha.com" },
  de: { greeting: "Willkommen zurück", tip: "Achtsamkeitstipp", track: "Lofi-Track der Woche", courses: "Unsere Kurse entdecken", cta: "Besuche lofibuddha.com", unsubscribe: "Abmelden", footer: "Du erhältst diese E-Mail, weil du dich bei lofibuddha.com angemeldet hast" },
  fr: { greeting: "Bon retour parmi nous", tip: "Conseil de Pleine Conscience", track: "Morceau Lofi de la Semaine", courses: "Découvrez nos Cours", cta: "Visitez lofibuddha.com", unsubscribe: "Se désabonner", footer: "Vous recevez cet email car vous vous êtes inscrit sur lofibuddha.com" },
  hi: { greeting: "आपका पुनः स्वागत है", tip: "माइंडफुलनेस टिप", track: "सप्ताह का लोफाई ट्रैक", courses: "हमारे पाठ्यक्रम देखें", cta: "lofibuddha.com पर जाएं", unsubscribe: "सदस्यता समाप्त", footer: "आपको यह ईमेल इसलिए मिला क्योंकि आपने lofibuddha.com पर सदस्यता ली थी" },
};

function emailHTML(params: {
  subject: string; content: string; language: string;
  issueNumber: number; courses: any[]; baseUrl: string;
  subscriberEmail: string;
}): string {
  const l = LANG_LABELS[params.language] || LANG_LABELS.en;
  const langName = LANG_NAMES[params.language] || params.language;
  const unsubLink = `${params.baseUrl}/api/subscribers?action=unsubscribe&email=${encodeURIComponent(params.subscriberEmail)}`;

  // Course highlights (1-2 featured)
  const courseCards = (params.courses || []).slice(0, 2).map((c: any) => {
    const title = c.title?.[params.language] || c.title?.en || "";
    const desc = c.description?.[params.language] || c.description?.en || "";
    const slug = c.slug || "";
    const img = c.image || "https://lofibuddha.com/images/generated/temple-01-jungle-1780083927467.png";
    return `
    <div style="background:#1a1715;border-radius:12px;padding:16px;margin:8px 0;border:1px solid #3d362f">
      <img src="${img}" alt="${title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" />
      <h3 style="margin:0 0 4px;color:#d4b48a;font-size:15px">${title}</h3>
      <p style="margin:0;color:#9a9488;font-size:12px">${desc.slice(0, 100)}...</p>
      <a href="${params.baseUrl}/learn/${slug}?lang=${params.language}" style="display:inline-block;margin-top:8px;color:#c49464;font-size:12px;text-decoration:none;font-weight:600">${l.cta} →</a>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="${params.language}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1715;border-radius:16px;overflow:hidden;border:1px solid #3d362f">
      
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#2a2318,#1a1715);padding:32px 40px;text-align:center">
        <p style="margin:0;color:#c49464;font-size:11px;letter-spacing:3px;text-transform:uppercase">lofibuddha · Issue #${params.issueNumber} · ${langName}</p>
        <h1 style="margin:12px 0 0;color:#f0ebe0;font-size:24px;font-weight:400;line-height:1.3">${params.subject}</h1>
      </td></tr>
      
      <!-- Divider -->
      <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#c49464,transparent)"></td></tr>
      
      <!-- Content -->
      <tr><td style="padding:32px 40px;color:#d4c8b8;font-size:15px;line-height:1.8">
        <p style="margin:0 0 8px;color:#9a9488;font-size:13px">${l.greeting} 🧘</p>
        ${params.content.split("\\n").map((p: string) => `<p style="margin:0 0 16px">${p}</p>`).join("")}
      </td></tr>
      
      <!-- Courses -->
      ${courseCards ? `
      <tr><td style="padding:0 40px 16px">
        <h2 style="margin:0 0 8px;color:#c4b89a;font-size:14px;letter-spacing:2px;text-transform:uppercase">${l.courses}</h2>
        ${courseCards}
      </td></tr>` : ""}
      
      <!-- Mindfulness Tip -->
      <tr><td style="padding:16px 40px">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#25201c;border-radius:12px;border:1px solid #3d362f">
          <tr><td style="padding:20px 24px">
            <p style="margin:0;color:#c49464;font-size:11px;letter-spacing:2px;text-transform:uppercase">🌿 ${l.tip}</p>
            <p style="margin:8px 0 0;color:#d4c8b8;font-size:14px;line-height:1.6">Take three deep breaths right now. Inhale for 4 counts, hold for 4, exhale for 8. Feel the tension release.</p>
          </td></tr>
        </table>
      </td></tr>
      
      <!-- CTA -->
      <tr><td style="padding:24px 40px 8px;text-align:center">
        <a href="${params.baseUrl}" style="display:inline-block;background:linear-gradient(135deg,#c49464,#a0784c);color:#fff;text-decoration:none;padding:14px 36px;border-radius:30px;font-size:14px;font-weight:600;letter-spacing:1px">${l.cta}</a>
      </td></tr>
      
      <!-- Footer -->
      <tr><td style="padding:24px 40px 32px;text-align:center;border-top:1px solid #2a2318;margin-top:16px">
        <p style="margin:0;color:#6b6358;font-size:11px">${l.footer}</p>
        <p style="margin:8px 0 0;color:#6b6358;font-size:11px">
          <a href="${unsubLink}" style="color:#9a9488;text-decoration:underline">${l.unsubscribe}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { issueId } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lofibuddha.com";

    // Load newsletter
    let newsletters: any[] = [];
    try { newsletters = JSON.parse(await readFile(NEWSLETTER_DB, "utf-8")); } catch {}
    
    const issue = newsletters.find((n: any) => n.id === issueId);
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

    // Load subscribers for this language
    let subscribers: any[] = [];
    try { subscribers = JSON.parse(await readFile(SUBSCRIBER_DB, "utf-8")); } catch {}
    
    const targets = subscribers.filter((s: any) => 
      s.language === issue.language && s.status === "active"
    );

    if (targets.length === 0) {
      return NextResponse.json({ error: "No subscribers for this language" }, { status: 400 });
    }

    // Load courses for cross-promotion
    let courses: any[] = [];
    try {
      const raw = JSON.parse(await readFile(COURSES_DB, "utf-8"));
      courses = Array.isArray(raw) ? raw : (raw.courses || []);
    } catch {}

    // Send emails
    const results: { email: string; success: boolean; error?: string }[] = [];
    const apiKey = process.env.RESEND_API_KEY;

    for (const sub of targets) {
      const html = emailHTML({
        subject: issue.subject,
        content: issue.content,
        language: issue.language,
        issueNumber: issue.issueNumber,
        courses,
        baseUrl,
        subscriberEmail: sub.email,
      });

      try {
        if (apiKey) {
          // Use Resend API
          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: "LofiBuddha <newsletter@lofibuddha.com>",
              to: sub.email,
              subject: `🪷 ${issue.subject}`,
              html,
            }),
          });
          const data = await resp.json();
          results.push({ email: sub.email, success: resp.ok, error: resp.ok ? undefined : JSON.stringify(data) });
        } else {
          // Log-only mode (no API key configured)
          results.push({ email: sub.email, success: false, error: "RESEND_API_KEY not configured — email not sent" });
        }
      } catch (err: any) {
        results.push({ email: sub.email, success: false, error: err.message });
      }
    }

    // Update newsletter status
    issue.status = "sent";
    issue.sentAt = new Date().toISOString();
    issue.subscriberCount = targets.length;
    issue.sendResults = results;
    await writeFile(NEWSLETTER_DB, JSON.stringify(newsletters, null, 2));

    const sent = results.filter(r => r.success).length;
    return NextResponse.json({
      success: true,
      sent,
      failed: results.length - sent,
      total: results.length,
      results: results.slice(0, 5), // First 5 for dashboard display
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
