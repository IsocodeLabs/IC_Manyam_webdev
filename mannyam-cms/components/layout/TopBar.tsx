import React from "react";

export interface TopBarProps {
  title: string;
  userName: string;
  role: "Admin" | "Content Manager" | "Marketer";
}

export function TopBar({ title, userName, role }: TopBarProps) {
  // Avatar initials helper
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Role badge styling selector
  const getRoleBadgeStyle = (userRole: typeof role) => {
    switch (userRole) {
      case "Admin":
        return "bg-gold text-paper";
      case "Content Manager":
        return "bg-olive text-paper";
      case "Marketer":
        return "bg-blue-600 text-paper";
      default:
        return "bg-gray-500 text-paper";
    }
  };

  return (
    <header className="h-[56px] bg-paper border-b border-olive/[0.12] px-6 flex items-center justify-between w-full select-none">
      {/* Page Title */}
      <div>
        <h2 className="font-display text-xl text-olive font-semibold tracking-wide">
          {title}
        </h2>
      </div>

      {/* Profile Details & Avatar */}
      <div className="flex items-center gap-4">
        {/* User Role Badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-sans uppercase tracking-wider ${getRoleBadgeStyle(
            role
          )}`}
        >
          {role}
        </span>

        {/* User Name & Initials Avatar */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-medium text-olive/80 hidden sm:inline">
            {userName}
          </span>
          <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-sans text-xs font-bold shadow-sm">
            {getInitials(userName)}
          </div>
        </div>
      </div>
    </header>
  );
}
