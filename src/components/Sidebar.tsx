"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Share2,
  Video,
  Image,
  Podcast,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Mail,
} from "lucide-react";

import NextImage from "next/image";

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/content", label: "Content", icon: FileText, badge: "AI" },
  { href: "/social", label: "Social", icon: Share2 },
  { href: "/video", label: "Video", icon: Video },
  { href: "/images", label: "Images", icon: Image },
  { href: "/studio", label: "Studio", icon: Podcast },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/newsletter", label: "Newsletter", icon: Mail },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/hermes", label: "Hermes AI", icon: Bot, badge: "Chat" },
];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            {/* Mobile panel */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen z-50 w-[260px] bg-bg-surface border-r border-border flex flex-col lg:hidden"
            >
              {/* Logo */}
              <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
                <NextImage
                  src="/lofibuddha.png"
                  alt="Bodhi"
                  width={39}
                  height={39}
                  className="rounded-xl flex-shrink-0"
                />
                <span className="font-semibold text-text-primary text-sm tracking-wide">
                  Bodhi OS
                </span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-accent/10 text-accent-light"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                <span className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0"><Icon size={16} /></span>
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent-light font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Settings */}
              <div className="p-3 border-t border-border">
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
                >
                  <Settings size={20} />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-40 bg-bg-surface border-r border-border flex-col transition-none`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <NextImage
            src="/lofibuddha.png"
            alt="Bodhi"
            width={39}
            height={39}
            className="rounded-xl flex-shrink-0"
          />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-text-primary text-sm tracking-wide"
            >
              Bodhi OS
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-accent/10 text-accent-light"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center flex-shrink-0"><Icon size={16} /></span>
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent-light font-semibold">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings + Collapse */}
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
          >
            <Settings size={20} />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}