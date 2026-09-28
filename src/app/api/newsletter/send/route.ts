// ── Newsletter Email Sender (Resend + SMTP fallback) ──
// POST /api/newsletter/send — actually send a newsletter to subscribers

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { EMAIL_LOGO_URL } from "@/lib/email-layout";

const NEWSLETTER_DB = join(process.cwd(), "public", "data", "newsletters.json");
const SUBSCRIBER_DB = join(process.cwd(), "public", "data", "subscribers.json");
const COURSES_DB = join(process.cwd(), "public", "data", "courses.json");

const LANG_NAMES: Record<string, string> = {
  en: "English", nl: "Nederlands", es: "Español", de: "Deutsch", fr: "Français", hi: "हिन्दी"
};

const LANG_LABELS: Record<string, Record<string, string>> = {
  en: { greeting: "Welcome back, friend", tip: "Mindfulness Tip", tipBody: "Take three deep breaths right now. Inhale for 4 counts, hold for 4, exhale for 8. Feel the tension release.", track: "Lofi Track of the Week", courses: "Explore Our Courses", cta: "Visit lofibuddha.com", unsubscribe: "Unsubscribe", footer: "You received this email because you subscribed at lofibuddha.com" },
  nl: { greeting: "Welkom terug", tip: "Mindfulness Tip", tipBody: "Neem nu drie keer diep adem. Adem 4 tellen in, houd 4 tellen vast, adem 8 tellen uit. Voel de spanning loslaten.", track: "Lofi Track van de Week", courses: "Ontdek Onze Cursussen", cta: "Bezoek lofibuddha.com", unsubscribe: "Uitschrijven", footer: "Je ontvangt deze mail omdat je je hebt ingeschreven op lofibuddha.com" },
  es: { greeting: "Bienvenido de nuevo", tip: "Consejo de Mindfulness", tipBody: "Respira profundamente tres veces ahora mismo. Inhala durante 4 tiempos, mantén durante 4, exhala durante 8. Siente cómo se libera la tensión.", track: "Canción Lofi de la Semana", courses: "Explora Nuestros Cursos", cta: "Visita lofibuddha.com", unsubscribe: "Darse de baja", footer: "Recibes este correo porque te suscribiste en lofibuddha.com" },
  de: { greeting: "Willkommen zurück", tip: "Achtsamkeitstipp", tipBody: "Atme jetzt dreimal tief durch. Atme 4 Zählzeiten ein, halte 4, atme 8 aus. Spüre, wie die Anspannung nachlässt.", track: "Lofi-Track der Woche", courses: "Unsere Kurse entdecken", cta: "Besuche lofibuddha.com", unsubscribe: "Abmelden", footer: "Du erhältst diese E-Mail, weil du dich bei lofibuddha.com angemeldet hast" },
  fr: { greeting: "Bon retour parmi nous", tip: "Conseil de Pleine Conscience", tipBody: "Prenez trois respirations profondes maintenant. Inspirez pendant 4 temps, retenez pendant 4, expirez pendant 8. Sentez la tension se relâcher.", track: "Morceau Lofi de la Semaine", courses: "Découvrez nos Cours", cta: "Visitez lofibuddha.com", unsubscribe: "Se désabonner", footer: "Vous recevez cet email car vous vous êtes inscrit sur lofibuddha.com" },
  hi: { greeting: "आपका पुनः स्वागत है", tip: "माइंडफुलनेस टिप", tipBody: "अभी तीन गहरी साँसें लें। 4 गिनती तक साँस लें, 4 तक रोकें, 8 तक छोड़ें। तनाव को छूटता हुआ महसूस करें।", track: "सप्ताह का लोफाई ट्रैक", courses: "हमारे पाठ्यक्रम देखें", cta: "lofibuddha.com पर जाएं", unsubscribe: "सदस्यता समाप्त", footer: "आपको यह ईमेल इसलिए मिला क्योंकि आपने lofibuddha.com पर सदस्यता ली थी" },
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
    const tr = c.translations?.[params.language] || c.translations?.en || {};
    const title = tr.title || "";
    const desc = tr.description || "";
    const slug = c.slug || "";
    const rawImg = c.image || "https://lofibuddha.com/images/generated/temple-01-jungle-1780083927467.png";
    const img = rawImg.startsWith("http") ? rawImg : `${params.baseUrl}${rawImg}`;
    const href = `${params.baseUrl}/course/${slug}?lang=${params.language}`;
    return `
    <div style="background:#211c18;border-radius:12px;margin:0 0 14px;border:1px solid #3d362f;overflow:hidden">
      <a href="${href}" style="display:block;text-decoration:none">
        <img src="${img}" alt="${title}" width="600" style="width:100%;height:180px;object-fit:cover;object-position:center;border:none;display:block" />
      </a>
      <div style="padding:16px 16px 18px">
        <a href="${href}" style="text-decoration:none"><h3 style="margin:0 0 6px;color:#e8d9b8;font-size:16px;font-weight:700">${title}</h3></a>
        <p style="margin:0 0 12px;color:#b6ada0;font-size:14px;line-height:1.6">${desc}</p>
        <a href="${href}" style="display:inline-block;color:#c49464;font-size:13px;text-decoration:none;font-weight:700">${l.cta} →</a>
      </div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="${params.language}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1715;border-radius:16px;overflow:hidden;border:1px solid #3d362f">
      
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#2a2318,#1a1715);padding:36px 24px 30px;text-align:center">
        <img src="${EMAIL_LOGO_URL}" width="72" height="72" alt="LofiBuddha" style="display:block;margin:0 auto 16px;border-radius:50%;border:2px solid #c49464;width:72px;height:72px" />
        <p style="margin:0;color:#c49464;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700">lofibuddha · Issue #${params.issueNumber} · ${langName}</p>
        <h1 style="margin:14px 0 0;color:#f0ebe0;font-size:26px;font-weight:700;line-height:1.25">${params.subject}</h1>
      </td></tr>
      
      <!-- Divider -->
      <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#c49464,transparent)"></td></tr>
      
      <!-- Content -->
      <tr><td style="padding:28px 24px;color:#d8d0c4;font-size:16px;line-height:1.65">
        <p style="margin:0 0 10px;color:#a89f92;font-size:14px">${l.greeting} 🧘</p>
        ${params.content.split("\n").map((p: string) => `<p style="margin:0 0 14px">${p}</p>`).join("")}
      </td></tr>
      
      <!-- Courses -->
      ${courseCards ? `
      <tr><td style="padding:0 24px 8px">
        <h2 style="margin:0 0 12px;color:#c4b89a;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700">${l.courses}</h2>
        ${courseCards}
      </td></tr>` : ""}
      
      <!-- Mindfulness Tip -->
      <tr><td style="padding:14px 24px">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#25201c;border-radius:12px;border:1px solid #3d362f">
          <tr><td style="padding:18px 22px">
            <p style="margin:0;color:#c49464;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700">🌿 ${l.tip}</p>
            <p style="margin:8px 0 0;color:#d8d0c4;font-size:15px;line-height:1.6">${l.tipBody}</p>
          </td></tr>
        </table>
      </td></tr>
      
      <!-- CTA -->
      <tr><td style="padding:22px 24px 8px;text-align:center">
        <a href="${params.baseUrl}" style="display:inline-block;background:linear-gradient(135deg,#c49464,#a0784c);color:#fff;text-decoration:none;padding:14px 34px;border-radius:30px;font-size:15px;font-weight:700;letter-spacing:0.5px">${l.cta}</a>
      </td></tr>
      
      <!-- Footer -->
      <tr><td style="padding:22px 24px 30px;text-align:center;border-top:1px solid #2a2318;margin-top:16px">
        <img src="${EMAIL_LOGO_URL}" width="32" height="32" alt="" style="display:block;margin:0 auto 12px;border-radius:50%;width:32px;height:32px;opacity:0.85" />
        <p style="margin:0;color:#8a8378;font-size:12px">${l.footer}</p>
        <p style="margin:8px 0 0;color:#8a8378;font-size:12px">
          <a href="${unsubLink}" style="color:#a89f92;text-decoration:underline">${l.unsubscribe}</a>
        </p>
      </td></tr>
    </table>
</td></tr></table>
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
