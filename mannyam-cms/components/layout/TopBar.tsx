"use client";

import React, { useState } from "react";
import { Search, Globe } from "lucide-react";

export interface TopBarProps {
  title: string;
  userName: string;
  role: "Admin" | "Content Manager" | "Marketer";
}

export function TopBar({ title, userName, role }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-[14px] px-[22px] py-[12px]"
      style={{
        background: "rgba(246, 237, 227, 0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(57, 62, 41, 0.16)",
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-[420px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#8b8d76]" />
        <input
          type="text"
          placeholder="Search pages, posts, leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
          className="w-full rounded-[9px] py-[9px] pl-[34px] pr-3 text-[13px] bg-paper font-light focus:outline-none"
          style={{
            border: "1px solid rgba(57, 62, 41, 0.16)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(57, 62, 41, 0.16)")}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Role display */}
      <div className="flex items-center gap-2 text-[11.5px] text-[#6f7261]">
        <span className="hidden sm:inline">Signed in as</span>
        <span
          className="rounded-[8px] py-[7px] px-[9px] text-[12px] bg-paper font-medium"
          style={{ border: "1px solid rgba(57, 62, 41, 0.16)" }}
        >
          {role}
        </span>
      </div>

      {/* Globe / preview site button */}
      <button
        onClick={() => window.open("https://mannyam.in", "_blank")}
        className="w-9 h-9 rounded-[9px] grid place-items-center text-ink transition-[0.15s] hover:border-gold"
        style={{ border: "1px solid rgba(57, 62, 41, 0.16)", background: "var(--paper)" }}
        title="Preview the live site"
      >
        <Globe className="w-4 h-4" />
      </button>
    </header>
  );
}
