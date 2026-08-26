/**
 * Legal content — one source of truth for web, iOS and Android.
 *
 * Wording is intentionally kept in sync with the published policies; only the
 * presentation lives in the components. Inline **bold** is supported.
 */

import { colors } from "@/src/theme/tokens";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "notice"; text: string };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  slug: "privacy" | "terms" | "disclaimer";
  title: string;
  script: string;
  kicker: string;
  updated: string;
  accent: string;
  intro: string;
  sections: LegalSection[];
  contact: { label: string; value: string }[];
};

export const LEGAL_UPDATED = "August 2026";

export const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  script: "गोपनीयता",
  kicker: "PRIVACY",
  updated: LEGAL_UPDATED,
  accent: colors.jade,
  intro:
    "At **LofiBuddha**, your privacy is fundamental to our philosophy. We believe that peace of mind extends to how we handle your data. This policy explains what information we collect, how we use it, and your rights.",
  sections: [
    {
      title: "1. Information We Collect",
      blocks: [
        { kind: "h3", text: "1.1 Account Information" },
        {
          kind: "p",
          text: "When you create an account or subscribe, we collect your **email address** and **name** (optional). Payment information is processed securely through **Stripe** — we never see or store your credit card details.",
        },
        { kind: "h3", text: "1.2 Newsletter Subscriptions" },
        {
          kind: "p",
          text: "If you subscribe to our newsletter, we store your email address to send you weekly calm tips and lofi mixes. You can unsubscribe at any time with one click.",
        },
        { kind: "h3", text: "1.3 Usage Analytics" },
        {
          kind: "p",
          text: "We collect **anonymous** usage data: pages visited, content streamed, features used. This helps us improve the experience. No personal identifiers are included.",
        },
        { kind: "h3", text: "1.4 Language Preferences" },
        {
          kind: "p",
          text: "Your selected language is saved on your device and never transmitted to our servers.",
        },
        { kind: "h3", text: "1.5 Cookies" },
        {
          kind: "p",
          text: "We use **zero advertising cookies**. Only essential cookies for language, session, and — if you consent — anonymous analytics.",
        },
      ],
    },
    {
      title: "2. How We Use Your Data",
      blocks: [
        { kind: "p", text: "We use collected information exclusively to:" },
        {
          kind: "list",
          items: [
            "Provide and improve our services (lofi music, breathwork, meditation)",
            "Send newsletters and updates (only if you opted in)",
            "Process subscription payments via Stripe",
            "Analyze anonymous usage patterns to improve content",
            "Comply with legal obligations",
          ],
        },
        {
          kind: "notice",
          text: "**We do not sell your data.** We do not share it with advertisers, use tracking cookies, or build user profiles for commercial purposes.",
        },
      ],
    },
    {
      title: "3. Data Storage & Security",
      blocks: [
        {
          kind: "p",
          text: "Your data is stored on secure servers within the European Union. We implement industry-standard security measures including encryption, access controls, and regular security audits.",
        },
      ],
    },
    {
      title: "4. Third-Party Services",
      blocks: [
        { kind: "p", text: "We use a limited number of trusted third-party services:" },
        {
          kind: "list",
          items: [
            "**Stripe** — payment processing on the web (Stripe's privacy policy applies to payment data)",
            "**Apple App Store / Google Play** — in-app purchases on iOS and Android",
            "**Firebase** — authentication and account storage",
            "**YouTube** — embedded video content (YouTube's privacy policy applies when you interact with videos)",
            "**Privacy-focused analytics** — anonymous, no personal identifiers",
          ],
        },
      ],
    },
    {
      title: "5. Your Rights (GDPR)",
      blocks: [
        { kind: "p", text: "Under GDPR and applicable privacy laws, you have the right to:" },
        {
          kind: "list",
          items: [
            "**Access** — request any personal data we hold about you",
            "**Correction** — fix inaccurate information",
            "**Deletion** — right to be forgotten",
            "**Portability** — receive your data in a standard format",
            "**Objection** — object to processing of your data",
          ],
        },
        {
          kind: "p",
          text: "To exercise any of these rights, email us at **contact@lofibuddha.com**.",
        },
      ],
    },
    {
      title: "6. Data Retention",
      blocks: [
        {
          kind: "p",
          text: "We retain your personal data only as long as necessary for the purposes described in this policy. Newsletter subscribers can unsubscribe at any time. Account data is deleted within 30 days of account closure.",
        },
      ],
    },
    {
      title: "7. Children's Privacy",
      blocks: [
        {
          kind: "p",
          text: "Our services are not directed at children under 16. We do not knowingly collect data from children.",
        },
      ],
    },
    {
      title: "8. Changes to This Policy",
      blocks: [
        {
          kind: "p",
          text: "We may update this policy occasionally. Significant changes will be communicated via email (if subscribed) or a notice in the app.",
        },
      ],
    },
  ],
  contact: [
    { label: "Email", value: "contact@lofibuddha.com" },
    { label: "Website", value: "lofibuddha.com" },
  ],
};

export const terms: LegalDoc = {
  slug: "terms",
  title: "Terms & Conditions",
  script: "नियम",
  kicker: "TERMS",
  updated: LEGAL_UPDATED,
  accent: colors.gold,
  intro:
    "By accessing or using **LofiBuddha** and its related services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.",
  sections: [
    {
      title: "1. Services",
      blocks: [
        { kind: "p", text: "LofiBuddha provides:" },
        {
          kind: "list",
          items: [
            "Lofi music and soundscape streaming",
            "Guided meditation and breathwork",
            "Immersive worlds and focus sessions",
            "Buddha AI — a reflective conversation companion",
            "Premium content via paid membership",
          ],
        },
        {
          kind: "p",
          text: "We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.",
        },
      ],
    },
    {
      title: "2. Membership & Payments",
      blocks: [
        { kind: "h3", text: "2.1 Free Tier (Zen)" },
        {
          kind: "p",
          text: "LofiBuddha offers a free tier with a daily practice, core soundscapes, and gently limited Buddha AI access. No payment is required.",
        },
        { kind: "h3", text: "2.2 Paid Membership" },
        {
          kind: "p",
          text: "We offer two paid tiers — **Mindful** (€4.99/month) and **Enlightened** (€12.99/month). Prices are in Euros (€) and include applicable VAT. On the web, fees are billed in advance via Stripe. On iOS and Android, purchases are handled by Apple or Google and billed to your store account.",
        },
        { kind: "h3", text: "2.3 Renewal & Cancellation" },
        {
          kind: "p",
          text: "Subscriptions renew automatically unless cancelled at least 24 hours before the current period ends. You may cancel at any time; cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods, except as required by law. Store purchases are cancelled through your Apple or Google account settings.",
        },
      ],
    },
    {
      title: "3. Intellectual Property",
      blocks: [
        {
          kind: "p",
          text: "All content on LofiBuddha — including music, videos, graphics, logos, text, and software — is the exclusive property of LofiBuddha or its content suppliers and is protected by copyright and other intellectual property laws.",
        },
        { kind: "p", text: "You may stream content for personal, non-commercial use. You may not:" },
        {
          kind: "list",
          items: [
            "Redistribute, resell, or sublicense our content",
            "Use our content in your own products or services",
            "Remove copyright notices or watermarks",
            "Scrape, data-mine, or systematically download our content",
          ],
        },
      ],
    },
    {
      title: "4. Disclaimer of Warranties",
      blocks: [
        {
          kind: "notice",
          text: 'Our services are provided **"as is"** without warranties of any kind. LofiBuddha is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health professionals.',
        },
      ],
    },
    {
      title: "5. Limitation of Liability",
      blocks: [
        {
          kind: "p",
          text: "To the maximum extent permitted by law, LofiBuddha shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.",
        },
      ],
    },
    {
      title: "6. Termination",
      blocks: [
        {
          kind: "p",
          text: "We may terminate or suspend your access to our services at our discretion, without prior notice, for conduct that we believe violates these terms or is harmful to other users or our business.",
        },
      ],
    },
    {
      title: "7. Governing Law",
      blocks: [
        {
          kind: "p",
          text: "These terms are governed by the laws of the Netherlands. Any disputes shall be resolved in the competent courts of Amsterdam, Netherlands.",
        },
      ],
    },
    {
      title: "8. Changes to Terms",
      blocks: [
        {
          kind: "p",
          text: "We may update these terms periodically. Material changes will be communicated via email or a notice in the app. Continued use after changes constitutes acceptance of the new terms.",
        },
      ],
    },
  ],
  contact: [
    { label: "Email", value: "contact@lofibuddha.com" },
    { label: "Website", value: "lofibuddha.com" },
  ],
};

export const disclaimer: LegalDoc = {
  slug: "disclaimer",
  title: "Disclaimer",
  script: "सूचना",
  kicker: "DISCLAIMER",
  updated: LEGAL_UPDATED,
  accent: colors.saffron,
  intro:
    "**LofiBuddha is not a healthcare provider.** Our meditation, breathwork, and mindfulness content is for informational and entertainment purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.",
  sections: [
    {
      title: "1. Mental Health Crisis Resources",
      blocks: [
        {
          kind: "notice",
          text: "If you are experiencing a mental health emergency or having thoughts of self-harm, please reach out to a crisis line in your country right away. You are not alone.",
        },
        {
          kind: "list",
          items: [
            "**Netherlands** — 0800-0113 (113 Suicide Prevention)",
            "**Europe** — 116 123 (Emotional Support)",
            "**United States** — 988 (Suicide & Crisis Lifeline)",
            "**International** — befrienders.org",
          ],
        },
      ],
    },
    {
      title: "2. Medical & Physical Disclaimer",
      blocks: [
        {
          kind: "p",
          text: "Our breathwork exercises and movement content are for general wellness. Consult your physician before beginning any new exercise or breathing program. Stop immediately if you experience pain, dizziness, or discomfort.",
        },
      ],
    },
    {
      title: "3. AI-Generated Content",
      blocks: [
        {
          kind: "p",
          text: "Some content on LofiBuddha — including AI-generated music, meditation scripts, and Buddha AI responses — is produced using artificial intelligence tools. While we curate and review AI-generated content, we make no guarantees about its accuracy, completeness, or suitability for any purpose. Buddha AI is a reflective companion, not a therapist or medical professional.",
        },
      ],
    },
    {
      title: "4. No Guaranteed Results",
      blocks: [
        {
          kind: "p",
          text: "Testimonials and reviews represent individual experiences. Results from using our wellness content vary from person to person. We make no guarantees about specific outcomes — physical, mental, or spiritual.",
        },
      ],
    },
    {
      title: "5. External Links",
      blocks: [
        {
          kind: "p",
          text: "Our services may contain links to third-party platforms (YouTube, Spotify, Apple Podcasts, social media). We do not control or endorse the content of these external sites and are not responsible for their practices or policies.",
        },
      ],
    },
    {
      title: "6. No Professional Relationship",
      blocks: [
        {
          kind: "p",
          text: "Using LofiBuddha does not create a professional relationship of any kind — not doctor-patient, therapist-client, teacher-student, or coach-client. Our content is for self-guided use only.",
        },
      ],
    },
    {
      title: "7. Affiliate Disclosure",
      blocks: [
        {
          kind: "p",
          text: "LofiBuddha may participate in affiliate marketing programs. This means we may earn a commission when you purchase through some links — at no extra cost to you. We only recommend products we genuinely believe in.",
        },
      ],
    },
  ],
  contact: [{ label: "Email", value: "contact@lofibuddha.com" }],
};

export const LEGAL_DOCS = { privacy, terms, disclaimer } as const;
