import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — LofiBuddha",
  description: "LofiBuddha privacy policy — how we handle your data, subscriptions, and content preferences.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: June 2026</p>

      <p>
        At <strong>LofiBuddha</strong>, your privacy is fundamental to our philosophy. We believe that peace of mind extends to how we handle your data. This policy explains what information we collect, how we use it, and your rights.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Account Information</h3>
      <p>
        When you create an account or subscribe, we collect your <strong>email address</strong> and <strong>name</strong> (optional). Payment information is processed securely through <strong>Stripe</strong> — we never see or store your credit card details.
      </p>

      <h3>1.2 Newsletter Subscriptions</h3>
      <p>
        If you subscribe to our newsletter, we store your email address to send you weekly calm tips and lofi mixes. You can unsubscribe at any time with one click.
      </p>

      <h3>1.3 Usage Analytics</h3>
      <p>
        We collect <strong>anonymous</strong> usage data: pages visited, content streamed, features used. This helps us improve the experience. No personal identifiers are included.
      </p>

      <h3>1.4 Language Preferences</h3>
      <p>
        Your selected language (EN, NL, ES, DE, FR, HI) is saved in your browser and never transmitted to our servers.
      </p>

      <h3>1.5 Cookies</h3>
      <p>
        We use <strong>zero advertising cookies</strong>. Only essential cookies for language, session, and — if you consent — anonymous analytics.
      </p>

      <h2>2. How We Use Your Data</h2>
      <p>We use collected information exclusively to:</p>
      <ul>
        <li>Provide and improve our services (lofi music, yoga content, meditation)</li>
        <li>Send newsletters and updates (only if you opted in)</li>
        <li>Process subscription payments via Stripe</li>
        <li>Analyze anonymous usage patterns to improve content</li>
        <li>Comply with legal obligations</li>
      </ul>

      <div className="legal-notice">
        <p>
          <strong>We do not sell your data.</strong> We do not share it with advertisers, use tracking cookies, or build user profiles for commercial purposes.
        </p>
      </div>

      <h2>3. Data Storage & Security</h2>
      <p>
        Your data is stored on secure servers within the European Union. We implement industry-standard security measures including encryption, access controls, and regular security audits.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>We use a limited number of trusted third-party services:</p>
      <ul>
        <li><strong>Stripe</strong> — for payment processing (Stripe's privacy policy applies to payment data)</li>
        <li><strong>YouTube</strong> — embedded video content (YouTube's privacy policy applies when you interact with videos)</li>
        <li><strong>Privacy-focused analytics</strong> — anonymous, no personal identifiers</li>
      </ul>

      <h2>5. Your Rights (GDPR)</h2>
      <p>Under GDPR and applicable privacy laws, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> — request any personal data we hold about you</li>
        <li><strong>Correction</strong> — fix inaccurate information</li>
        <li><strong>Deletion</strong> — right to be forgotten</li>
        <li><strong>Portability</strong> — receive your data in a standard format</li>
        <li><strong>Objection</strong> — object to processing of your data</li>
      </ul>
      <p>To exercise any of these rights, email us at <strong>privacy@lofibuddha.com</strong>.</p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal data only as long as necessary for the purposes described in this policy. Newsletter subscribers can unsubscribe at any time. Account data is deleted within 30 days of account closure.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        Our services are not directed at children under 16. We do not knowingly collect data from children.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy occasionally. Significant changes will be communicated via email (if subscribed) or a notice on our website.
      </p>

      <h2>9. Contact</h2>
      <p>For privacy-related questions or requests:</p>
      <ul>
        <li>Email: <strong>privacy@lofibuddha.com</strong></li>
        <li>Website: <strong>lofibuddha.com</strong></li>
      </ul>
    </>
  );
}
