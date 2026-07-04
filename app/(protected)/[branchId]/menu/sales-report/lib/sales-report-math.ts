/**
 * Pure calculation helpers for the daily sales report.
 * Kept free of React/DOM imports so they can be unit tested.
 */

export type SellerMoney = {
  /** Cash portion of the seller's recorded sales. */
  cashSales: number;
  /** Electronic payments (momo, card, transfer) recorded for the seller. */
  ePayments: number;
  /** Expenses paid out of the seller's drawer. */
  expenses: number;
};

export type HourlyBreakdownEntry = {
  hour: number;
  sales: number;
  transactions: number;
};

export const formatHourLabel = (hour: number): string => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

/** Expands a sparse hourly breakdown into all 24 hours with zero-filled gaps. */
export const buildHourlyDisplay = (
  breakdown: HourlyBreakdownEntry[] = []
): (HourlyBreakdownEntry & { hourLabel: string })[] => {
  const byHour = new Map(breakdown.map((entry) => [entry.hour, entry]));

  return Array.from({ length: 24 }, (_, hour) => {
    const entry = byHour.get(hour);
    return {
      hour,
      hourLabel: formatHourLabel(hour),
      sales: entry?.sales ?? 0,
      transactions: entry?.transactions ?? 0,
    };
  });
};

/** Share of `value` in `total` as a percentage, rounded to 2 decimals. */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
};

/**
 * Cash reconciliation for a seller:
 * (cash at hand + e-payments) − (cash sales − expenses).
 *
 * Positive → excess, negative → shortage, 0 → balanced.
 * Returns null when no cash at hand was recorded for the seller.
 */
export const getSellerVariance = (
  seller: SellerMoney,
  cashAtHand: number | undefined
): number | null => {
  if (cashAtHand === undefined) return null;
  const received = cashAtHand + seller.ePayments;
  const expected = seller.cashSales - seller.expenses;
  return received - expected;
};
