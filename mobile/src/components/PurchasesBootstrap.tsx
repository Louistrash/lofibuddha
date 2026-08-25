import React, { useEffect } from "react";
import { configurePurchases } from "@/src/lib/purchases";

export function PurchasesBootstrap({ userId }: { userId?: string | null }) {
  useEffect(() => {
    configurePurchases(userId).catch(() => {});
  }, [userId]);
  return null;
}
