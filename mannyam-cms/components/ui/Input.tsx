import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full border rounded-[9px] px-3 py-[10px] text-[13.5px] bg-white font-light focus:border-gold focus:outline-none ${className}`}
      style={{ borderColor: "rgba(57, 62, 41, 0.16)" }}
      {...props}
    />
  );
}
