"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import { CMS_NAV, isNavActive } from "@/lib/cms-nav";
import CmsNavLink from "./cms/CmsNavLink";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const panelClass =
  "flex flex-col h-screen bg-bg-glass backdrop-blur-2xl border-r border-border";

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/studio" className="flex items-center gap-3 min-w-0 group">
      <NextImage
        src="/lofibuddha.png"
        alt="LofiBuddha"
        width={39}
        height={39}
        className="rounded-xl flex-shrink-0 ring-1 ring-border/60 group-hover:ring-accent/30 transition-all"
      />
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-semibold text-text-primary text-sm tracking-wide truncate">LofiBuddha</p>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">CMS</p>
        </div>
      )}
    </Link>
  );
}

function NavSection({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed?: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      {!collapsed && (
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Workspace
        </p>
      )}
      {CMS_NAV.map((item) => (
        <CmsNavLink
          key={item.href}
          item={item}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function SidebarFooter({
  collapsed,
  onCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const settingsActive = isNavActive(pathname, "/settings");

  return (
    <div className="p-3 border-t border-border space-y-1">
      <Link
        href="/settings"
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          settingsActive
            ? "bg-accent/10 text-accent-light"
            : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
        }`}
      >
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            settingsActive ? "bg-accent/15" : "bg-bg-hover group-hover:bg-bg-card"
          }`}
        >
          <Settings size={16} />
        </span>
        {!collapsed && <span className="text-sm font-medium">Settings</span>}
      </Link>
      <button
        type="button"
        onClick={onCollapse}
        className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-all duration-200"
      >
        <span className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </span>
        {!collapsed && <span className="text-sm">Collapse</span>}
      </button>
    </div>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed left-0 top-0 z-50 w-[260px] ${panelClass} lg:hidden`}
            >
              <div className="h-16 flex items-center px-5 border-b border-border">
                <Brand />
              </div>
              <NavSection pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter
                collapsed={false}
                onCollapse={() => setCollapsed((c) => !c)}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        className={`hidden lg:flex sticky top-0 shrink-0 z-30 ${panelClass}`}
      >
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Brand collapsed={collapsed} />
        </div>
        <NavSection collapsed={collapsed} pathname={pathname} />
        <SidebarFooter collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} />
      </motion.aside>
    </>
  );
}
