import { getEndOfMonthIso, getStartOfMonthIso, getStartOfWeekIso, getTodayDate } from "@/lib/date-utils";
import OverviewClient from "./components/OverviewClient";
import AlertsTasksPanel from "./components/AlertsTasksPanel";
import InventoryAlerts, { InventoryAlertsFallback } from "./components/InventoryAlerts";
import TopPerformers from "./components/TopPerformers";
import RecentActivityFeed from "./components/RecentActivityFeed";
import { getPaymentsBreakdown, getSalesOverview } from "@/lib/analytics-action";
import { getBranchProductsMetadata, getBranchProductsStockData } from "@/lib/branch-actions";
import { Suspense } from "react";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const todayReport = getSalesOverview(branchId, getTodayDate(), getTodayDate());
  const thisWeekReport = getSalesOverview(branchId, getStartOfWeekIso(), getTodayDate());
  const thisMonthReport = getSalesOverview(branchId, getStartOfMonthIso(), getEndOfMonthIso());

  const paymentsBreakdownToday = getPaymentsBreakdown(branchId, getTodayDate(), getTodayDate());
  const paymentsBreakdownThisWeek = getPaymentsBreakdown(branchId, getStartOfWeekIso(), getTodayDate());
  const paymentsBreakdownThisMonth = getPaymentsBreakdown(branchId, getStartOfMonthIso(), getEndOfMonthIso());

  const products = getBranchProductsMetadata(branchId);
  const stockData = getBranchProductsStockData(branchId);

  return <>
    <div className="flex-1 flex flex-col">
      <OverviewClient
        branchId={branchId}
        todayReport={todayReport}
        thisWeekReport={thisWeekReport}
        thisMonthReport={thisMonthReport}
        paymentsBreakdownToday={paymentsBreakdownToday}
        paymentsBreakdownThisWeek={paymentsBreakdownThisWeek}
        paymentsBreakdownThisMonth={paymentsBreakdownThisMonth}
      />

      <div className="px-4">
        <Suspense fallback={<InventoryAlertsFallback />}>
          <InventoryAlerts products={products} stockData={stockData} />
        </Suspense>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <AlertsTasksPanel />
        <TopPerformers />
      </div>
      <div className="px-4">
        <RecentActivityFeed />
      </div>
    </div>
  </>;
}
