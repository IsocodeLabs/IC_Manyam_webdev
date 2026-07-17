"use client";

import { useState } from "react";
import Link from "next/link";
import { CurrencySelector } from "./CurrencySelector";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Experiences", href: "/experiences" },
    { label: "Festivals", href: "/festivals" },
    { label: "Destinations", href: "/destinations" },
    { label: "Journeys", href: "/journeys" },
    { label: "Journal", href: "/journal" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-ivory/85 backdrop-blur-md border-b border-olive/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex flex-col select-none group">
          <span className="font-display text-2xl font-bold tracking-widest text-olive group-hover:text-gold transition-colors duration-300 uppercase">
            MANNYAM
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-olive/60 mt-0.5 font-light">
            The Story of India
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-sans text-xs font-medium uppercase tracking-wider text-olive/80 hover:text-gold transition-colors duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Button with Currency Selector */}
        <div className="hidden md:flex items-center gap-6">
          <CurrencySelector />
          <Link
            href="/enquire"
            className="font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-gold/90 px-6 py-3.5 rounded-sm transition-all duration-300 hover:shadow-md hover:shadow-gold/10 inline-block active:scale-95"
          >
            Begin Your Story
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-olive focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span
              className={`h-[1.5px] w-full bg-olive rounded-full transition-transform duration-300 origin-left ${
                isMobileMenuOpen ? "rotate-45 translate-x-[2px]" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-full bg-olive rounded-full transition-opacity duration-200 ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[1.5px] w-full bg-olive rounded-full transition-transform duration-300 origin-left ${
                isMobileMenuOpen ? "-rotate-45 translate-x-[2px]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`md:hidden absolute top-24 left-0 w-full bg-cream border-b border-olive/15 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col px-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-sans text-sm font-medium uppercase tracking-wider text-olive/80 hover:text-gold transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-olive/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-medium uppercase tracking-wider text-olive/60">Currency</span>
              <CurrencySelector />
            </div>
            <Link
              href="/enquire"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center font-sans text-xs font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-gold/90 px-6 py-3.5 rounded-sm transition-all block"
            >
              Begin Your Story
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
