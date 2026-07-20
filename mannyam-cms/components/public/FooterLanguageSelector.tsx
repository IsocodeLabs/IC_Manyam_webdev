"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = ["EN", "FR", "DE", "ES", "IT", "NL", "PT", "SV", "EL"];

export function FooterLanguageSelector() {
  const [currentLang, setCurrentLang] = useState("EN");
  const router = useRouter();

  useEffect(() => {
    const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/);
    if (match) {
      setCurrentLang(match[2].toUpperCase());
    }
  }, []);

  const handleSelect = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    
    if (code.toUpperCase() === "EN") {
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } else {
      const expectedGoogtrans = `/en/${code.toLowerCase()}`;
      document.cookie = `googtrans=${expectedGoogtrans}; path=/`;
      document.cookie = `googtrans=${expectedGoogtrans}; path=/; domain=${window.location.hostname}`;
    }

    setCurrentLang(code.toUpperCase());
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-4 py-4 md:py-0 w-full md:w-auto overflow-x-auto scrollbar-hide">
      <span className="text-[11px] font-sans tracking-[0.2em] text-[#8d8f7d] uppercase whitespace-nowrap">
        Language
      </span>
      <div className="flex gap-3 md:gap-4 text-[11px] font-sans font-medium">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => handleSelect(lang.toLowerCase())}
            className={`transition-colors whitespace-nowrap ${
              currentLang === lang ? "text-gold" : "text-[#8d8f7d] hover:text-ivory"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
}
