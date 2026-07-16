import React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

// Reusable card container component styled with custom design system parameters
export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`p-6 bg-paper border border-ivory rounded shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
