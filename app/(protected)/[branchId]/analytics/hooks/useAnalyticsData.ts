"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AnalyticsAlertsData,
  AnalyticsComparePeriod,
  AnalyticsKPIs,
  AnalyticsPeriod,
  CustomerAnalyticsData,
  InventoryHealthData,
  PaymentsBreakdown,
  ProductPerformanceItem,
  SalesTrendPoint,
  StaffPerformanceItem,
  TimeIntelligenceData,
} from "@/types";
import { getTodayDate } from "@/lib/date-utils";
import {
  getAnalyticsKPIs,
  getSalesTrend,
  getPaymentsBreakdown,
  getProductPerformance,
  getInventoryHealth,
  getCustomerAnalytics,
  getStaffPerformance,
  getTimeIntelligence,
  getAnalyticsAlerts,
} from "@/lib/analytics-action";
import {
  computeDateRange,
  computeCompareDateRange,
  formatDateRangeLabel,
} from "./analytics-date-utils";

export type AnalyticsData = {
  kpis: AnalyticsKPIs | null;
  salesTrend: SalesTrendPoint[] | null;
  paymentsBreakdown: PaymentsBreakdown[] | null;
  productPerformance: {
    topSelling: ProductPerformanceItem[];
    mostProfitable: ProductPerformanceItem[];
    worstPerforming: ProductPerformanceItem[];
    deadStock: ProductPerformanceItem[];
  } | null;
  inventoryHealth: InventoryHealthData | null;
  customerAnalytics: CustomerAnalyticsData | null;
  staffPerformance: StaffPerformanceItem[] | null;
  timeIntelligence: TimeIntelligenceData | null;
  alertsRisks: AnalyticsAlertsData | null;
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
  const [pendingCount, setPendingCount] = useState(0);
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

      setData(initialData);
      setPendingCount(9);
      fetchIdRef.current += 1;
      const thisFetchId = fetchIdRef.current;

      const stillCurrent = () => thisFetchId === fetchIdRef.current;
      const decrement = () => {
        if (!stillCurrent()) return;
        setPendingCount((c) => Math.max(0, c - 1));
      };

      getAnalyticsKPIs(
        branchId,
        startDate,
        endDate,
        compareRange?.compareStartDate ?? undefined,
        compareRange?.compareEndDate ?? undefined
      )
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, kpis: value }));
        })
        .finally(decrement);

      getSalesTrend(
        branchId,
        startDate,
        endDate,
        compareRange?.compareStartDate ?? undefined,
        compareRange?.compareEndDate ?? undefined
      )
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, salesTrend: value }));
        })
        .finally(decrement);

      getPaymentsBreakdown(branchId, startDate, endDate)
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, paymentsBreakdown: value }));
        })
        .finally(decrement);

      getProductPerformance(branchId, startDate, endDate)
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, productPerformance: value }));
        })
        .finally(decrement);

      getInventoryHealth(branchId)
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, inventoryHealth: value }));
        })
        .finally(decrement);

      getCustomerAnalytics(branchId, startDate, endDate)
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, customerAnalytics: value }));
        })
        .finally(decrement);

      getStaffPerformance(branchId, startDate, endDate)
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, staffPerformance: value }));
        })
        .finally(decrement);

      getTimeIntelligence(branchId, startDate, endDate)
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, timeIntelligence: value }));
        })
        .finally(decrement);

      getAnalyticsAlerts(branchId, startDate, endDate)
        .then((value) => {
          if (stillCurrent()) setData((prev) => ({ ...prev, alertsRisks: value }));
        })
        .finally(decrement);
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
    return () => clearTimeout(id);
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
    isPending: pendingCount > 0,
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
