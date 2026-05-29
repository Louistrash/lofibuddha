import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disclaimer — LofiBuddha" };

export default function DisclaimerPage() {
  return (
    <>
      <h1>Disclaimer</h1>
      <p className="text-text-muted text-sm -mt-2 mb-8">Last updated: June 2026</p>

      <h2>1. General Information</h2>
      <p>The content provided by <strong>LofiBuddha</strong> (lofibuddha.com) is for <strong>informational and entertainment purposes only</strong>. While we strive to provide high-quality, beneficial content, nothing on our platform constitutes professional advice of any kind.</p>

      <div className="bg-bg-hover border border-accent/20 rounded-xl p-5 my-6">
        <h3 className="!text-accent-light !text-base !mt-0 !mb-2">⚠️ Important Notice</h3>
        <p className="!m-0">
          LofiBuddha is <strong>not</strong> a healthcare provider. Our yoga, meditation, breathwork, and mindfulness content is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health professionals.
        </p>
      </div>

      <h2>2. Medical Disclaimer</h2>
      <p>Our yoga flows, meditation sessions, breathwork exercises, and relaxation techniques are designed for general wellness. However:</p>
      <ul>
        <li>Consult your physician before beginning any new exercise or wellness program</li>
        <li>Stop immediately if you experience pain, dizziness, or discomfort</li>
        <li>Our content does not treat or cure any medical condition</li>
        <li>If you have a medical emergency, contact emergency services immediately</li>
      </ul>

      <h2>3. Mental Health Disclaimer</h2>
      <p>While mindfulness and meditation can support mental wellbeing, LofiBuddha is <strong>not</strong> a mental health service. Our content is not a replacement for therapy, counseling, or psychiatric care. If you are experiencing a mental health crisis:</p>
      <ul>
        <li>🇳🇱 Netherlands: Call 113 Suicide Prevention at <strong>0800-0113</strong></li>
        <li>🇪🇺 Europe: Call <strong>116 123</strong> (emotional support)</li>
        <li>🇺🇸 United States: Call or text <strong>988</strong></li>
        <li>🌍 International: Visit <strong>befrienders.org</strong> for local helplines</li>
      </ul>

      <h2>4. AI-Generated Content</h2>
      <p>Some content on LofiBuddha — including AI-generated music, meditation scripts, and written content — is produced using artificial intelligence tools. While we curate and review AI-generated content, we make no guarantees about its accuracy, completeness, or suitability for any purpose.</p>

      <h2>5. External Links</h2>
      <p>Our website may contain links to third-party websites (YouTube, Spotify, Apple Podcasts, social media platforms). We do not control or endorse the content of these external sites and are not responsible for their practices or policies.</p>

      <h2>6. Earnings & Results Disclaimer</h2>
      <p>Any testimonials, reviews, or success stories shared on our platform represent individual experiences. Results from using our wellness content vary from person to person. We make no guarantees about specific outcomes.</p>

      <h2>7. No Professional Relationship</h2>
      <p>Using LofiBuddha does not create a professional relationship of any kind — not doctor-patient, therapist-client, teacher-student, or coach-client. Our content is for self-guided use only.</p>

      <h2>8. Affiliate Disclosure</h2>
      <p>LofiBuddha may participate in affiliate marketing programs. This means we may earn a commission when you purchase through some links on our site — at no extra cost to you. We only recommend products we genuinely believe in.</p>

      <h2>9. Limitation of Liability</h2>
      <p>By using LofiBuddha, you acknowledge that:</p>
      <ul>
        <li>You use our content at your own risk</li>
        <li>We are not liable for any injury, loss, or damage resulting from the use of our content</li>
        <li>You are responsible for your own health and safety decisions</li>
      </ul>

      <h2>10. Contact</h2>
      <p>For questions about this disclaimer:</p>
      <ul>
        <li>Email: <strong>legal@lofibuddha.com</strong></li>
      </ul>
    </>
  );
}
