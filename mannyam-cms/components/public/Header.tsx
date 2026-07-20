"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LanguageSelector } from "./LanguageSelector";

// ─── Mega-menu data matching frontend.html ───────────────────────────────────

const EXPERIENCES_ITEMS = [
  { title: "Culture and Heritage", desc: "Forts, palaces and living traditions", href: "/experience-heritage" },
  { title: "Local Life and Community", desc: "Villages, homes and local trains", href: "/experience-local-life" },
  { title: "Food and Culinary Stories", desc: "Street kitchens to royal tables", href: "/experience-food" },
  { title: "Spiritual and Soulful", desc: "River dawns and ancient rituals", href: "/experience-spiritual" },
  { title: "Nature and Wildlife", desc: "Tigers, tea hills and jungle tables", href: "/experience-wildlife" },
  { title: "Royal and Exclusive", desc: "Vintage drives and private dinners", href: "/experience-royal" },
  { title: "Arts, Music and Performance", desc: "Classical recitals and Kathakali", href: "/experience-arts" },
  { title: "Honeymoon and Romance", desc: "Lake palaces and desert nights", href: "/experience-honeymoon" },
];

const FESTIVALS_ITEMS = [
  { title: "Holi", desc: "March", href: "/festival-holi" },
  { title: "Diwali", desc: "October to November", href: "/festival-diwali" },
  { title: "Dussehra", desc: "October", href: "/festival-dussehra" },
  { title: "Durga Puja", desc: "October", href: "/festival-durga-puja" },
  { title: "Navratri and Garba", desc: "October", href: "/festival-navratri" },
  { title: "Ganesh Chaturthi", desc: "August to September", href: "/festival-ganesh-chaturthi" },
  { title: "Pongal and Onam", desc: "January and August", href: "/festival-harvest" },
  { title: "Celebration Shows", desc: "All year", href: "/festival-celebration-shows" },
];

const DESTINATIONS_ITEMS = [
  { title: "Rajasthan", desc: "October to March", href: "/destination-rajasthan" },
  { title: "Kerala", desc: "September to March", href: "/destination-kerala" },
  { title: "The Himalayas", desc: "May to September", href: "/destination-himalayas" },
  { title: "Tamil Nadu", desc: "November to February", href: "/destination-tamil-nadu" },
  { title: "Varanasi", desc: "October to March", href: "/destination-varanasi" },
  { title: "The North-East", desc: "October to April", href: "/destination-north-east" },
  { title: "Gujarat", desc: "November to February", href: "/destination-gujarat" },
];

const JOURNEYS_ITEMS = [
  { title: "Palaces of the North", desc: "12 days", href: "/experiences/palaces-of-the-north" },
  { title: "Green Kerala and the Ghats", desc: "9 days", href: "/experiences/green-kerala" },
  { title: "Ladakh and the High Passes", desc: "10 days", href: "/experiences/ladakh-high-passes" },
  { title: "The Ganges and Beyond", desc: "7 days", href: "/experiences/ganges-and-beyond" },
  { title: "Colours of Holi", desc: "8 days, Holi", href: "/festivals/colours-of-holi" },
  { title: "Lights of Diwali", desc: "9 days, Diwali", href: "/festivals/lights-of-diwali" },
  { title: "Royal Dussehra of Mysuru", desc: "6 days, Dussehra", href: "/festivals/royal-dussehra" },
];

const FEATURED_IMAGES: Record<string, string> = {
  experiences: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=75",
  festivals: "https://unsplash.com/photos/rFP3OzmYH6M/download?w=600&fm=jpg&fit=crop",
  destinations: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=75",
  journeys: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=75",
};

const MEGA_MENU_DATA = {
  experiences: {
    items: EXPERIENCES_ITEMS,
    allLink: "/experiences",
    img: FEATURED_IMAGES.experiences,
    imgAlt: "Experience India",
    tag: "Romance",
    title: "Honeymoon and Romance"
  },
  festivals: {
    items: FESTIVALS_ITEMS,
    allLink: "/festivals",
    img: FEATURED_IMAGES.festivals,
    imgAlt: "Festival India",
    tag: "March",
    title: "Colours of Holi"
  },
  destinations: {
    items: DESTINATIONS_ITEMS,
    allLink: "/destinations",
    img: FEATURED_IMAGES.destinations,
    imgAlt: "Destination India",
    tag: "North-West",
    title: "Rajasthan"
  },
  journeys: {
    items: JOURNEYS_ITEMS,
    allLink: "/journeys",
    img: FEATURED_IMAGES.journeys,
    imgAlt: "Signature Journey",
    tag: "Signature",
    title: "Palaces of the North"
  }
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function Header() {
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
    <header className="sticky top-0 z-50 w-full bg-ivory/92 backdrop-blur-md border-b border-olive/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex flex-col select-none group">
          <span className="font-display text-[23px] font-bold tracking-[0.18em] text-olive group-hover:text-gold transition-colors duration-300 uppercase">
            MANNYAM
          </span>
          <span className="font-sans text-[7px] uppercase tracking-[0.3em] text-olive/55 mt-0.5 font-light">
            The Story of India
          </span>
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
            {openMega === "experiences" && (
              <div className="fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 animate-fade-in overflow-hidden">
                <div className="grid grid-cols-[1fr_200px] gap-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {EXPERIENCES_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href} className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                        <div className="font-display text-[17px] text-olive">{item.title}</div>
                        <div className="text-[11px] text-olive/50">{item.desc}</div>
                      </Link>
                    ))}
                    <Link href="/experiences" className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[17px] text-gold">View all</div>
                      <div className="text-[11px] text-olive/50">See everything</div>
                    </Link>
                  </div>
                  <div className="rounded-[14px] overflow-hidden relative min-h-[150px] bg-olive/10">
                    <img src={FEATURED_IMAGES.experiences} alt="Experience India" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <div className="absolute left-3.5 right-3.5 bottom-3 text-ivory z-10">
                      <div className="text-[9.5px] uppercase tracking-[0.24em] text-sand/80">Romance</div>
                      <div className="font-display text-[20px] mt-0.5">Honeymoon and Romance</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            {openMega === "festivals" && (
              <div className="fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 animate-fade-in overflow-hidden">
                <div className="grid grid-cols-[1fr_200px] gap-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {FESTIVALS_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href} className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                        <div className="font-display text-[17px] text-olive">{item.title}</div>
                        <div className="text-[11px] text-olive/50">{item.desc}</div>
                      </Link>
                    ))}
                    <Link href="/festivals" className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[17px] text-gold">View all</div>
                      <div className="text-[11px] text-olive/50">See everything</div>
                    </Link>
                  </div>
                  <div className="rounded-[14px] overflow-hidden relative min-h-[150px] bg-olive/10">
                    <img src={FEATURED_IMAGES.festivals} alt="Festival India" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <div className="absolute left-3.5 right-3.5 bottom-3 text-ivory z-10">
                      <div className="text-[9.5px] uppercase tracking-[0.24em] text-sand/80">March</div>
                      <div className="font-display text-[20px] mt-0.5">Colours of Holi</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            {openMega === "destinations" && (
              <div className="fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 animate-fade-in overflow-hidden">
                <div className="grid grid-cols-[1fr_200px] gap-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {DESTINATIONS_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href} className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                        <div className="font-display text-[17px] text-olive">{item.title}</div>
                        <div className="text-[11px] text-olive/50">{item.desc}</div>
                      </Link>
                    ))}
                    <Link href="/destinations" className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[17px] text-gold">View all</div>
                      <div className="text-[11px] text-olive/50">See everything</div>
                    </Link>
                  </div>
                  <div className="rounded-[14px] overflow-hidden relative min-h-[150px] bg-olive/10">
                    <img src={FEATURED_IMAGES.destinations} alt="Destination India" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <div className="absolute left-3.5 right-3.5 bottom-3 text-ivory z-10">
                      <div className="text-[9.5px] uppercase tracking-[0.24em] text-sand/80">North-West</div>
                      <div className="font-display text-[20px] mt-0.5">Rajasthan</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            {openMega === "journeys" && (
              <div className="fixed top-[76px] left-4 right-4 max-w-[780px] bg-paper border border-gold/25 rounded-[18px] shadow-[0_18px_48px_-24px_rgba(30,35,25,.26)] p-5 z-50 animate-fade-in overflow-hidden">
                <div className="grid grid-cols-[1fr_200px] gap-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {JOURNEYS_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href} className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                        <div className="font-display text-[17px] text-olive">{item.title}</div>
                        <div className="text-[11px] text-olive/50">{item.desc}</div>
                      </Link>
                    ))}
                    <Link href="/journeys" className="block px-2.5 py-2.5 rounded-[10px] transition-colors hover:bg-cream" onClick={() => setOpenMega(null)}>
                      <div className="font-display text-[17px] text-gold">View all</div>
                      <div className="text-[11px] text-olive/50">See everything</div>
                    </Link>
                  </div>
                  <div className="rounded-[14px] overflow-hidden relative min-h-[150px] bg-olive/10">
                    <img src={FEATURED_IMAGES.journeys} alt="Signature Journey" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <div className="absolute left-3.5 right-3.5 bottom-3 text-ivory z-10">
                      <div className="text-[9.5px] uppercase tracking-[0.24em] text-sand/80">Signature</div>
                      <div className="font-display text-[20px] mt-0.5">Palaces of the North</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
      <div className={`lg:hidden fixed inset-0 z-[600] bg-[linear-gradient(180deg,#3f4630,#2a2e1d)] text-ivory flex flex-col transition-transform duration-[380ms] ease-[cubic-bezier(.2,.8,.2,1)] ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <div>
            <div className="font-display text-[20px] tracking-[0.16em] font-bold">MANNYAM</div>
            <div className="text-[6.5px] tracking-[0.3em] uppercase text-sand mt-1">The Story of India</div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="w-[38px] h-[38px] rounded-full bg-white/8 flex items-center justify-center" aria-label="Close menu">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Mobile Experiences Accordion */}
          <MobileAccordion title="Experiences" items={EXPERIENCES_ITEMS} onClose={() => setIsMobileMenuOpen(false)} />
          <MobileAccordion title="Festivals" items={FESTIVALS_ITEMS} onClose={() => setIsMobileMenuOpen(false)} />
          <MobileAccordion title="Destinations" items={DESTINATIONS_ITEMS} onClose={() => setIsMobileMenuOpen(false)} />
          <MobileAccordion title="Journeys" items={JOURNEYS_ITEMS} onClose={() => setIsMobileMenuOpen(false)} />

          <Link href="/journal" onClick={() => setIsMobileMenuOpen(false)} className="block font-display text-[21px] py-3 border-t border-white/10">Journal</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block font-display text-[21px] py-3 border-t border-white/10">About</Link>
        </div>

        <div className="px-5 py-4 border-t border-white/12 flex gap-2.5">
          <Link href="/enquire" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center font-sans text-[11.5px] font-medium tracking-[0.16em] uppercase bg-gold text-ink py-3.5 rounded-full">
            Plan my journey
          </Link>
        </div>
      </div>
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
