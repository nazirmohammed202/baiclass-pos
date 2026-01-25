import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return `₵${amount.toFixed(2)}`;
};


export const formatCurrencyToDisplay = (amount: number): string => {
  return `₵${amount.toFixed(2)}`;
};