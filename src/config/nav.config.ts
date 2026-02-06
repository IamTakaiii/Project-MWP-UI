/**
 * Navigation Configuration
 *
 * Centralized config for all navigation items.
 * Add new features here - they will automatically appear in the navbar.
 */

import type { LucideIcon } from "lucide-react";
import {
  Home,
  Rocket,
  History,
  BarChart3,
  Activity,
  ScrollText,
  Terminal,
  FileJson,
} from "lucide-react";

export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Route path */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Short description (shown in mobile menu) */
  description?: string;
  /** Group: 'main' shows in primary nav, 'tools' in secondary/dropdown */
  group: "main" | "tools";
  /** Order within group (lower = first) */
  order: number;
  /** Hide from navbar but keep route accessible */
  hidden?: boolean;
}

/**
 * All navigation items
 * Add new pages here - they will automatically appear in the navbar
 */
export const navItems: NavItem[] = [
  // Main navigation
  {
    id: "home",
    label: "หน้าหลัก",
    href: "/",
    icon: Home,
    description: "กลับหน้าหลัก",
    group: "main",
    order: 0,
  },
  {
    id: "worklog",
    label: "Worklog",
    href: "/worklog",
    icon: Rocket,
    description: "สร้าง worklog หลายวันพร้อมกัน",
    group: "main",
    order: 1,
  },
  {
    id: "history",
    label: "History",
    href: "/history",
    icon: History,
    description: "ดูประวัติ worklog แก้ไข ลบ",
    group: "main",
    order: 2,
  },
  {
    id: "reports",
    label: "Reports",
    href: "/epic-report",
    icon: BarChart3,
    description: "รายงานและวิเคราะห์ worklog",
    group: "main",
    order: 3,
  },

  // Tools / Secondary navigation
  {
    id: "tracking",
    label: "Tracking",
    href: "/worklog-tracking",
    icon: Activity,
    description: "ตรวจสอบสถานะการส่ง Worklog",
    group: "tools",
    order: 0,
  },
  {
    id: "sse-monitor",
    label: "SSE Monitor",
    href: "/sse-monitor",
    icon: Terminal,
    description: "ดู Server-Sent Events แบบ real-time",
    group: "tools",
    order: 1,
  },
  {
    id: "json-formatter",
    label: "JSON",
    href: "/json-formatter",
    icon: FileJson,
    description: "จัดรูปแบบและ query JSON",
    group: "tools",
    order: 2,
  },
  {
    id: "changelog",
    label: "Changelog",
    href: "/changelog",
    icon: ScrollText,
    description: "ประวัติการอัปเดต",
    group: "tools",
    order: 3,
  },
];

// Helper functions
export const getMainNavItems = () =>
  navItems
    .filter((item) => item.group === "main" && !item.hidden)
    .sort((a, b) => a.order - b.order);

export const getToolsNavItems = () =>
  navItems
    .filter((item) => item.group === "tools" && !item.hidden)
    .sort((a, b) => a.order - b.order);

export const getNavItemByHref = (href: string) =>
  navItems.find((item) => item.href === href);
