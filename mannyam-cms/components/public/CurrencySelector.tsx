"use client";

import { useEffect, useState } from "react";

export function CurrencySelector() {
  const [currency, setCurrency] = useState("GBP");

  useEffect(() => {
    // Read mannyam_currency cookie
    const cookies = document.cookie.split("; ");
    const currencyCookie = cookies.find((row) => row.startsWith("mannyam_currency="));
    if (currencyCookie) {
      setCurrency(currencyCookie.split("=")[1]);
    } else {
      // Set default GBP cookie
      document.cookie = "mannyam_currency=GBP; path=/; max-age=" + 60 * 60 * 24 * 30;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCurrency = e.target.value;
    setCurrency(nextCurrency);
    // Write mannyam_currency cookie
    document.cookie = `mannyam_currency=${nextCurrency}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    // Refresh page to apply currency change across the entire server
    window.location.reload();
  };

  return (
    <div className="relative inline-block">
      <select
        value={currency}
        onChange={handleChange}
        className="appearance-none bg-cream/40 border border-olive/10 hover:border-olive/25 rounded-sm pl-3 pr-8 py-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-olive focus:outline-none focus:border-gold transition-colors cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%233a4430' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M5 8l5 5 5-5'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 0.5rem center",
          backgroundSize: "1rem",
          backgroundRepeat: "no-repeat",
        }}
      >
        <option value="GBP">GBP (£)</option>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="INR">INR (₹)</option>
      </select>
    </div>
  );
}
