"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ConciergeFormProps {
  sourcePage?: string;
  journey?: string;
}

export function ConciergeForm({ sourcePage, journey: propJourney }: ConciergeFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [travellers, setTravellers] = useState("");
  const [whenDate, setWhenDate] = useState("");
  const [howLong, setHowLong] = useState("");
  const [message, setMessage] = useState("");
  const [journey, setJourney] = useState(propJourney || "");
  const [honeypot, setHoneypot] = useState(""); // Spam protection
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Keep state in sync if props change
  useEffect(() => {
    if (propJourney) {
      setJourney(propJourney);
    }
  }, [propJourney]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Client-side Validation
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // 2. Honeypot check (silent rejection)
    if (honeypot) {
      setSuccess(true);
      return;
    }

    setLoading(true);

    // Get current path if not specified
    let path = sourcePage || "";
    if (!path && typeof window !== "undefined") {
      path = window.location.pathname;
    }
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    // Append journey details to message if present
    let assembledMessage = "Country: " + country + "\nTravellers: " + travellers + "\nWhen: " + whenDate + "\nHow long: " + howLong + "\n\n" + message.trim();
    if (journey.trim()) {
      assembledMessage = "[Journey Enquiry: " + journey.trim() + "]\n\n" + assembledMessage;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "Contact Form",
          source_page: path,
          name: name.trim(),
          email: email.trim(),
          message: assembledMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please check your connection and try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-cream/40 border border-gold/25 p-8 rounded-sm text-center space-y-4 max-w-xl mx-auto shadow-sm animate-fade-in">
        <div className="w-12 h-12 bg-gold/15 text-gold rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
          ✓
        </div>
        <h3 className="font-display text-2xl font-bold text-olive">
          Thank you. Your story is with us.
        </h3>
        <p className="font-sans text-sm text-olive/75 leading-relaxed font-light">
          A dedicated curator will review your details and contact you within one working day with a bespoke journey outline.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm text-xs font-medium">
          {error}
        </div>
      )}

      {/* Honeypot field */}
      <div className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <label htmlFor="website_url">Do not fill this field</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="en_name" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
            Your Name
          </label>
          <input
            id="en_name"
            type="text"
            required
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="en_email" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
            Email Address
          </label>
          <input
            id="en_email"
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <label htmlFor="en_country" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
            Country of Residence
          </label>
          <select
            id="en_country"
            disabled={loading}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-50 transition-colors"
          >
            <option value="">Select a country...</option>
            <option value="Ireland">Ireland</option>
            <option value="Netherlands">Netherlands</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Greece">Greece</option>
            <option value="Spain">Spain</option>
            <option value="Italy">Italy</option>
            <option value="Sweden">Sweden</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="South Africa">South Africa</option>
            <option value="Singapore">Singapore</option>
            <option value="Somewhere else">Somewhere else</option>
          </select>
        </div>

        {/* Travellers */}
        <div className="space-y-1.5">
          <label htmlFor="en_travellers" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
            Travellers
          </label>
          <input
            id="en_travellers"
            type="text"
            disabled={loading}
            value={travellers}
            onChange={(e) => setTravellers(e.target.value)}
            placeholder="e.g. 2 adults, 2 children"
            className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-50 transition-colors"
          />
        </div>

        {/* When */}
        <div className="space-y-1.5">
          <label htmlFor="en_when" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
            When
          </label>
          <input
            id="en_when"
            type="text"
            disabled={loading}
            value={whenDate}
            onChange={(e) => setWhenDate(e.target.value)}
            placeholder="e.g. February next year"
            className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-50 transition-colors"
          />
        </div>

        {/* How long */}
        <div className="space-y-1.5">
          <label htmlFor="en_howlong" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
            How long
          </label>
          <input
            id="en_howlong"
            type="text"
            disabled={loading}
            value={howLong}
            onChange={(e) => setHowLong(e.target.value)}
            placeholder="e.g. 14 days"
            className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-50 transition-colors"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5 mt-6">
        <label htmlFor="en_msg" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
          Message
        </label>
        <textarea
          id="en_msg"
          rows={4}
          disabled={loading}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a bit about what stirs you..."
          className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none resize-none focus:border-gold disabled:opacity-50 transition-colors"
        />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-[#ba8838] py-4 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/15 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send to a curator"}
        </button>
      </div>

      <p className="text-[10px] text-olive/50 leading-relaxed text-center font-light mt-4">
        Your details are encrypted, used only to plan your journey, and never sold. Read our <Link href="/privacy" className="underline hover:text-olive">privacy policy</Link>.
      </p>
    </form>
  );
}
