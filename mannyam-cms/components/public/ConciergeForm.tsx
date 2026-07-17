"use client";

import React, { useState, useEffect } from "react";

interface ConciergeFormProps {
  sourcePage?: string;
  journey?: string;
}

export function ConciergeForm({ sourcePage, journey: propJourney }: ConciergeFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    let finalMessage = message.trim();
    if (journey.trim()) {
      finalMessage = `[Journey Enquiry: ${journey.trim()}]\n\n${finalMessage}`;
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
          message: finalMessage || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
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
          Your enquiry has reached our curators
        </h3>
        <p className="font-sans text-sm text-olive/75 leading-relaxed font-light">
          A dedicated curator will review your details and contact you within one working day with a bespoke journey outline.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans max-w-xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm text-xs font-medium">
          {error}
        </div>
      )}

      {/* Honeypot field (hidden from screen readers & users) */}
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
            placeholder="First and last name"
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
            placeholder="you@email.com"
            className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-50 transition-colors"
          />
        </div>
      </div>

      {/* Pre-filled Journey (if present) */}
      {journey && (
        <div className="space-y-1.5">
          <label htmlFor="en_journey" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
            Selected Journey
          </label>
          <input
            id="en_journey"
            type="text"
            readOnly
            value={journey}
            className="w-full rounded-sm border border-olive/15 bg-cream/30 text-olive/60 px-4 py-3 text-sm outline-none cursor-not-allowed select-none font-mono"
            title="This journey enquiry is linked to your selection"
          />
        </div>
      )}

      {/* Message / Special Requirements */}
      <div className="space-y-1.5">
        <label htmlFor="en_msg" className="block text-xs font-semibold uppercase tracking-wider text-olive/80">
          Tell us your story
        </label>
        <textarea
          id="en_msg"
          rows={5}
          disabled={loading}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="The places or festivals you have in mind, the pace you prefer, and anything that would make it yours."
          className="w-full rounded-sm border border-olive/20 bg-cream/10 px-4 py-3 text-sm outline-none resize-none focus:border-gold disabled:opacity-50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-[#ba8838] py-4 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/15 active:scale-95 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send to a curator"}
      </button>

      <p className="text-[10px] text-olive/50 leading-relaxed text-center font-light">
        Your details are encrypted, used only to plan your journey, and never sold.
      </p>
    </form>
  );
}
