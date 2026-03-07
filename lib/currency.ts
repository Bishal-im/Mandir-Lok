export const DEFAULT_USD_EXCHANGE_RATE = Number(process.env.NEXT_PUBLIC_USD_EXCHANGE_RATE) || 83;

export function convertINRtoUSD(amountInINR: number, rate: number = DEFAULT_USD_EXCHANGE_RATE): number {
  return amountInINR / rate;
}

export function formatCurrency(amount: number, currency: "INR" | "USD"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
