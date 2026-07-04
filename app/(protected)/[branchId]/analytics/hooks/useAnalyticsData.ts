"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AnalyticsComparePeriod,
  AnalyticsPeriod,
} from "@/types";
import { getTodayDate } from "@/lib/date-utils";
import { getAnalyticsDashboard, type AnalyticsDashboardData } from "@/lib/analytics-action";
import {
  computeDateRange,
  computeCompareDateRange,
  formatDateRangeLabel,
} from "./analytics-date-utils";

export type { AnalyticsDashboardData };

export type AnalyticsData = {
  [K in keyof AnalyticsDashboardData]: AnalyticsDashboardData[K] | null;
};

const initialData: AnalyticsData = {
  kpis: null,
  salesTrend: null,
  paymentsBreakdown: null,
  productPerformance: null,
  inventoryHealth: null,
  customerAnalytics: null,
  staffPerformance: null,
  timeIntelligence: null,
  alertsRisks: null,
};

const CACHE_TTL_MS = 3 * 60 * 1000;

type CacheEntry = {
  data: AnalyticsData;
  fetchedAt: number;
};

const analyticsCache = new Map<string, CacheEntry>();

function buildCacheKey(
  branchId: string,
  startDate: string,
  endDate: string,
  compareStart?: string,
  compareEnd?: string
) {
  return `${branchId}|${startDate}|${endDate}|${compareStart ?? ""}|${compareEnd ?? ""}`;
}

export type UseAnalyticsDataParams = {
  branchId: string;
};

export function useAnalyticsData({ branchId }: UseAnalyticsDataParams) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("today");
  const [customStart, setCustomStart] = useState(() => getTodayDate());
  const [customEnd, setCustomEnd] = useState(() => getTodayDate());
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparePeriod, setComparePeriod] = useState<AnalyticsComparePeriod>("previous");
  const [compareCustomStart, setCompareCustomStart] = useState(() => getTodayDate());
  const [compareCustomEnd, setCompareCustomEnd] = useState(() => getTodayDate());
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [isPending, setIsPending] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchAll = useCallback(
    (
      p: AnalyticsPeriod,
      cs: string,
      ce: string,
      compare: boolean,
      cmpPeriod: AnalyticsComparePeriod,
      cmpCs: string,
      cmpCe: string
    ) => {
      const { startDate, endDate } = computeDateRange(p, cs, ce);
      const compareRange = compare
        ? computeCompareDateRange(cmpPeriod, startDate, endDate, cmpCs, cmpCe)
        : null;
      const compareStart = compareRange?.compareStartDate;
      const compareEnd = compareRange?.compareEndDate;
      const cacheKey = buildCacheKey(branchId, startDate, endDate, compareStart, compareEnd);

      fetchIdRef.current += 1;
      const thisFetchId = fetchIdRef.current;
      const stillCurrent = () => thisFetchId === fetchIdRef.current;

      const cached = analyticsCache.get(cacheKey);
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        setData(cached.data);
        setIsPending(false);
        return;
      }

      setData(initialData);
      setIsPending(true);

      getAnalyticsDashboard(
        branchId,
        startDate,
        endDate,
        compareStart,
        compareEnd
      )
        .then((result) => {
          if (!stillCurrent()) return;
          const nextData: AnalyticsData = { ...result };
          analyticsCache.set(cacheKey, { data: nextData, fetchedAt: Date.now() });
          setData(nextData);
        })
        .catch((error) => {
          console.error("Failed to load analytics dashboard:", error);
        })
        .finally(() => {
          if (stillCurrent()) setIsPending(false);
        });
    },
    [branchId]
  );

  useEffect(() => {
    const id = setTimeout(() => {
      fetchAll(
        period,
        customStart,
        customEnd,
        compareEnabled,
        comparePeriod,
        compareCustomStart,
        compareCustomEnd
      );
    }, 0);

    return () => {
      clearTimeout(id);
      fetchIdRef.current += 1;
    };
  }, [
    period,
    customStart,
    customEnd,
    compareEnabled,
    comparePeriod,
    compareCustomStart,
    compareCustomEnd,
    fetchAll,
  ]);

  const { startDate: currentStart, endDate: currentEnd, label: periodLabel } = computeDateRange(
    period,
    customStart,
    customEnd
  );
  const compareRange = compareEnabled
    ? computeCompareDateRange(comparePeriod, currentStart, currentEnd, compareCustomStart, compareCustomEnd)
    : null;
  const currentDatesLabel = formatDateRangeLabel(currentStart, currentEnd);
  const compareDatesLabel =
    compareRange !== null
      ? formatDateRangeLabel(compareRange.compareStartDate, compareRange.compareEndDate)
      : "";

  const handleExport = useCallback(() => {
    window.print();
  }, []);

  const toggleCompare = useCallback(() => {
    setCompareEnabled((v) => !v);
  }, []);

  return {
    data,
    isPending,
    startDate: currentStart,
    endDate: currentEnd,
    period,
    setPeriod,
    customStart,
    customEnd,
    setCustomStart,
    setCustomEnd,
    compareEnabled,
    setCompareEnabled: toggleCompare,
    comparePeriod,
    setComparePeriod,
    compareCustomStart,
    compareCustomEnd,
    setCompareCustomStart,
    setCompareCustomEnd,
    periodLabel,
    currentDatesLabel,
    compareDatesLabel,
    handleExport,
  };
}
