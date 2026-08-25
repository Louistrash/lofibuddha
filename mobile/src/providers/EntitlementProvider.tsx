import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { useAuth } from "@/src/providers/AuthProvider";
import { apiFetch } from "@/src/lib/api";
import { hasProEntitlement } from "@/src/lib/purchases";

type EntitlementContextValue = {
  isPro: boolean;
  tier: string | null;
  dripDay: number | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  const [dripDay, setDripDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (Platform.OS !== "web") {
        const native = await hasProEntitlement();
        if (native) setIsPro(true);
      }
      if (user?.email) {
        const res = await apiFetch(
          `/api/subscriptions/status?email=${encodeURIComponent(user.email)}`,
          {},
          user.uid
        );
        if (res.ok) {
          const data = await res.json();
          setTier(data?.tier ?? null);
          setDripDay(typeof data?.dripDay === "number" ? data.dripDay : null);
          if (data?.active) setIsPro(true);
        }
      }
    } catch {
      // Offline or backend unavailable: keep the app usable in free mode.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ isPro, tier, dripDay, loading, refresh }),
    [isPro, tier, dripDay, loading, refresh]
  );

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement() {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error("useEntitlement must be used within EntitlementProvider");
  return ctx;
}
