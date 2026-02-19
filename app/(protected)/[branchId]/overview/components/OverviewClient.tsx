"use client";

import { useState, useCallback, useMemo, use } from "react";
import { useCompany } from "@/context/companyContext";
import type { OverviewData } from "@/types";
import { num, pct } from "@/lib/utils";
import OverviewHeader, { type Period, getPeriodLabel } from "./OverviewHeader";
import SalesOverviewSection from "./SalesOverviewSection";
import RevenueChartSection from "./RevenueChartSection";
import SellerAnalyticsSection from "./SellerAnalyticsSection";




type OverviewClientProps = {
  todayReport: Promise<OverviewData>;
  thisWeekReport: Promise<OverviewData>;
  thisMonthReport: Promise<OverviewData>;
  branchId: string;
};

export default function OverviewClient({
  todayReport: todayReportPromise,
  thisWeekReport: thisWeekReportPromise,
  thisMonthReport: thisMonthReportPromise,
}: OverviewClientProps) {
  const { account } = useCompany();
  const [period, setPeriod] = useState<Period>("today");
  const todayReport = use(todayReportPromise);
  const thisWeekReport = use(thisWeekReportPromise);
  const thisMonthReport = use(thisMonthReportPromise);


  const reportToDisplay = useMemo(() => {
    switch (period) {
      case "today": return todayReport;
      case "week": return thisWeekReport;
      case "month": return thisMonthReport;
      default: return todayReport;
    }
  }, [period, todayReport, thisWeekReport, thisMonthReport]);


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


    </div>
  );
}
