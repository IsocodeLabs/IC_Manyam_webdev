"use client";

import React, { useActionState } from "react";
import { loginAction } from "./actions";

interface LoginFormProps {
  initialError?: string | null;
}

export function LoginForm({ initialError = null }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: initialError,
  });

  return (
    <div
      className="w-full max-w-[410px] rounded-[22px] p-[30px_28px]"
      style={{
        background: "var(--paper)",
        border: "1px solid rgba(186, 136, 56, 0.5)",
        boxShadow: "0 20px 50px -26px rgba(44, 49, 32, 0.5)",
      }}
    >
      {/* Brand */}
      <div className="flex flex-col items-center gap-[3px] mb-1.5">
        <img src="/logo.png" alt="MANNYAM" className="w-[48px] h-[48px] object-contain" />
        <span className="font-display font-semibold text-[23px] tracking-[0.2em] text-ink">
          MANNYAM
        </span>
        <span className="text-[8px] tracking-[0.34em] uppercase text-gold-deep">
          Studio
        </span>
      </div>

      <h1 className="font-display text-[24px] font-semibold text-center mt-4 text-ink">
        Sign in to your workspace
      </h1>
      <p className="text-center text-[#6f7261] text-[13px] mt-1.5">
        Manage content, SEO and enquiries for mannyam.in
      </p>

      {state?.error && (
        <div
          className="mt-3.5 rounded-[9px] p-[10px_12px] text-[12.5px]"
          style={{
            background: "rgba(180, 85, 47, 0.1)",
            border: "1px solid rgba(180, 85, 47, 0.3)",
            color: "var(--bad)",
          }}
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-4">
        <div className="mb-[15px]">
          <label className="block text-[10px] tracking-[0.16em] uppercase text-gold-deep font-medium mb-1.5">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={isPending}
            placeholder="you@mannyam.in"
            className="w-full border rounded-[10px] px-[13px] py-3 text-[14px] bg-white font-light focus:border-gold focus:outline-none"
            style={{ borderColor: "rgba(57, 62, 41, 0.16)" }}
          />
        </div>

        <div className="mb-[15px]">
          <label className="block text-[10px] tracking-[0.16em] uppercase text-gold-deep font-medium mb-1.5">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={isPending}
            placeholder="Your password"
            className="w-full border rounded-[10px] px-[13px] py-3 text-[14px] bg-white font-light focus:border-gold focus:outline-none"
            style={{ borderColor: "rgba(57, 62, 41, 0.16)" }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary w-full mt-4 py-[13px] text-[13px]"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
