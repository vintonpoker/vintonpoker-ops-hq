export function money(n: any) {
  const x = typeof n === "number" ? n : null;
  if (x === null) return "—";
  return x.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function num(n: any) {
  const x = typeof n === "number" ? n : null;
  if (x === null) return "—";
  return x.toLocaleString();
}

export function delta(n: any) {
  if (typeof n !== "number") return "—";
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(2);
}
