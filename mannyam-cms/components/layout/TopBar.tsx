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
      className="sticky top-0 z-50 border-b border-line flex items-center gap-3.5 px-[22px] py-[12px]"
      style={{
        background: "rgba(246, 237, 227, 0.92)",
        backdropFilter: "blur(10px)",
        borderBottomColor: "rgba(57, 62, 41, 0.16)",
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
          className="w-full border border-line rounded-[9px] py-[9px] pl-[34px] pr-3 text-[13px] bg-paper font-light focus:border-gold focus:outline-none"
          style={{ borderColor: "rgba(57, 62, 41, 0.16)" }}
          autoComplete="off"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Role badge */}
      <div className="flex items-center gap-2 text-[11.5px] text-[#6f7261]">
        <span className="hidden sm:inline">{role}</span>
      </div>

      {/* Globe / preview site button */}
      <button
        className="w-9 h-9 rounded-[9px] border border-line bg-paper grid place-items-center text-ink hover:border-gold transition-[0.15s]"
        style={{ borderColor: "rgba(57, 62, 41, 0.16)" }}
        title="Preview the live site"
      >
        <Globe className="w-4 h-4" />
      </button>
    </header>
  );
}
