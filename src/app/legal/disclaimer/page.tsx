import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — LofiBuddha",
  description: "LofiBuddha disclaimer — medical advice, content limitations, and crisis resources.",
};

export default function DisclaimerPage() {
  return (
    <>
      <h1>Disclaimer</h1>
      <p className="legal-updated">Last updated: June 2026</p>

      <div className="legal-notice">
        <p>
          <strong>LofiBuddha is not a healthcare provider.</strong> Our yoga, meditation, breathwork, and mindfulness content is for informational and entertainment purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </div>

      <h2>1. Mental Health Crisis Resources</h2>
      <p>If you are experiencing a mental health emergency or having thoughts of self-harm, please contact:</p>
      <ul>
        <li><strong>Netherlands:</strong> 0800-0113 (113 Suicide Prevention)</li>
        <li><strong>Europe:</strong> 116 123 (Emotional Support)</li>
        <li><strong>United States:</strong> 988 (Suicide & Crisis Lifeline)</li>
        <li><strong>International:</strong> befrienders.org</li>
      </ul>

      <h2>2. Medical & Physical Disclaimer</h2>
      <p>
        Our yoga flows, breathwork exercises, and movement content are for general wellness. Consult your physician before beginning any new exercise program. Stop immediately if you experience pain, dizziness, or discomfort.
      </p>

      <h2>3. AI-Generated Content</h2>
      <p>
        Some content on LofiBuddha — including AI-generated music, meditation scripts, and written content — is produced using artificial intelligence tools. While we curate and review AI-generated content, we make no guarantees about its accuracy, completeness, or suitability for any purpose.
      </p>

      <h2>4. No Guaranteed Results</h2>
      <p>
        Testimonials and reviews represent individual experiences. Results from using our wellness content vary from person to person. We make no guarantees about specific outcomes — physical, mental, or spiritual.
      </p>

      <h2>5. External Links</h2>
      <p>
        Our website may contain links to third-party websites (YouTube, Spotify, Apple Podcasts, social media platforms). We do not control or endorse the content of these external sites and are not responsible for their practices or policies.
      </p>

      <h2>6. No Professional Relationship</h2>
      <p>
        Using LofiBuddha does not create a professional relationship of any kind — not doctor-patient, therapist-client, teacher-student, or coach-client. Our content is for self-guided use only.
      </p>

      <h2>7. Affiliate Disclosure</h2>
      <p>
        LofiBuddha may participate in affiliate marketing programs. This means we may earn a commission when you purchase through some links on our site — at no extra cost to you. We only recommend products we genuinely believe in.
      </p>

      <h2>8. Contact</h2>
      <p>For questions about this disclaimer:</p>
      <ul>
        <li>Email: <strong>legal@lofibuddha.com</strong></li>
      </ul>
    </>
  );
}
