"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import CmsShell from "@/components/cms/CmsShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHermes = pathname === "/hermes";

  return (
    <ProtectedRoute>
      <CmsShell bare={isHermes}>{children}</CmsShell>
    </ProtectedRoute>
  );
}
