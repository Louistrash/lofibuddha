import { Redirect } from "expo-router";

/** Canonical legal pages live under /legal/* — keep short URLs working for store listings. */
export default function PrivacyRedirect() {
  return <Redirect href="/legal/privacy" />;
}
