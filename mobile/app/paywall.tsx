import React from "react";
import { Redirect } from "expo-router";

/**
 * The screen used to live here. Kept as a redirect so old links, bookmarks and
 * anything already shipped (store metadata, emails) keep working.
 */
export default function PaywallRedirect() {
  return <Redirect href="/deepen" />;
}
