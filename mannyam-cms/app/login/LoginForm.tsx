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
    <div className="w-full max-w-md p-8 bg-paper rounded-lg shadow-md border border-ivory/40">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-olive font-medium tracking-wide mb-2">
          MANNYAM Studio
        </h1>
        <p className="font-sans text-xs text-olive/60 uppercase tracking-widest">
          Content Management System
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block font-sans text-xs font-semibold text-olive/80 uppercase tracking-wider mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={isPending}
            className="w-full px-4 py-3 bg-cream/30 border border-ivory/80 text-olive rounded-md focus:outline-none focus:border-gold/80 transition-colors font-sans text-sm"
            placeholder="name@mannyam.in"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-sans text-xs font-semibold text-olive/80 uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={isPending}
            className="w-full px-4 py-3 bg-cream/30 border border-ivory/80 text-olive rounded-md focus:outline-none focus:border-gold/80 transition-colors font-sans text-sm"
            placeholder="Enter your password"
          />
        </div>

        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-sans">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-gradient-to-r from-gold to-[#c8933e] text-paper font-display text-lg font-medium tracking-wide rounded-md shadow-sm hover:from-[#a0742d] hover:to-[#ba8838] focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
