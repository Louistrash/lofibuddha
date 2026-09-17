import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display, DM_Serif_Display, Fraunces, Rozha_One } from "next/font/google";
import { AuthProvider } from "@/lib/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const jakarta = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
  preload: true,
});

const rozha = Rozha_One({
  subsets: ["latin", "latin-ext", "devanagari"],
  weight: "400",
  variable: "--font-hindi",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08070C",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lofibuddha.com"),
  title: "LofiBuddha — Lofi Music, Meditation & Mindfulness",
  description:
    "Curated lofi music, guided meditation, yoga flows, and breathwork for focus, relaxation, and deep calm. Discover your daily dose of peace.",
  keywords: [
    "lofi music", "meditation music", "mindfulness", "yoga music",
    "focus music", "relaxation", "breathwork", "calm music",
    "study music", "sleep music", "wellness", "guided meditation",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://lofibuddha.com" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/bodhi-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/bodhi-icon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/bodhi-icon-180.png",
    other: [
      { rel: "icon", url: "/bodhi-icon-192.png", sizes: "192x192" },
      { rel: "icon", url: "/bodhi-icon-512.png", sizes: "512x512" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "LofiBuddha",
    title: "LofiBuddha — Lofi Music, Meditation & Mindfulness",
    description:
      "Curated lofi music, guided meditation, yoga flows, and breathwork for focus, relaxation, and deep calm.",
    url: "https://lofibuddha.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LofiBuddha — Lofi music, meditation & mindfulness" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LofiBuddha — Lofi Music, Meditation & Mindfulness",
    description:
      "Curated lofi music, guided meditation, yoga flows, and breathwork for focus, relaxation, and deep calm.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LofiBuddha",
    url: "https://lofibuddha.com",
    logo: "https://lofibuddha.com/bodhi-icon-512.png",
    description:
      "Curated lofi music, guided meditation, yoga flows, and breathwork for focus, relaxation, and deep calm.",
    sameAs: ["https://www.youtube.com/@lofibuddha"],
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LofiBuddha",
    url: "https://lofibuddha.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://lofibuddha.com/explore?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      </head>
      <body className={jakarta.variable + " " + playfair.variable + " " + dmSerif.variable + " " + fraunces.variable + " " + rozha.variable + " antialiased bg-bg-primary text-text-primary"}>
        <AuthProvider>{children}</AuthProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
