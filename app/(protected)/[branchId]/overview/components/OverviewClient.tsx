"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getDailySalesReport,
  getDailySalesSummary,
} from "@/lib/saleShift-actions";
import {
  getTodayDate,
  getLastNDays,
  getStartOfMonthIso,
  formatDateShort,
} from "@/lib/date-utils";
import { useCompany } from "@/context/companyContext";
import type { DailySalesReport, DailySalesSummary } from "@/types";
import { handleError } from "@/utils/errorHandlers";
import { Loader2 } from "lucide-react";

import OverviewHeader, { type Period, getPeriodLabel } from "./OverviewHeader";
import SalesOverviewSection from "./SalesOverviewSection";
import RevenueChartSection, { type ChartDataPoint } from "./RevenueChartSection";
import SellerAnalyticsSection, {
  type SellerBreakdownItem,
} from "./SellerAnalyticsSection";

function num(v: string | number | undefined): number {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return Number.isNaN(n) ? 0 : n;
}

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.min(100, (part / whole) * 100) : 0;
}

type OverviewClientProps = {
  initialReport: DailySalesReport;
  branchId: string;
};

export default function OverviewClient({
  initialReport,
  branchId,
}: OverviewClientProps) {
  const { account } = useCompany();

  const [period, setPeriod] = useState<Period>("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [report, setReport] = useState<DailySalesReport>(initialReport);
  const [summary, setSummary] = useState<DailySalesSummary | null>(null);

  const fetchData = useCallback(
    async (newPeriod: Period) => {
      setLoading(true);
      setError(null);
      const today = getTodayDate();

      try {
        if (newPeriod === "today") {
          const data = await getDailySalesReport(branchId, today);
          setReport(data);
          setSummary(null);
        } else {
          const { startDate, endDate } =
            newPeriod === "month"
              ? { startDate: getStartOfMonthIso(), endDate: today }
              : getLastNDays(newPeriod === "7d" ? 7 : 30);

          const [summaryData, reportData] = await Promise.all([
            getDailySalesSummary(branchId, startDate, endDate),
            getDailySalesReport(branchId, endDate),
          ]);
          setSummary(summaryData);
          setReport(reportData);
        }
      } catch (e) {
        setError(handleError(e));
      } finally {
        setLoading(false);
      }
    },
    [branchId]
  );

  const handlePeriodChange = useCallback(
    (newPeriod: Period) => {
      setPeriod(newPeriod);
      fetchData(newPeriod);
    },
    [fetchData]
  );

  // Sync initialReport if it changes on server re-render
  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  // ── Derived values ─────────────────────────────────────────────────────

  const totalSales =
    period === "today" ? num(report.totalSales) : num(summary?.totalSales);
  const cashSales =
    period === "today" ? num(report.totalCashSales) : num(summary?.cashSales);
  const creditSales =
    period === "today"
      ? num(report.totalCreditSales)
      : num(summary?.creditSales);

  const targetVal = num(report.dailySalesTarget);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (period === "today") {
      return [
        {
          label: "Today",
          date: getTodayDate(),
          cash: num(report.totalCashSales),
          credit: num(report.totalCreditSales),
        },
      ];
    }

    return (
      summary?.eachDay?.map((d) => ({
        label: new Date(d.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        date: d.date,
        cash: d.cashSales,
        credit: d.creditSales,
      })) ?? []
    );
  }, [summary, report, period]);



  const recentSales = useMemo(
    () => report.recentSales.slice(0, 1) ?? [],
    [report]
  );

  const sellerBreakdown: SellerBreakdownItem[] = useMemo(() => {
    const map = new Map<string, SellerBreakdownItem>();
    recentSales.forEach((sale) => {
      const id = sale.seller?._id ?? "unknown";
      const name = sale.seller?.name ?? "Unknown";
      const existing = map.get(id) ?? { name, totalSales: 0, count: 0 };
      existing.totalSales += sale.total;
      existing.count += 1;
      map.set(id, existing);
    });
    return Array.from(map.values()).sort(
      (a, b) => b.totalSales - a.totalSales
    );
  }, [recentSales]);

  // ── Render ─────────────────────────────────────────────────────────────

  const accountName = account?.name ?? "User";
  const accountPhone = account?.phoneNumber ?? "—";

  if (error) {
    return (
      <div className="p-2 sm:p-4">
        <OverviewHeader
          accountName={accountName}
          period={period}
          onPeriodChange={handlePeriodChange}
        />
        <div className="mt-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-4 text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4 overflow-y-auto">
      <OverviewHeader
        accountName={accountName}
        period={period}
        onPeriodChange={handlePeriodChange}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <SalesOverviewSection
            totalSales={totalSales}
            cashSales={cashSales}
            creditSales={creditSales}
            cashPct={pct(cashSales, totalSales)}
            creditPct={pct(creditSales, totalSales)}
            targetVal={targetVal}
            targetPct={pct(totalSales, targetVal)}
            dailySalesTarget={report.dailySalesTarget}
            period={period}
          />

          <RevenueChartSection
            chartData={chartData}
            totalSales={totalSales}
            cashSales={cashSales}
            creditSales={creditSales}
            periodLabel={getPeriodLabel(period)}
          />

          <SellerAnalyticsSection
            accountName={accountName}
            accountPhone={accountPhone}
            productsSold={num(report.totalProductsSold)}
            averageSale={num(report.averageSale)}
            grossProfit={num(report.grossProfit)}
            netProfit={num(report.grossProfit) - num(report.totalExpenses)}
            ePay={num(report.totalElectronicPayments)}
            totalPaymentsReceived={num(report.totalPaymentsReceived)}
            sellerBreakdown={sellerBreakdown}
            totalSales={totalSales}
            recentSales={recentSales}
          />
        </div>
      )}
    </div>
  );
}
