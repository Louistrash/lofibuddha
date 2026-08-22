// ── Welcome Email Trigger ──────────────────────
// Called from Stripe webhook on checkout.session.completed
// Uses Resend API (same as newsletter system)

const WELCOME_TEMPLATES: Record<string, Record<string, { subject: string; body: string }>> = {
  mindful: {
    en: {
      subject: "Your Mindful Path begins — welcome to LofiBuddha",
      body: "Thank you for joining the Mindful Path.\\n\\nYou now have unlimited access to AI Buddha spiritual guidance, weekly curated Lofi playlists, ad-free ambient audio downloads, and a completely ad-free experience.\\n\\nHere's how to start:\\n\\n1. Chat with AI Buddha — your personal spiritual companion is ready at lofibuddha.com/chat\\n2. Explore the library — browse our full collection of Lofi soundscapes\\n3. Your first playlist — Morning Calm is waiting for you\\n\\nNew content unlocks every few days. Check your journey at lofibuddha.com/account.\\n\\nWith calm,\\nThe LofiBuddha team",
    },
    nl: {
      subject: "Jouw Mindful Pad begint — welkom bij LofiBuddha",
      body: "Bedankt dat je het Mindful Pad bent gaan bewandelen.\\n\\nJe hebt nu onbeperkt toegang tot AI Buddha spirituele begeleiding, wekelijkse samengestelde Lofi-afspeellijsten, advertentievrije ambient audio downloads en een volledig advertentievrije ervaring.\\n\\nZo begin je:\\n\\n1. Chat met AI Buddha — je persoonlijke spirituele metgezel staat klaar op lofibuddha.com/chat\\n2. Verken de bibliotheek — blader door onze volledige collectie Lofi-soundscapes\\n3. Je eerste afspeellijst — Morning Calm wacht op je\\n\\nElke paar dagen wordt nieuwe content ontgrendeld. Bekijk je reis op lofibuddha.com/account.\\n\\nMet rust,\\nHet LofiBuddha team",
    },
  },
  enlightened: {
    en: {
      subject: "The Enlightened Path awaits — welcome to LofiBuddha",
      body: "You've chosen the deepest journey.\\n\\nThe Enlightened Path includes everything from Mindful Path, plus personalized daily guided meditations, custom spiritual roadmaps tailored to your goals, and priority access to everything new.\\n\\nHere's how to begin your transformation:\\n\\n1. Chat with AI Buddha — start a deep conversation at lofibuddha.com/chat\\n2. Your first personalized meditation — AI Buddha will guide you based on how you're feeling today\\n3. Spiritual roadmap — answer a few questions to receive your custom path\\n4. Premium library — full access to all ambient albums and exclusive tracks\\n\\nYour journey unfolds day by day. Track your progress at lofibuddha.com/account.\\n\\nIn stillness,\\nThe LofiBuddha team",
    },
    nl: {
      subject: "Het Verlichte Pad wacht — welkom bij LofiBuddha",
      body: "Je hebt voor de diepste reis gekozen.\\n\\nHet Verlichte Pad omvat alles van het Mindful Pad, plus gepersonaliseerde dagelijkse geleide meditaties, spirituele routekaarten op maat van jouw doelen, en prioriteitstoegang tot al het nieuwe.\\n\\nZo begin je je transformatie:\\n\\n1. Chat met AI Buddha — begin een diep gesprek op lofibuddha.com/chat\\n2. Je eerste gepersonaliseerde meditatie — AI Buddha begeleidt je op basis van hoe je je vandaag voelt\\n3. Spirituele routekaart — beantwoord een paar vragen om je persoonlijke pad te ontvangen\\n4. Premium bibliotheek — volledige toegang tot alle ambient albums en exclusieve tracks\\n\\nJe reis ontvouwt zich dag na dag. Volg je voortgang op lofibuddha.com/account.\\n\\nIn stilte,\\nHet LofiBuddha team",
    },
  },
};

export async function sendWelcomeEmail(
  email: string,
  tier: string,
  language: string = "en"
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const templates = WELCOME_TEMPLATES[tier] || WELCOME_TEMPLATES.mindful;
  const template = templates[language] || templates.en;
  const langName = { en: "English", nl: "Nederlands" }[language] || language;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lofibuddha.com";

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Inter',-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,0.06)">
      
      <!-- Header -->
      <tr><td style="background:#1c1917;padding:40px 40px 32px;text-align:center">
        <p style="margin:0;color:#b08050;font-size:10px;letter-spacing:3px;text-transform:uppercase">lofibuddha · ${langName}</p>
        <h1 style="margin:16px 0 0;color:#faf8f5;font-size:22px;font-weight:300;line-height:1.3;font-family:'Playfair Display',Georgia,serif">${template.subject}</h1>
      </td></tr>
      
      <!-- Content -->
      <tr><td style="padding:32px 40px;color:#44403c;font-size:15px;line-height:1.8">
        ${template.body.split("\\n").map((p) => {
          if (p.startsWith("1.") || p.startsWith("2.") || p.startsWith("3.") || p.startsWith("4.")) {
            return `<p style="margin:0 0 12px;padding-left:8px;border-left:2px solid #b08050">${p}</p>`;
          }
          if (!p.trim()) return "<br>";
          return `<p style="margin:0 0 16px">${p}</p>`;
        }).join("")}
      </td></tr>
      
      <!-- CTA -->
      <tr><td style="padding:8px 40px 16px;text-align:center">
        <a href="${baseUrl}/account" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:14px 36px;border-radius:30px;font-size:14px;font-weight:400;letter-spacing:0.5px">View your journey</a>
      </td></tr>

      <!-- AI Buddha CTA -->
      <tr><td style="padding:0 40px 32px;text-align:center">
        <a href="https://lofibuddha.com/chat" style="display:inline-block;color:#b08050;text-decoration:none;font-size:13px;border-bottom:1px solid rgba(176,128,80,0.3);padding-bottom:2px">Chat with AI Buddha →</a>
      </td></tr>
      
      <!-- Footer -->
      <tr><td style="padding:24px 40px 32px;text-align:center;border-top:1px solid rgba(0,0,0,0.06)">
        <p style="margin:0;color:#78716c;font-size:11px">You received this email because you subscribed to LofiBuddha.</p>
        <p style="margin:8px 0 0;color:#78716c;font-size:11px">
          <a href="${baseUrl}/api/subscribers?action=unsubscribe&email=${encodeURIComponent(email)}" style="color:#b08050;text-decoration:underline">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "LofiBuddha <welcome@lofibuddha.com>",
        to: email,
        subject: template.subject,
        html,
      }),
    });

    if (resp.ok) {
      return { success: true };
    } else {
      const data = await resp.json();
      return { success: false, error: JSON.stringify(data) };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
