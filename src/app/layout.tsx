import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LofiBuddha — Your Daily Dose of Calm",
  description:
    "Unlimited lofi music, guided yoga flows, breathwork, and meditation. Start your free trial.",
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
    title: "LofiBuddha — Your Daily Dose of Calm",
    description:
      "Unlimited lofi music, guided yoga flows, breathwork, and meditation.",
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
      <body className={`${inter.variable} antialiased bg-bg-primary text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
