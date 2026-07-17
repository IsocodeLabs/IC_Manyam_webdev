"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { customerRegisterAction } from "./actions";

export function CustomerRegisterForm() {
  const [state, formAction, isPending] = useActionState(customerRegisterAction, {
    error: null,
  });

  return (
    <div className="w-full max-w-md p-8 bg-paper rounded-sm shadow-sm border border-olive/10">
      <div className="text-center mb-8">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold block mb-1">
          Join the Atelier
        </span>
        <h1 className="font-display text-4xl text-olive font-medium tracking-wide mb-2">
          Create Account
        </h1>
        <p className="font-sans text-xs text-olive/60 font-light">
          Register to review your bookings, pay deposits, and access private services.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block font-sans text-[11px] font-semibold text-olive/80 uppercase tracking-wider"
          >
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-cream/40 border border-olive/10 text-olive rounded-sm focus:outline-none focus:border-gold transition-colors font-sans text-sm placeholder:text-olive/30"
            placeholder="e.g. Eleanor Vance"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block font-sans text-[11px] font-semibold text-olive/80 uppercase tracking-wider"
          >
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-cream/40 border border-olive/10 text-olive rounded-sm focus:outline-none focus:border-gold transition-colors font-sans text-sm placeholder:text-olive/30"
            placeholder="e.g. eleanor@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block font-sans text-[11px] font-semibold text-olive/80 uppercase tracking-wider"
          >
            Password * (min 6 characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-cream/40 border border-olive/10 text-olive rounded-sm focus:outline-none focus:border-gold transition-colors font-sans text-sm placeholder:text-olive/30"
            placeholder="Choose a strong password"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="phone"
            className="block font-sans text-[11px] font-semibold text-olive/80 uppercase tracking-wider"
          >
            Phone Number (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-cream/40 border border-olive/10 text-olive rounded-sm focus:outline-none focus:border-gold transition-colors font-sans text-sm placeholder:text-olive/30"
            placeholder="e.g. +44 7911 123456"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="country"
            className="block font-sans text-[11px] font-semibold text-olive/80 uppercase tracking-wider"
          >
            Country of Residence (optional)
          </label>
          <input
            id="country"
            name="country"
            type="text"
            disabled={isPending}
            className="w-full px-4 py-2.5 bg-cream/40 border border-olive/10 text-olive rounded-sm focus:outline-none focus:border-gold transition-colors font-sans text-sm placeholder:text-olive/30"
            placeholder="e.g. United Kingdom"
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
          {isPending ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-olive/5 pt-4">
        <p className="font-sans text-xs text-olive/60 font-light">
          Already have an account?{" "}
          <Link
            href="/account/login"
            className="text-gold font-medium hover:underline hover:text-gold/80 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
