import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — LofiBuddha",
  description: "LofiBuddha terms and conditions — subscriptions, content usage, and limitations.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms & Conditions</h1>
      <p className="legal-updated">Last updated: June 2026</p>

      <p>
        By accessing or using <strong>LofiBuddha</strong> (lofibuddha.com) and its related services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.
      </p>

      <h2>1. Services</h2>
      <p>LofiBuddha provides:</p>
      <ul>
        <li>Lofi music streaming and downloads</li>
        <li>Guided yoga and meditation content</li>
        <li>Breathwork and mindfulness exercises</li>
        <li>Community features and newsletters</li>
        <li>Premium content via paid subscriptions</li>
      </ul>
      <p>We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.</p>

      <h2>2. Subscriptions & Payments</h2>

      <h3>2.1 Free Tier</h3>
      <p>
        LofiBuddha offers a free tier with access to lofi soundscapes, limited spiritual chat queries via AI Buddha, and a basic meditation timer. No payment is required.
      </p>

      <h3>2.2 Paid Subscriptions</h3>
      <p>
        We offer two paid tiers — Mindful Path (€4.99/month) and Enlightened Path (€12.99/month). Subscription fees are billed in advance via Stripe. Prices are in Euros (€) and include applicable VAT.
      </p>

      <h3>2.3 Cancellation</h3>
      <p>
        You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods, except as required by law.
      </p>

      <h2>3. Intellectual Property</h2>
      <p>
        All content on LofiBuddha — including music, videos, graphics, logos, text, and software — is the exclusive property of LofiBuddha or its content suppliers and is protected by copyright and other intellectual property laws.
      </p>
      <p>You may stream content for personal, non-commercial use. You may not:</p>
      <ul>
        <li>Redistribute, resell, or sublicense our content</li>
        <li>Use our content in your own products or services</li>
        <li>Remove copyright notices or watermarks</li>
        <li>Scrape, data-mine, or systematically download our content</li>
      </ul>

      <h2>4. Disclaimer of Warranties</h2>
      <p>
        Our services are provided <strong>&quot;as is&quot;</strong> without warranties of any kind. LofiBuddha is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health professionals.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, LofiBuddha shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.
      </p>

      <h2>6. Termination</h2>
      <p>
        We may terminate or suspend your access to our services at our discretion, without prior notice, for conduct that we believe violates these terms or is harmful to other users or our business.
      </p>

      <h2>7. Governing Law</h2>
      <p>
        These terms are governed by the laws of the Netherlands. Any disputes shall be resolved in the competent courts of Amsterdam, Netherlands.
      </p>

      <h2>8. Changes to Terms</h2>
      <p>
        We may update these terms periodically. Material changes will be communicated via email or a notice on our website. Continued use after changes constitutes acceptance of the new terms.
      </p>

      <h2>9. Contact</h2>
      <ul>
        <li>Email: <strong>contact@lofibuddha.com</strong></li>
        <li>Website: <strong>lofibuddha.com</strong></li>
      </ul>
    </>
  );
}
