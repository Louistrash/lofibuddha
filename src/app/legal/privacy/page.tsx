import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — LofiBuddha" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-text-muted text-sm -mt-2 mb-8">Last updated: June 2026</p>

      <p>At <strong>LofiBuddha</strong>, your privacy is fundamental to our philosophy. We believe that peace of mind extends to how we handle your data. This policy explains what information we collect, how we use it, and your rights.</p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Information You Provide</h3>
      <p>When you sign up for our newsletter, create an account, or contact us, we may collect:</p>
      <ul>
        <li>Email address</li>
        <li>Name (optional)</li>
        <li>Any information you include in messages to us</li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <p>When you visit lofibuddha.com, we automatically collect:</p>
      <ul>
        <li><strong>Usage data:</strong> Pages visited, time spent, interactions with content</li>
        <li><strong>Device information:</strong> Browser type, operating system, screen resolution</li>
        <li><strong>IP address:</strong> Anonymized for analytics purposes</li>
      </ul>

      <h3>1.3 Cookies</h3>
      <p>We use minimal cookies:</p>
      <ul>
        <li><strong>Essential cookies:</strong> For site functionality (language preference, session)</li>
        <li><strong>Analytics cookies:</strong> Anonymous usage statistics (if you consent)</li>
        <li><strong>No advertising/tracking cookies.</strong> Ever.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use collected information exclusively to:</p>
      <ul>
        <li>Provide and improve our services (lofi music, yoga content, meditation)</li>
        <li>Send newsletters and updates (only if you opted in)</li>
        <li>Respond to your inquiries and support requests</li>
        <li>Analyze anonymous usage patterns to improve content</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p className="bg-bg-hover border border-border/30 rounded-xl p-4 text-sm">
        <strong>🚫 We do NOT:</strong> Sell your data, share it with advertisers, or use it for any purpose beyond delivering our mindfulness content.
      </p>

      <h2>3. Data Storage & Security</h2>
      <p>Your data is stored securely on servers within the European Union. We implement industry-standard security measures including encryption, access controls, and regular security audits.</p>

      <h2>4. Third-Party Services</h2>
      <p>We use a limited number of trusted third-party services:</p>
      <ul>
        <li><strong>Stripe:</strong> For payment processing (Stripe's privacy policy applies to payment data)</li>
        <li><strong>YouTube:</strong> Embedded video content (YouTube's privacy policy applies when you interact with videos)</li>
        <li><strong>Analytics:</strong> Anonymous, privacy-focused analytics (no personal identifiers)</li>
      </ul>

      <h2>5. Your Rights</h2>
      <p>Under GDPR and applicable privacy laws, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> your personal data</li>
        <li><strong>Correct</strong> inaccurate data</li>
        <li><strong>Delete</strong> your data ("right to be forgotten")</li>
        <li><strong>Export</strong> your data in a portable format</li>
        <li><strong>Object</strong> to processing of your data</li>
        <li><strong>Withdraw consent</strong> at any time</li>
      </ul>
      <p>To exercise any of these rights, email us at <strong>privacy@lofibuddha.com</strong>.</p>

      <h2>6. Data Retention</h2>
      <p>We retain your personal data only as long as necessary for the purposes described in this policy. Newsletter subscribers can unsubscribe at any time. Account data is deleted within 30 days of account closure.</p>

      <h2>7. Children's Privacy</h2>
      <p>Our services are not directed at children under 16. We do not knowingly collect data from children. If you believe a child has provided us with personal data, please contact us immediately.</p>

      <h2>8. Changes to This Policy</h2>
      <p>We may update this policy occasionally. Significant changes will be communicated via email (if subscribed) or a notice on our website. Continued use of our services after changes constitutes acceptance.</p>

      <h2>9. Contact</h2>
      <p>For privacy-related questions or requests:</p>
      <ul>
        <li>Email: <strong>privacy@lofibuddha.com</strong></li>
        <li>Website: <strong>lofibuddha.com</strong></li>
      </ul>
    </>
  );
}
