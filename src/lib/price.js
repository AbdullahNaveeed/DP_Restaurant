// Price conversion and formatting utilities
export function getExchangeRate() {
  const env = process.env.EXCHANGE_RATE || process.env.NEXT_PUBLIC_EXCHANGE_RATE;
  const r = Number(env);
  return !isNaN(r) && r > 0 ? r : 280; // sensible default if not provided
}

export function usdToPKR(usd) {
  return Math.round(Number(usd) * getExchangeRate());
}

export function formatPKR(amount, options = {}) {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
      ...options,
    }).format(amount);
  } catch (e) {
    return `PKR ${Number(amount).toLocaleString()}`;
  }
}
