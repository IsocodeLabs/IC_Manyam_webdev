/**
 * Formats a minor units currency value (cents/pence) into a beautifully localized string
 * based on the provided currency code (GBP, USD, EUR, INR).
 * 
 * Uses British English formatting or appropriate regional English locale for consistency.
 */
export function formatCurrency(minorAmount: number, currency: string = "GBP"): string {
  const majorAmount = minorAmount / 100;
  
  let locale = "en-GB";
  const upperCurrency = currency.toUpperCase();
  
  if (upperCurrency === "USD") {
    locale = "en-US";
  } else if (upperCurrency === "EUR") {
    locale = "en-IE"; // Standard English language for EUR formatting
  } else if (upperCurrency === "INR") {
    locale = "en-IN"; // Indian English for proper Rupee representation (e.g. lakh grouping)
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: upperCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorAmount);
}
