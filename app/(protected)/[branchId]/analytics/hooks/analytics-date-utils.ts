import {
  getTodayDate,
  getStartOfMonthIso,
  getEndOfMonthIso,
  dateToIso,
  formatDateToDisplay,
} from "@/lib/date-utils";
import type { AnalyticsComparePeriod, AnalyticsPeriod } from "@/types";

export type DateRangeResult = { startDate: string; endDate: string; label: string };

export function computeDateRange(
  period: AnalyticsPeriod,
  customStart: string,
  customEnd: string
): DateRangeResult {
  const today = getTodayDate();
  const now = new Date();

  switch (period) {
    case "today":
      return { startDate: today, endDate: today, label: "Today" };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yd = dateToIso(y);
      return { startDate: yd, endDate: yd, label: "Yesterday" };
    }
    case "last7": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { startDate: dateToIso(d), endDate: today, label: "Last 7 Days" };
    }
    case "last30": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { startDate: dateToIso(d), endDate: today, label: "Last 30 Days" };
    }
    case "thisMonth":
      return { startDate: getStartOfMonthIso(), endDate: getEndOfMonthIso(), label: "This Month" };
    case "lastMonth": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1, 1);
      const start = dateToIso(d);
      d.setMonth(d.getMonth() + 1, 0);
      const end = dateToIso(d);
      return { startDate: start, endDate: end, label: "Last Month" };
    }
    case "custom":
      return { startDate: customStart || today, endDate: customEnd || today, label: "Custom Range" };
    default:
      return { startDate: today, endDate: today, label: "Today" };
  }
}

export function computePreviousPeriod(
  startDate: string,
  endDate: string
): { compareStartDate: string; compareEndDate: string } {
  const s = new Date(startDate + "T00:00:00");
  const e = new Date(endDate + "T00:00:00");
  const diffMs = e.getTime() - s.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const prevEnd = new Date(s);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - diffDays);

  return {
    compareStartDate: dateToIso(prevStart),
    compareEndDate: dateToIso(prevEnd),
  };
}

export type CompareRangeResult = {
  compareStartDate: string;
  compareEndDate: string;
  compareLabel: string;
};

export function computeCompareDateRange(
  comparePeriod: AnalyticsComparePeriod,
  primaryStart: string,
  primaryEnd: string,
  compareCustomStart: string,
  compareCustomEnd: string
): CompareRangeResult | null {
  const today = getTodayDate();
  const now = new Date();

  if (comparePeriod === "previous") {
    const prev = computePreviousPeriod(primaryStart, primaryEnd);
    return {
      ...prev,
      compareLabel: `${formatDateToDisplay(prev.compareStartDate)} – ${formatDateToDisplay(prev.compareEndDate)}`,
    };
  }

  switch (comparePeriod) {
    case "today":
      return { compareStartDate: today, compareEndDate: today, compareLabel: "Today" };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yd = dateToIso(y);
      return { compareStartDate: yd, compareEndDate: yd, compareLabel: "Yesterday" };
    }
    case "last5": {
      const d = new Date(now);
      d.setDate(d.getDate() - 4);
      return {
        compareStartDate: dateToIso(d),
        compareEndDate: today,
        compareLabel: "Last 5 Days",
      };
    }
    case "last7": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return {
        compareStartDate: dateToIso(d),
        compareEndDate: today,
        compareLabel: "Last 7 Days",
      };
    }
    case "last30": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return {
        compareStartDate: dateToIso(d),
        compareEndDate: today,
        compareLabel: "Last 30 Days",
      };
    }
    case "thisMonth":
      return {
        compareStartDate: getStartOfMonthIso(),
        compareEndDate: getEndOfMonthIso(),
        compareLabel: "This Month",
      };
    case "lastMonth": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1, 1);
      const start = dateToIso(d);
      d.setMonth(d.getMonth() + 1, 0);
      const end = dateToIso(d);
      return { compareStartDate: start, compareEndDate: end, compareLabel: "Last Month" };
    }
    case "custom":
      return {
        compareStartDate: compareCustomStart || today,
        compareEndDate: compareCustomEnd || today,
        compareLabel: `${formatDateToDisplay(compareCustomStart || today)} – ${formatDateToDisplay(compareCustomEnd || today)}`,
      };
    default:
      return null;
  }
}

export function formatDateRangeLabel(startDate: string, endDate: string): string {
  return `${formatDateToDisplay(startDate)} – ${formatDateToDisplay(endDate)}`;
}
