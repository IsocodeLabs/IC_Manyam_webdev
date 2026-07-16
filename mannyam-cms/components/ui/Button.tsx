import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

// Reusable button component styled with custom design system colours
export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const baseStyle = "px-4 py-2 font-sans rounded transition-colors focus:outline-none";
  const variantStyle =
    variant === "primary"
      ? "bg-olive text-paper hover:bg-opacity-90"
      : "bg-gold text-olive hover:bg-opacity-90";

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
