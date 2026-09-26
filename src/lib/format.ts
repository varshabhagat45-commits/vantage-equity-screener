export function inrPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: n < 100 ? 2 : 1,
  }).format(n);
}

export function crore(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L Cr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k Cr`;
  return `₹${Math.round(n).toLocaleString("en-IN")} Cr`;
}

export function pct(n: number, digits = 1) {
  const sign = n > 0 ? "" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function signedPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function ratio(n: number, digits = 1) {
  return `${n.toFixed(digits)}x`;
}

export function num(n: number, digits = 1) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
