"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 lg:ml-[260px] transition-all duration-300">
        <Header onMenuToggle={() => setMobileOpen(prev => !prev)} mobileOpen={mobileOpen} />
        <div className="p-4 sm:p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
