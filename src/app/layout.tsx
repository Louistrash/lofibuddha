import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f0f",
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
  alternates: {
    canonical: "https://lofibuddha.com",
  },
  icons: {
    icon: [
      { url: "/lofibuddha.png", type: "image/png" },
      { url: "/bodhi-icon-32.png", sizes: "32x32", type: "image/png" },
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
    images: [
      {
        url: "/images/bg/bg-youtube.png",
        width: 1280,
        height: 720,
        alt: "LofiBuddha — Your daily dose of calm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LofiBuddha — Lofi Music, Meditation & Mindfulness",
    description:
      "Curated lofi music, guided meditation, yoga flows, and breathwork for focus, relaxation, and deep calm.",
    images: ["/images/bg/bg-youtube.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased bg-bg-primary text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
