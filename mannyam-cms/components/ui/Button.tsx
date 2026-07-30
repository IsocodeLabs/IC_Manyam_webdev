import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "ghost";
  size?: "default" | "sm";
}

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-[7px] font-sans font-medium tracking-[0.03em] border rounded-[9px] transition-[0.15s] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2";

  const sizeStyles =
    size === "sm"
      ? "px-[11px] py-[6px] text-[11.5px]"
      : "px-[15px] py-[9px] text-[12px]";

  const variants: Record<string, string> = {
    primary:
      "bg-olive text-ivory border-olive hover:bg-gold hover:text-ink hover:border-gold",
    secondary:
      "bg-paper text-ink border-line hover:border-gold",
    gold:
      "bg-gold text-ink border-gold hover:bg-[#cf9a44]",
    ghost:
      "bg-transparent text-ink border-line hover:border-gold",
  };

  return (
    <button
      className={`${base} ${sizeStyles} ${variants[variant] || variants.secondary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
