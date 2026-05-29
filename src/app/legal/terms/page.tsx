import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions — LofiBuddha" };

export default function TermsPage() {
  return (
    <>
      <h1>Terms & Conditions</h1>
      <p className="text-text-muted text-sm -mt-2 mb-8">Last updated: June 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using <strong>LofiBuddha</strong> (lofibuddha.com) and its related services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.</p>

      <h2>2. Services</h2>
      <p>LofiBuddha provides:</p>
      <ul>
        <li>Lofi music streaming and downloads</li>
        <li>Guided yoga and meditation content</li>
        <li>Breathwork and mindfulness exercises</li>
        <li>Community features and newsletters</li>
        <li>Premium content via paid subscriptions</li>
      </ul>
      <p>We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.</p>

      <h2>3. User Accounts</h2>
      <p>When creating an account, you agree to:</p>
      <ul>
        <li>Provide accurate and complete registration information</li>
        <li>Maintain the confidentiality of your password</li>
        <li>Accept responsibility for all activities under your account</li>
        <li>Notify us immediately of any unauthorized use</li>
      </ul>
      <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>

      <h2>4. Subscriptions & Payments</h2>

      <h3>4.1 Free Trial</h3>
      <p>We may offer a 7-day free trial. You can cancel anytime during the trial period without charge. After the trial, your chosen subscription plan will begin automatically.</p>

      <h3>4.2 Billing</h3>
      <p>Subscription fees are billed in advance on a monthly or annual basis. All payments are processed securely through Stripe. Prices are in Euros (€) and include applicable VAT.</p>

      <h3>4.3 Cancellation</h3>
      <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods, except as required by law.</p>

      <h2>5. Intellectual Property</h2>
      <p>All content on LofiBuddha — including music, videos, graphics, logos, text, and software — is the exclusive property of LofiBuddha or its content suppliers and is protected by copyright and other intellectual property laws.</p>

      <h3>5.1 What You Can Do</h3>
      <ul>
        <li>Stream content for personal, non-commercial use</li>
        <li>Download content for offline personal use (with Premium subscription)</li>
      </ul>

      <h3>5.2 What You Cannot Do</h3>
      <ul>
        <li>Redistribute, resell, or sublicense our content</li>
        <li>Use our content in your own products or services</li>
        <li>Remove copyright notices or watermarks</li>
        <li>Scrape, data-mine, or systematically download our content</li>
      </ul>

      <h2>6. User-Generated Content</h2>
      <p>If you post comments, reviews, or other content on our platform, you grant LofiBuddha a non-exclusive, royalty-free license to use, display, and distribute that content in connection with our services. You retain ownership of your content.</p>

      <h2>7. Disclaimer of Warranties</h2>
      <p>Our services are provided <strong>&quot;as is&quot;</strong> without warranties of any kind. While we strive for quality, we do not guarantee:</p>
      <ul>
        <li>Uninterrupted or error-free service</li>
        <li>Specific health or wellness outcomes</li>
        <li>Compatibility with all devices</li>
      </ul>
      <p><strong>LofiBuddha is not a substitute for professional medical advice, diagnosis, or treatment.</strong></p>

      <h2>8. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, LofiBuddha shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.</p>

      <h2>9. Termination</h2>
      <p>We may terminate or suspend your access to our services at our discretion, without prior notice, for conduct that we believe violates these terms or is harmful to other users or our business.</p>

      <h2>10. Governing Law</h2>
      <p>These terms are governed by the laws of the Netherlands. Any disputes shall be resolved in the competent courts of Amsterdam, Netherlands.</p>

      <h2>11. Changes to Terms</h2>
      <p>We may update these terms periodically. Material changes will be communicated via email or website notice. Continued use after changes constitutes acceptance of the new terms.</p>

      <h2>12. Contact</h2>
      <ul>
        <li>Email: <strong>legal@lofibuddha.com</strong></li>
        <li>Website: <strong>lofibuddha.com</strong></li>
      </ul>
    </>
  );
}
