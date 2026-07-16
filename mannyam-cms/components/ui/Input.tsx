import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// Reusable text input component styled with custom design system parameters
export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`px-3 py-2 bg-paper border border-ivory text-olive rounded focus:outline-none focus:border-gold font-sans ${className}`}
      {...props}
    />
  );
}
