import React from "react";
import Link from "next/link";

interface ButtonProps {
  variant?: "gold" | "amber" | "ghost";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  href?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "gold",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  href,
  fullWidth = false,
  children,
}: ButtonProps) {
  // Base classes that align with Manyam frontend.html design
  const baseClasses =
    "inline-flex items-center justify-center gap-[0.55em] font-sans font-medium text-[11.5px] tracking-[0.16em] uppercase rounded-full transition-all duration-300 px-6 py-4.5 min-h-[44px] cursor-pointer text-center select-none leading-none";

  const variantClasses = {
    // '.btn-gold': background is olive/ink, on hover it transitions to gold background with dark text
    gold: "bg-olive text-ivory hover:bg-gold hover:text-ink shadow-sm",
    // '.btn-amber': background is gold with dark text, on hover transitions to deeper amber
    amber: "bg-gold text-ink hover:bg-[#cf9a44] shadow-sm",
    // '.btn-ghost': transparent with subtle border, gold on hover
    ghost: "bg-transparent text-ink border border-olive/10 hover:border-gold hover:text-gold-deep",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

  const mergedClasses = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={mergedClasses} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      className={mergedClasses}
    >
      {children}
    </button>
  );
}
