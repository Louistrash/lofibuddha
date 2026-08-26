import { ScrollViewStyleReset } from "expo-router/html";
import type { ReactNode } from "react";

const TITLE = "LofiBuddha — Lofi Music, Meditation & Mindfulness";
const DESCRIPTION =
  "Lofi music, guided meditation and breathwork for focus, calm and deep sleep.";
const SITE = "https://lofibuddha.com";
const SOCIAL_IMAGE = `${SITE}/bodhi-icon-512.png`;

/**
 * Web-only document shell. Runs in Node during static rendering, so it has no
 * access to the DOM. Icons are served from the Next.js site so the app and the
 * marketing site share one source of truth.
 */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#08070C" />

        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
        <link rel="icon" href="/bodhi-icon-48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/bodhi-icon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/bodhi-icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/bodhi-icon-180.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-title" content="LofiBuddha" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="LofiBuddha" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={SOCIAL_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={SOCIAL_IMAGE} />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: baseStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const baseStyles = `
body {
  background-color: #08070C;
  color-scheme: dark;
}
::selection {
  background-color: rgba(228, 184, 114, 0.3);
}`;
