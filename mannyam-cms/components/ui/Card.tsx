import React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-paper border border-line rounded-[14px] p-[18px] ${className}`}
      style={{ borderColor: "rgba(57, 62, 41, 0.16)" }}
      {...props}
    >
      {children}
    </div>
  );
}
