import { useCallback } from "react";
import { useRouter } from "expo-router";

/**
 * Closes a screen the way the user expects. `router.back()` alone is a dead
 * button when the screen was opened straight from a URL — a shared link, a
 * bookmark, or a page refresh on web — because there is no history to pop.
 */
export function useDismiss(fallback: string = "/") {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallback as never);
  }, [router, fallback]);
}
