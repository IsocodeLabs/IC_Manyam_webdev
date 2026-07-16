"use client";

import React from "react";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export interface SidebarProps {
  role: "Admin" | "Content Manager" | "Marketer";
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  // Role-based visibility checks:
  const showAnalytics = role !== "Content Manager";
  const showLeads = role !== "Content Manager";
  const showRedirects = role !== "Content Manager";
  const showUsersSublink = role === "Admin";

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      name: "Journal",
      href: "/journal",
      icon: BookOpen,
      visible: true,
    },
    {
      name: "Pages",
      href: "/pages-cms",
      icon: FileText,
      visible: true,
    },
    {
      name: "Packages",
      href: "/packages",
      icon: Package,
      visible: true,
    },
    {
      name: "Media",
      href: "/media",
      icon: Image,
      visible: true,
    },
    {
      name: "SEO Tools",
      href: "/seo",
      icon: Search,
      visible: true,
    },
    {
      name: "Redirects",
      href: "/redirects",
      icon: ArrowRightLeft,
      visible: showRedirects,
    },
    {
      name: "Clusters",
      href: "/clusters",
      icon: Network,
      visible: true,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart2,
      visible: showAnalytics,
    },
    {
      name: "Leads",
      href: "/leads",
      icon: Inbox,
      visible: showLeads,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      visible: true,
    },
  ];

  return (
    <aside className="w-[240px] bg-olive text-paper flex flex-col h-screen fixed left-0 top-0 border-r border-ivory/10 select-none">
      {/* Sidebar Header / Logo */}
      <div className="p-6 border-b border-ivory/10">
        <h2 className="font-display text-3xl text-gold italic font-semibold tracking-wide">
          MANNYAM
        </h2>
        <p className="font-sans text-[10px] text-paper/50 font-light uppercase tracking-widest mt-1">
          Studio CMS
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        <span className="px-3 font-sans text-[10px] font-bold text-paper/30 uppercase tracking-widest block mb-3">
          Manage System
        </span>
        <div className="space-y-1">
          {navigationItems.map((item) => {
            if (!item.visible) return null;
            
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans transition-all duration-200 ${
                    isActive
                      ? "bg-gold/15 text-gold font-medium"
                      : "text-ivory/70 hover:text-gold hover:bg-paper/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-ivory/50"}`} />
                  <span>{item.name}</span>
                </a>

                {/* Sublink for Settings > Users under Admin role */}
                {item.name === "Settings" && showUsersSublink && (
                  <div className="pl-7 mt-1 space-y-1">
                    <a
                      href="/settings/users"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans transition-all duration-200 ${
                        pathname === "/settings/users"
                          ? "text-gold font-medium"
                          : "text-ivory/50 hover:text-gold"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Users & Team</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer / Logout */}
      <div className="p-4 border-t border-ivory/10 bg-[#2d3120]">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/45 text-gold flex items-center justify-center font-display text-sm font-semibold select-none">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <p className="font-sans text-xs font-semibold text-paper/90 truncate">
              {userName || "User"}
            </p>
            <p className="font-sans text-[10px] text-paper/40 truncate uppercase tracking-wider">
              {role}
            </p>
          </div>
        </div>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/20 hover:bg-red-900/40 text-paper/60 hover:text-red-300 rounded border border-red-900/20 transition-all font-sans text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
