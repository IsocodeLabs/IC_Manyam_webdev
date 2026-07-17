"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { customerLoginAction } from "./actions";

export function CustomerLoginForm() {
  const [state, formAction, isPending] = useActionState(customerLoginAction, {
    error: null,
  });

  return (
    <div className="w-full max-w-md p-8 bg-paper rounded-sm shadow-sm border border-olive/10">
      <div className="text-center mb-8">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold block mb-1">
          Bespoke Journeys
        </span>
        <h1 className="font-display text-4xl text-olive font-medium tracking-wide mb-2">
          Traveller Portal
        </h1>
        <p className="font-sans text-xs text-olive/60 font-light">
          Sign in to view your reserved itineraries and manage payments.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block font-sans text-[11px] font-semibold text-olive/80 uppercase tracking-wider"
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
            className="w-full px-4 py-3 bg-cream/40 border border-olive/10 text-olive rounded-sm focus:outline-none focus:border-gold transition-colors font-sans text-sm placeholder:text-olive/30"
            placeholder="e.g. eleanor@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="block font-sans text-[11px] font-semibold text-olive/80 uppercase tracking-wider"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={isPending}
            className="w-full px-4 py-3 bg-cream/40 border border-olive/10 text-olive rounded-sm focus:outline-none focus:border-gold transition-colors font-sans text-sm placeholder:text-olive/30"
            placeholder="Enter your password"
          />
        </div>

        {state?.error && (
          <div className="p-3 bg-amber/10 border border-amber/20 rounded-sm text-gold text-xs font-sans">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-olive text-cream font-sans text-xs font-bold uppercase tracking-widest rounded-sm shadow-sm hover:bg-olive/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-olive/5 pt-4">
        <p className="font-sans text-xs text-olive/60 font-light">
          New to MANNYAM?{" "}
          <Link
            href="/account/register"
            className="text-gold font-medium hover:underline hover:text-gold/80 transition-colors"
          >
            Register as a Traveller
          </Link>
        </p>
      </div>
    </div>
  );
}
