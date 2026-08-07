const LOCALE_BY_CURRENCY: Record<string, string> = {
  USD: "en-US",
  GBP: "en-GB",
  EUR: "en-IE",
};

export function formatMoney(
  amount: string | number,
  currencyCode = "USD",
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const code = currencyCode || "USD";
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[code] ?? "en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
