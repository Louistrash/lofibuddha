"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHermes = pathname === "/hermes";

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {!isHermes && <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}
        <main className="flex-1 min-w-0 overflow-x-hidden transition-all duration-300">
          {!isHermes && (
            <Header onMenuToggle={() => setMobileOpen(prev => !prev)} mobileOpen={mobileOpen} />
          )}
          <div className={isHermes ? "h-screen" : "p-4 sm:p-6 max-w-7xl mx-auto"}>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
