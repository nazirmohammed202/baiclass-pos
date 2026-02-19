import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return `₵ ${amount.toFixed(2)}`;
};


export const formatCurrencyToDisplay = (amount: number): string => {
  return `₵${amount.toFixed(2)}`;
};

export const fmt = (s: string | undefined) =>
  formatCurrency(Number(s ?? "0"));

export function num(v: string | number | undefined): number {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

export function pct(part: number, whole: number): number {
  return whole > 0 ? Math.min(100, (part / whole) * 100) : 0;
}

/** Compact number for chart axes: 1200000 → "1.2M", 4500 → "4.5k" */
export function compactNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return String(v);
}