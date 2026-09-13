import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Share2,
  Video,
  Image,
  Podcast,
  BookOpen,
  BarChart3,
  Settings,
  Bot,
  Mail,
  Users,
  Music,
} from "lucide-react";

export interface CmsNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const CMS_NAV: CmsNavItem[] = [
  { href: "/content", label: "Content", icon: FileText, badge: "AI" },
  { href: "/social", label: "Social", icon: Share2 },
  { href: "/video", label: "Video", icon: Video },
  { href: "/images", label: "Images", icon: Image },
  { href: "/sounds", label: "Sounds", icon: Music },
  { href: "/studio", label: "Studio", icon: Podcast },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/newsletter", label: "Newsletter", icon: Mail },
  { href: "/subscribers", label: "Subscribers", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/hermes", label: "Hermes OS", icon: Bot, badge: "Full" },
];

const PAGE_META: Record<string, { title: string; description?: string }> = {
  "/content": { title: "Content Hub", description: "Videos, posts & AI content" },
  "/content/generate": { title: "AI Writer", description: "Generate scripts & copy" },
  "/social": { title: "Social Automation", description: "Schedule & publish" },
  "/video": { title: "Video Studio", description: "HyperFrames rendering" },
  "/images": { title: "Image Gallery", description: "Brand assets & AI art" },
  "/sounds": { title: "Sound Library", description: "Upload & manage audio" },
  "/studio": { title: "Podcast Studio", description: "Record & transcribe" },
  "/courses": { title: "Courses", description: "Lesson builder" },
  "/newsletter": { title: "Newsletter", description: "Email campaigns" },
  "/subscribers": { title: "Subscribers", description: "Audience & plans" },
  "/analytics": { title: "Analytics", description: "Performance overview" },
  "/hermes": { title: "Hermes OS", description: "AI command center" },
  "/settings": { title: "Settings", description: "Theme & integrations" },
};

export function getCmsPageMeta(pathname: string) {
  const exact = PAGE_META[pathname];
  if (exact) return exact;

  const nav = CMS_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (nav) return { title: nav.label };

  return { title: "Dashboard", description: "LofiBuddha CMS" };
}

export function isNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}
