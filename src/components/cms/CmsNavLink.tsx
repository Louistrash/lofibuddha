"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CmsNavItem } from "@/lib/cms-nav";
import { isNavActive } from "@/lib/cms-nav";

interface CmsNavLinkProps {
  item: CmsNavItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function CmsNavLink({ item, pathname, collapsed, onNavigate }: CmsNavLinkProps) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-accent/10 text-accent-light"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
      }`}
    >
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          active ? "bg-accent/15" : "bg-bg-hover group-hover:bg-bg-card"
        }`}
      >
        <Icon
          size={16}
          className={active ? "text-accent-light" : "text-text-muted group-hover:text-text-secondary"}
        />
      </span>

      {!collapsed && (
        <>
          <span className="text-sm font-medium truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent-light font-semibold shrink-0">
              {item.badge}
            </span>
          )}
          {active && (
            <motion.div
              layoutId="cmsActiveNav"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </Link>
  );
}
