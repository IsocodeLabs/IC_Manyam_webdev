import React from "react";

interface BadgeProps {
  variant?: "amber" | "olive" | "gray" | "gold";
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "amber", className = "", children }: BadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-sans font-semibold uppercase tracking-[0.15em] border transition-colors";

  const variantClasses = {
    amber: "bg-gold/10 text-gold-deep border-gold/20",
    gold: "bg-gold text-ink border-gold/10",
    olive: "bg-olive/10 text-olive-soft border-olive/20",
    gray: "bg-cream text-ink/75 border-olive/10",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
