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