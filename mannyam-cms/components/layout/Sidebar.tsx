"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Package,
  Image,
  Search,
  ArrowRightLeft,
  Network,
  BarChart2,
  Inbox,
  Settings,
  Users,
  LogOut,
  CalendarCheck,
  Percent,
  Lock,
  Plug,
} from "lucide-react";

import { canAccess } from "@/lib/rbac/permissions";

export interface SidebarProps {
  role: "Admin" | "Content Manager" | "Marketer";
  userName: string;
}

// Navigation structure grouped by section (matching the reference design)
const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { key: "overview", name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "pages", name: "Pages", href: "/pages-cms", icon: FileText },
      { key: "journal", name: "Journal", href: "/dashboard/journal", icon: BookOpen },
      { key: "packages", name: "Packages", href: "/packages", icon: Package },
      { key: "media", name: "Media library", href: "/media", icon: Image },
    ],
  },
  {
    label: "SEO",
    items: [
      { key: "seo", name: "SEO and technical", href: "/seo", icon: Search },
      { key: "redirects", name: "Redirects", href: "/redirects", icon: ArrowRightLeft },
      { key: "clusters", name: "Clusters", href: "/clusters", icon: Network },
      { key: "analytics", name: "Analytics", href: "/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Growth",
    items: [
      { key: "leads", name: "Leads inbox", href: "/leads", icon: Inbox },
      { key: "bookings", name: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
      { key: "discounts", name: "Discounts", href: "/dashboard/discounts", icon: Percent },
    ],
  },
  {
    label: "Admin",
    items: [
      { key: "settings", name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const [brokenCount, setBrokenCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/scan-links", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setBrokenCount(data.broken?.length || 0);
        }
      } catch {
        setBrokenCount(0);
      }
    };
    fetchCount();
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className="w-[250px] flex flex-col h-screen fixed left-0 top-0 select-none overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #3f4630, #23270f)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <img src="/logo.png" alt="MANNYAM" className="w-[34px] h-[34px] object-contain" />
        <span>
          <span className="font-display font-semibold text-[19px] tracking-[0.16em] text-ivory">
            MANNYAM
          </span>
          <span className="block text-[6.5px] tracking-[0.3em] uppercase text-sand mt-px">
            Studio
          </span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <span className="block px-3 pt-4 pb-1.5 text-[9px] tracking-[0.2em] uppercase text-[#8b8d76]">
              {group.label}
            </span>
            {group.items.map((item) => {
              const allowed = canAccess(role, item.key as any);
              const active = isActive(item.href);
              const Icon = item.icon;

              if (!allowed) {
                return (
                  <span
                    key={item.key}
                    className="flex items-center gap-[11px] px-[11px] py-[9px] rounded-[9px] text-[13px] text-[#cfd2bf] opacity-40 cursor-not-allowed relative"
                    title={`No access for ${role}`}
                  >
                    <Icon className="w-[17px] h-[17px] opacity-90" />
                    <span>{item.name}</span>
                    <Lock className="ml-auto w-[13px] h-[13px] opacity-80" />
                  </span>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-[11px] px-[11px] py-[9px] rounded-[9px] text-[13px] transition-[0.15s] relative ${
                    active
                      ? "bg-[rgba(186,136,56,0.18)] text-white"
                      : "text-[#cfd2bf] hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                  }`}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-[-12px] top-[8px] bottom-[8px] w-[3px] rounded-[3px] bg-gold" />
                  )}
                  <Icon className="w-[17px] h-[17px] opacity-90" />
                  <span>{item.name}</span>
                  {/* Badge for broken links on clusters */}
                  {item.key === "clusters" && brokenCount !== null && brokenCount > 0 && (
                    <span className="ml-auto text-[10px] bg-[rgba(255,255,255,0.1)] rounded-[20px] px-[7px] py-px text-[#e7decf]">
                      {brokenCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3 py-3 border-t border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-[34px] h-[34px] rounded-full bg-gold text-ink flex items-center justify-center font-display font-semibold text-[15px]">
            {userName ? userName.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="overflow-hidden">
            <p className="text-[12.5px] text-ivory truncate">{userName || "User"}</p>
            <p className="text-[10px] text-sand truncate">{role}</p>
          </div>
        </div>
        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="w-full mt-2.5 flex items-center justify-center gap-2 px-4 py-2 bg-transparent text-[#cfd2bf] border border-[rgba(255,255,255,0.16)] rounded-[9px] text-[11.5px] font-sans transition-[0.15s] hover:border-gold hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
