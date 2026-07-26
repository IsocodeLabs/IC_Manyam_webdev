"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LanguageSelector } from "./LanguageSelector";
import { MegaFeaturedSlide } from "./MegaFeaturedSlide";

// ─── Component ───────────────────────────────────────────────────────────────

type MegaItem = { title: string; desc: string; href: string };
type MegaSlide = { image: string; label: string; subtitle: string; href: string };

type HeaderCategoryProps = { items: MegaItem[], slides: MegaSlide[] };

export interface HeaderProps {
  experiences?: HeaderCategoryProps;
  festivals?: HeaderCategoryProps;
  destinations?: HeaderCategoryProps;
  journeys?: HeaderCategoryProps;
}

export function Header({ experiences, festivals, destinations, journeys }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const megaTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close mega-menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-mega]")) {
        setOpenMega(null);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function handleMegaEnter(key: string) {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setOpenMega(key);
  }

  function handleMegaLeave() {
    megaTimeout.current = setTimeout(() => setOpenMega(null), 200);
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-ivory backdrop-blur-md border-b border-olive/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex flex-col select-none group">
          <Image src="/logo.png" alt="MANNYAM - The Story of India" height={60} width={60} className="h-[60px] w-auto object-contain" />
          <span className="sr-only">MANNYAM - The Story of India</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" data-mega>
          {/* Experiences (mega) */}
          <div
            className="relative"
            onMouseEnter={() => handleMegaEnter("experiences")}
            onMouseLeave={handleMegaLeave}
          >
            <button className={`font-sans text-[12px] tracking-[0.13em] uppercase font-normal px-3 py-5 transition-colors duration-200 flex items-center gap-1.5 ${openMega === "experiences" ? "text-gold" : "text-olive/88 hover:text-gold"}`}>
              Experiences
              <svg className={`w-[7px] h-[7px] transition-transform duration-200 ${openMega === "experiences" ? "rotate-180" : ""}`} viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            <div className={`fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 overflow-hidden transition-all duration-300 origin-top ${openMega === "experiences" ? "opacity-100 pointer-events-auto translate-y-0 scale-y-100 visible" : "opacity-0 pointer-events-none -translate-y-2 scale-y-95 invisible"}`}>
              <div className="grid grid-cols-[1.4fr_1fr] gap-5 h-[280px]">
                <div className="grid grid-cols-2 gap-x-3 gap-y-0" style={{ gridTemplateRows: "repeat(4, 1fr)" }}>
                  {experiences?.items.slice(0, 7).map((item) => (
                    <Link key={item.href} href={item.href} className="flex flex-col justify-center px-2 py-1 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[15px] text-olive leading-tight">{item.title}</div>
                      <div className="text-[10px] text-olive/50 line-clamp-1 mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                  <Link href="/experiences" className="flex flex-col justify-center px-2 py-1 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                    <div className="font-display text-[15px] text-gold leading-tight">View all</div>
                    <div className="text-[10px] text-olive/50 mt-0.5">See everything</div>
                  </Link>
                </div>
                <div className="rounded-[14px] overflow-hidden relative bg-olive/10">
                  {experiences?.slides && experiences.slides.length > 0 && (
                    <MegaFeaturedSlide slides={experiences.slides} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Festivals (mega) */}
          <div
            className="relative"
            onMouseEnter={() => handleMegaEnter("festivals")}
            onMouseLeave={handleMegaLeave}
          >
            <button className={`font-sans text-[12px] tracking-[0.13em] uppercase font-normal px-3 py-5 transition-colors duration-200 flex items-center gap-1.5 ${openMega === "festivals" ? "text-gold" : "text-olive/88 hover:text-gold"}`}>
              Festivals
              <svg className={`w-[7px] h-[7px] transition-transform duration-200 ${openMega === "festivals" ? "rotate-180" : ""}`} viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            <div className={`fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 overflow-hidden transition-all duration-300 origin-top ${openMega === "festivals" ? "opacity-100 pointer-events-auto translate-y-0 scale-y-100 visible" : "opacity-0 pointer-events-none -translate-y-2 scale-y-95 invisible"}`}>
              <div className="grid grid-cols-[1.4fr_1fr] gap-5 h-[320px]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0 content-start auto-rows-[1fr]" style={{ gridTemplateRows: "repeat(4, 1fr)" }}>
                  {festivals?.items.slice(0, 7).map((item) => (
                    <Link key={item.href} href={item.href} className="flex flex-col justify-center px-2.5 py-2 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[17px] text-olive">{item.title}</div>
                      <div className="text-[11px] text-olive/50 line-clamp-2">{item.desc}</div>
                    </Link>
                  ))}
                  <Link href="/festivals" className="flex flex-col justify-center px-2.5 py-2 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                    <div className="font-display text-[17px] text-gold">View all</div>
                    <div className="text-[11px] text-olive/50">See everything</div>
                  </Link>
                </div>
                <div className="rounded-[14px] overflow-hidden relative bg-olive/10">
                  {festivals?.slides && festivals.slides.length > 0 && (
                    <MegaFeaturedSlide slides={festivals.slides} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Destinations (mega) */}
          <div
            className="relative"
            onMouseEnter={() => handleMegaEnter("destinations")}
            onMouseLeave={handleMegaLeave}
          >
            <button className={`font-sans text-[12px] tracking-[0.13em] uppercase font-normal px-3 py-5 transition-colors duration-200 flex items-center gap-1.5 ${openMega === "destinations" ? "text-gold" : "text-olive/88 hover:text-gold"}`}>
              Destinations
              <svg className={`w-[7px] h-[7px] transition-transform duration-200 ${openMega === "destinations" ? "rotate-180" : ""}`} viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            <div className={`fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 overflow-hidden transition-all duration-300 origin-top ${openMega === "destinations" ? "opacity-100 pointer-events-auto translate-y-0 scale-y-100 visible" : "opacity-0 pointer-events-none -translate-y-2 scale-y-95 invisible"}`}>
              <div className="grid grid-cols-[1.4fr_1fr] gap-5 h-[280px]">
                <div className="grid grid-cols-2 gap-x-3 gap-y-0" style={{ gridTemplateRows: "repeat(4, 1fr)" }}>
                  {destinations?.items.slice(0, 7).map((item) => (
                    <Link key={item.href} href={item.href} className="flex flex-col justify-center px-2 py-1 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[15px] text-olive leading-tight">{item.title}</div>
                      <div className="text-[10px] text-olive/50 line-clamp-1 mt-0.5">{item.desc}</div>
                    </Link>
                  ))}
                  <Link href="/destinations" className="flex flex-col justify-center px-2 py-1 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                    <div className="font-display text-[15px] text-gold leading-tight">View all</div>
                    <div className="text-[10px] text-olive/50 mt-0.5">See everything</div>
                  </Link>
                </div>
                <div className="rounded-[14px] overflow-hidden relative bg-olive/10">
                  {destinations?.slides && destinations.slides.length > 0 && (
                    <MegaFeaturedSlide slides={destinations.slides} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Journeys (mega) */}
          <div
            className="relative"
            onMouseEnter={() => handleMegaEnter("journeys")}
            onMouseLeave={handleMegaLeave}
          >
            <button className={`font-sans text-[12px] tracking-[0.13em] uppercase font-normal px-3 py-5 transition-colors duration-200 flex items-center gap-1.5 ${openMega === "journeys" ? "text-gold" : "text-olive/88 hover:text-gold"}`}>
              Journeys
              <svg className={`w-[7px] h-[7px] transition-transform duration-200 ${openMega === "journeys" ? "rotate-180" : ""}`} viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            <div className={`fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 overflow-hidden transition-all duration-300 origin-top ${openMega === "journeys" ? "opacity-100 pointer-events-auto translate-y-0 scale-y-100 visible" : "opacity-0 pointer-events-none -translate-y-2 scale-y-95 invisible"}`}>
              <div className="grid grid-cols-[1.4fr_1fr] gap-5 h-[320px]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0 content-start auto-rows-[1fr]" style={{ gridTemplateRows: "repeat(4, 1fr)" }}>
                  {journeys?.items.slice(0, 7).map((item) => (
                    <Link key={item.href} href={item.href} className="flex flex-col justify-center px-2.5 py-2 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[17px] text-olive">{item.title}</div>
                      <div className="text-[11px] text-olive/50 line-clamp-2">{item.desc}</div>
                    </Link>
                  ))}
                  <Link href="/journeys" className="flex flex-col justify-center px-2.5 py-2 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                    <div className="font-display text-[17px] text-gold">View all</div>
                    <div className="text-[11px] text-olive/50">See everything</div>
                  </Link>
                </div>
                <div className="rounded-[14px] overflow-hidden relative bg-olive/10">
                  {journeys?.slides && journeys.slides.length > 0 && (
                    <MegaFeaturedSlide slides={journeys.slides} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Plain links */}
          <Link href="/journal" className="font-sans text-[12px] tracking-[0.13em] uppercase font-normal px-3 py-5 text-olive/88 hover:text-gold transition-colors duration-200">
            Journal
          </Link>
          <Link href="/about" className="font-sans text-[12px] tracking-[0.13em] uppercase font-normal px-3 py-5 text-olive/88 hover:text-gold transition-colors duration-200">
            About
          </Link>
        </nav>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSelector />
          <Link
            href="/enquire"
            className="font-sans text-[11.5px] font-medium tracking-[0.16em] uppercase text-ivory bg-olive hover:bg-gold hover:text-ink px-[22px] py-[14px] rounded-full transition-all duration-250"
          >
            Plan my journey
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-olive focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`h-[1.5px] w-full bg-olive rounded-full transition-transform duration-300 origin-left ${isMobileMenuOpen ? "rotate-45 translate-x-[2px]" : ""}`} />
            <span className={`h-[1.5px] w-full bg-olive rounded-full transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`h-[1.5px] w-full bg-olive rounded-full transition-transform duration-300 origin-left ${isMobileMenuOpen ? "-rotate-45 translate-x-[2px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-0 left-0 right-0 bottom-0 z-[9999]" style={{ backgroundColor: '#1e2214' }}>
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
            <div>
              <Image src="/logo-icon.png" alt="MANNYAM" width={36} height={36} className="mb-1" />
              <div className="font-display text-[18px] tracking-[0.16em] font-bold text-ivory">MANNYAM</div>
              <div className="text-[6px] tracking-[0.3em] uppercase text-sand mt-0.5">The Story of India</div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-[36px] h-[36px] rounded-full bg-white/10 flex items-center justify-center text-ivory" aria-label="Close menu">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="px-6 py-8">
            <nav className="grid grid-cols-2 gap-x-6 gap-y-6">
              <Link href="/experiences" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-ivory">Experiences</Link>
              <Link href="/festivals" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-ivory">Festivals</Link>
              <Link href="/destinations" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-ivory">Destinations</Link>
              <Link href="/journeys" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-ivory">Journeys</Link>
              <Link href="/journal" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-ivory">Journal</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-ivory">About</Link>
              <Link href="/enquire" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-gold">Contact Us</Link>
              <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="font-display text-[22px] text-ivory/70">My Account</Link>
            </nav>
          </div>

          {/* CTA */}
          <div className="absolute bottom-8 left-5 right-5">
            <Link href="/enquire" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center font-sans text-[12px] font-medium tracking-[0.16em] uppercase bg-gold text-ink py-4 rounded-full">
              Plan my journey
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Mobile Accordion Sub-component ─────────────────────────────────────────

function MobileAccordion({ title, items, onClose }: { title: string; items: { title: string; desc: string; href: string }[]; onClose: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center font-display text-[21px] py-3">
        {title}
        <span className={`text-[17px] text-sand transition-transform duration-200 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="pb-2 space-y-0.5">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="block py-2.5 pl-0.5 text-[14px] text-ivory/80 hover:text-gold">
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
