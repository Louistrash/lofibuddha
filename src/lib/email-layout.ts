/**
 * Shared HTML email shell for LofiBuddha (Resend / transactional / newsletter).
 * Logo must be a publicly reachable HTTPS URL (host after deploy).
 */

export const EMAIL_LOGO_URL =
  "https://lofibuddha.com/images/brand/lofibuddha-icon.png";

export const EMAIL = {
  bg: "#f4f0ea",
  card: "#ffffff",
  ink: "#1c1917",
  muted: "#78716c",
  body: "#44403c",
  gold: "#c49464",
  goldSoft: "#b08050",
  headerBg: "#1c1917",
  footerBg: "#f0ede8",
  rule: "rgba(0,0,0,0.06)",
} as const;

type ShellOpts = {
  lang: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  /** Optional block(s) between body and footer (CTAs, etc.) */
  afterBodyHtml?: string;
  footerHtml: string;
  width?: number;
};

/** Dark header with circular logo + wordmark + title. */
export function emailHeader(eyebrow: string, title: string): string {
  return `
      <tr><td style="background:${EMAIL.headerBg};padding:36px 40px 32px;text-align:center">
        <img src="${EMAIL_LOGO_URL}" width="72" height="72" alt="LofiBuddha" style="display:block;margin:0 auto 16px;border-radius:50%;border:2px solid ${EMAIL.goldSoft};width:72px;height:72px" />
        <p style="margin:0;color:${EMAIL.gold};font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${eyebrow}</p>
        <h1 style="margin:14px 0 0;color:#faf8f5;font-size:22px;font-weight:400;line-height:1.35;font-family:Georgia,'Times New Roman',serif">${title}</h1>
      </td></tr>`;
}

export function wrapEmailHtml(opts: ShellOpts): string {
  const width = opts.width ?? 560;
  return `<!DOCTYPE html>
<html lang="${opts.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Georgia,serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL.bg};padding:40px 16px">
  <tr><td align="center">
    <table role="presentation" width="${width}" cellpadding="0" cellspacing="0" style="max-width:${width}px;width:100%;background:${EMAIL.card};border-radius:16px;overflow:hidden;border:1px solid ${EMAIL.rule}">
      ${emailHeader(opts.eyebrow || "lofibuddha", opts.title)}
      <tr><td style="padding:32px 40px;color:${EMAIL.body};font-size:15px;line-height:1.8">
        ${opts.bodyHtml}
      </td></tr>
      ${opts.afterBodyHtml || ""}
      <tr><td style="padding:24px 40px 32px;text-align:center;background:${EMAIL.footerBg};border-top:1px solid ${EMAIL.rule}">
        ${opts.footerHtml}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
