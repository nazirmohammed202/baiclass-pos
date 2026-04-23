"use client";

import { useState, useCallback, useMemo, use } from "react";
import { useCompany } from "@/context/companyContext";
import type { OverviewData, PaymentsBreakdown } from "@/types";
import { num, pct } from "@/lib/utils";
import OverviewHeader, { type Period, getPeriodLabel } from "./OverviewHeader";
import SalesOverviewSection from "./SalesOverviewSection";
import RevenueChartSection from "./RevenueChartSection";
import SellerAnalyticsSection from "./SellerAnalyticsSection";
import PaymentSummary from "./PaymentSummary";

export function OverviewClientFallback() {
  return (
    <div className="space-y-4 p-2 sm:p-4 overflow-y-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="h-8 w-48 sm:h-9 sm:w-56 bg-gray-200 dark:bg-neutral-700 rounded" />
        <div className="flex gap-1 rounded-lg p-1 bg-gray-100 dark:bg-neutral-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-20 sm:w-24 bg-gray-200 dark:bg-neutral-700 rounded-md" />
          ))}
        </div>
      </div>

      {/* Main row: Sales overview | Chart | Seller analytics */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/4 flex flex-col justify-end p-5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
          <div className="h-14 w-32 bg-gray-200 dark:bg-neutral-700 rounded mt-2" />
          <div className="h-4 w-40 bg-gray-100 dark:bg-neutral-800 rounded mt-1" />
          <div className="mt-auto pt-6 space-y-4">
            <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full" />
            <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full" />
            <div className="h-2 w-3/4 bg-gray-100 dark:bg-neutral-800 rounded-full" />
          </div>
        </div>

        <div className="flex-1 min-h-[280px] rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
          <div className="h-52 w-full bg-gray-100 dark:bg-neutral-800 rounded" />
        </div>

        <div className="lg:w-1/3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-neutral-800 rounded" />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-neutral-700 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full bg-gray-200 dark:bg-neutral-700 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment summary */}
      <div className="mb-4 px-0 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
          <div className="h-4 w-36 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-4 w-16 bg-gray-100 dark:bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type OverviewClientProps = {
  todayReport: Promise<OverviewData>;
  thisWeekReport: Promise<OverviewData>;
  thisMonthReport: Promise<OverviewData>;
  paymentsBreakdownToday: Promise<PaymentsBreakdown[]>;
  paymentsBreakdownThisWeek: Promise<PaymentsBreakdown[]>;
  paymentsBreakdownThisMonth: Promise<PaymentsBreakdown[]>;
  branchId: string;
};

export default function OverviewClient({
  todayReport: todayReportPromise,
  thisWeekReport: thisWeekReportPromise,
  thisMonthReport: thisMonthReportPromise,
  paymentsBreakdownToday: paymentsBreakdownTodayPromise,
  paymentsBreakdownThisWeek: paymentsBreakdownThisWeekPromise,
  paymentsBreakdownThisMonth: paymentsBreakdownThisMonthPromise,
}: OverviewClientProps) {
  const { account } = useCompany();
  const [period, setPeriod] = useState<Period>("today");
  const todayReport = use(todayReportPromise);
  const thisWeekReport = use(thisWeekReportPromise);
  const thisMonthReport = use(thisMonthReportPromise);
  const paymentsBreakdownToday = use(paymentsBreakdownTodayPromise);
  const paymentsBreakdownThisWeek = use(paymentsBreakdownThisWeekPromise);
  const paymentsBreakdownThisMonth = use(paymentsBreakdownThisMonthPromise);

  const reportToDisplay = useMemo(() => {
    switch (period) {
      case "today": return todayReport;
      case "week": return thisWeekReport;
      case "month": return thisMonthReport;
      default: return todayReport;
    }
  }, [period, todayReport, thisWeekReport, thisMonthReport]);

  const paymentsBreakdownToDisplay = useMemo(() => {
    switch (period) {
      case "today": return paymentsBreakdownToday;
      case "week": return paymentsBreakdownThisWeek;
      case "month": return paymentsBreakdownThisMonth;
      default: return paymentsBreakdownToday;
    }
  }, [period, paymentsBreakdownToday, paymentsBreakdownThisWeek, paymentsBreakdownThisMonth]);


  const handlePeriodChange = useCallback(
    (newPeriod: Period) => {
      setPeriod(newPeriod);
    },
    []
  );

  const accountName = account?.name || "";
  const accountPhone = account?.phoneNumber ?? "—";

  return (
    <div className="space-y-4 p-2 sm:p-4 overflow-y-auto">
      <OverviewHeader
        accountName={accountName}
        period={period}
        onPeriodChange={handlePeriodChange}
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <SalesOverviewSection
          totalSales={reportToDisplay.totalSales}
          cashSales={reportToDisplay.cashSales}
          creditSales={reportToDisplay.creditSales}
          cashPct={pct(reportToDisplay.cashSales, reportToDisplay.totalSales)}
          creditPct={pct(reportToDisplay.creditSales, reportToDisplay.totalSales)}
          targetVal={reportToDisplay.dailySalesTarget ?? 0}
          targetPct={pct(reportToDisplay.totalSales, reportToDisplay.dailySalesTarget ?? 0)}
          dailySalesTarget={reportToDisplay.dailySalesTarget?.toString() ?? "0"}
        />

        <RevenueChartSection
          chartData={reportToDisplay.chartData}
          totalSales={reportToDisplay.totalSales}
          cashSales={reportToDisplay.cashSales}
          creditSales={reportToDisplay.creditSales}
          periodLabel={getPeriodLabel(period)}
        />

        <SellerAnalyticsSection
          accountName={accountName}
          accountPhone={accountPhone}
          productsSold={num(reportToDisplay.totalProductsSold)}
          averageSale={num(reportToDisplay.averageSale)}
          ePay={num(reportToDisplay.totalElectronicPayments)}
          totalPaymentsReceived={num(reportToDisplay.totalPaymentsReceived)}
          recentSales={reportToDisplay.recentSales}
        />
      </div>

      <div className="mb-4 px-0">
        <PaymentSummary
          paymentsBreakdown={paymentsBreakdownToDisplay}
          periodLabel={getPeriodLabel(period)}
        />
      </div>
    </div>
  );
}
