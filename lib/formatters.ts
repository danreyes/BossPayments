export function formatCurrency(cents: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}