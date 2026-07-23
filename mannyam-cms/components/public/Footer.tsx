import Link from "next/link";
import Image from "next/image";
import { FooterLanguageSelector } from "./FooterLanguageSelector";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-[#c9cbba] pt-10 md:pt-[60px] pb-7 md:pb-[34px] px-5 md:px-10 font-sans text-[13px]">
      <div className="max-w-[1200px] mx-auto">

        {/* Main grid: left (brand + newsletter) + right (link columns) */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-12 md:gap-12 items-start">

          {/* Left: Brand + desc */}
          <div>
            <Image src="/logo.png" alt="MANNYAM" height={140} width={140} className="mb-4 w-auto h-[140px] mx-auto brightness-[1.4] drop-shadow-[0_0_10px_rgba(186,136,56,0.35)]" />
            <p className="mt-3 text-[12.5px] text-[#a7a995] leading-relaxed max-w-[34em] font-light">
              Private, thoughtfully planned journeys that reveal the real spirit of India through its festivals, living traditions and the people who make them unforgettable.
            </p>
          </div>

          {/* Right: 4 link columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-4">

            {/* Experiences */}
            <div>
              <h4 className="font-sans text-[11px] tracking-[0.2em] uppercase text-sand font-medium mb-3">Experiences</h4>
              <nav className="flex flex-col gap-[10px]">
                <Link href="/experience-heritage" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Culture and Heritage</Link>
                <Link href="/experience-food" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Food and Culinary</Link>
                <Link href="/experience-wildlife" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Nature and Wildlife</Link>
                <Link href="/experience-royal" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Royal and Exclusive</Link>
                <Link href="/experience-honeymoon" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Honeymoon</Link>
              </nav>
            </div>

            {/* Festivals */}
            <div>
              <h4 className="font-sans text-[11px] tracking-[0.2em] uppercase text-sand font-medium mb-3">Festivals</h4>
              <nav className="flex flex-col gap-[10px]">
                <Link href="/festival-holi" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Holi</Link>
                <Link href="/festival-diwali" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Diwali</Link>
                <Link href="/festival-dussehra" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Dussehra</Link>
                <Link href="/festival-navratri" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Navratri</Link>
                <Link href="/festivals" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">All festivals</Link>
              </nav>
            </div>

            {/* Destinations */}
            <div>
              <h4 className="font-sans text-[11px] tracking-[0.2em] uppercase text-sand font-medium mb-3">Destinations</h4>
              <nav className="flex flex-col gap-[10px]">
                <Link href="/destination-rajasthan" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Rajasthan</Link>
                <Link href="/destination-kerala" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Kerala</Link>
                <Link href="/destination-himalayas" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">The Himalayas</Link>
                <Link href="/destination-varanasi" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Varanasi</Link>
                <Link href="/destinations" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">All destinations</Link>
              </nav>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-sans text-[11px] tracking-[0.2em] uppercase text-sand font-medium mb-3">Company</h4>
              <nav className="flex flex-col gap-[10px]">
                <Link href="/about" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Our story</Link>
                <Link href="/journal" className="text-[15.5px] font-light text-[#b9bba8] hover:text-gold transition-colors">Journal</Link>
                <Link href="/enquire" className="text-[13px] font-light text-[#b9bba8] hover:text-gold transition-colors">Contact</Link>
                <Link href="/privacy" className="text-[13px] font-light text-[#b9bba8] hover:text-gold transition-colors">Privacy</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Newsletter - centred above language selector */}
        <div className="mt-10 md:mt-14 flex justify-center">
          <form className="flex gap-2 w-full max-w-[500px]">
            <input
              type="email"
              placeholder="Your email for the journal"
              className="flex-1 bg-[rgba(255,255,255,.06)] border border-[rgba(255,255,255,.16)] rounded-full px-5 py-3.5 text-ivory text-[13px] font-sans outline-none placeholder:text-[#8d8f7d] focus:border-gold/50"
              required
            />
            <button
              type="submit"
              className="bg-gold text-ink border-0 rounded-full px-[22px] py-3.5 font-sans font-medium text-[10.5px] tracking-[0.13em] uppercase cursor-pointer hover:bg-gold/90 transition-colors whitespace-nowrap"
            >
              Join
            </button>
          </form>
        </div>

        <div className="mt-6 md:mt-8 mb-4 md:mb-6 flex justify-center w-full">
          <FooterLanguageSelector />
        </div>

        {/* Bottom bar */}
        <div className="mt-[30px] pt-[18px] border-t border-[rgba(255,255,255,.1)] flex flex-wrap gap-[6px_16px] justify-between items-center text-[11px] text-[#8d8f7d] leading-relaxed">
          <span>Copyright {currentYear} MANNYAM. Private journeys across India.</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy and security</Link>
            <span>&middot;</span>
            <Link href="/about" className="hover:text-gold transition-colors">Our story</Link>
            <span>&middot;</span>
            <Link href="/enquire" className="hover:text-gold transition-colors">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
