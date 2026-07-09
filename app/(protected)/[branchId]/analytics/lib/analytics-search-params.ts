import { getTodayDate } from "@/lib/date-utils";
import type { AnalyticsComparePeriod, AnalyticsPeriod } from "@/types";
import {
  computeCompareDateRange,
  computeDateRange,
  formatDateRangeLabel,
} from "../hooks/analytics-date-utils";

export type AnalyticsSearchParams = {
  period: AnalyticsPeriod;
  customStart: string;
  customEnd: string;
  compareEnabled: boolean;
  comparePeriod: AnalyticsComparePeriod;
  compareCustomStart: string;
  compareCustomEnd: string;
};

export type ResolvedAnalyticsRanges = {
  startDate: string;
  endDate: string;
  compareStartDate?: string;
  compareEndDate?: string;
  periodLabel: string;
  currentDatesLabel: string;
  compareDatesLabel: string;
};

const PERIODS: AnalyticsPeriod[] = [
  "today",
  "yesterday",
  "last7",
  "last30",
  "thisMonth",
  "lastMonth",
  "custom",
];

const COMPARE_PERIODS: AnalyticsComparePeriod[] = [
  "previous",
  "today",
  "yesterday",
  "last5",
  "last7",
  "last30",
  "thisMonth",
  "lastMonth",
  "custom",
];

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseAnalyticsSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): AnalyticsSearchParams {
  const today = getTodayDate();
  const periodRaw = readParam(searchParams, "period");
  const comparePeriodRaw = readParam(searchParams, "comparePeriod");

  return {
    period: PERIODS.includes(periodRaw as AnalyticsPeriod)
      ? (periodRaw as AnalyticsPeriod)
      : "today",
    customStart: readParam(searchParams, "start") || today,
    customEnd: readParam(searchParams, "end") || today,
    compareEnabled: readParam(searchParams, "compare") === "1",
    comparePeriod: COMPARE_PERIODS.includes(comparePeriodRaw as AnalyticsComparePeriod)
      ? (comparePeriodRaw as AnalyticsComparePeriod)
      : "previous",
    compareCustomStart: readParam(searchParams, "compareStart") || today,
    compareCustomEnd: readParam(searchParams, "compareEnd") || today,
  };
}

export function buildAnalyticsSearchParams(
  query: AnalyticsSearchParams
): URLSearchParams {
  const params = new URLSearchParams();

  if (query.period !== "today") {
    params.set("period", query.period);
  }

  if (query.period === "custom") {
    params.set("start", query.customStart);
    params.set("end", query.customEnd);
  }

  if (query.compareEnabled) {
    params.set("compare", "1");

    if (query.comparePeriod !== "previous") {
      params.set("comparePeriod", query.comparePeriod);
    }

    if (query.comparePeriod === "custom") {
      params.set("compareStart", query.compareCustomStart);
      params.set("compareEnd", query.compareCustomEnd);
    }
  }

  return params;
}

export function resolveAnalyticsRanges(
  query: AnalyticsSearchParams
): ResolvedAnalyticsRanges {
  const { startDate, endDate, label: periodLabel } = computeDateRange(
    query.period,
    query.customStart,
    query.customEnd
  );

  const compareRange = query.compareEnabled
    ? computeCompareDateRange(
        query.comparePeriod,
        startDate,
        endDate,
        query.compareCustomStart,
        query.compareCustomEnd
      )
    : null;

  return {
    startDate,
    endDate,
    compareStartDate: compareRange?.compareStartDate,
    compareEndDate: compareRange?.compareEndDate,
    periodLabel,
    currentDatesLabel: formatDateRangeLabel(startDate, endDate),
    compareDatesLabel: compareRange?.compareLabel ?? "",
  };
}
