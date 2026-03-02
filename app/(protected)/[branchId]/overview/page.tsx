import { getEndOfMonthIso, getStartOfMonthIso, getStartOfWeekIso, getTodayDate } from "@/lib/date-utils";
import OverviewClient, { OverviewClientFallback } from "./components/OverviewClient";
import AlertsTasksPanel, { AlertsTasksPanelFallback } from "./components/AlertsTasksPanel";
import InventoryAlerts, { InventoryAlertsFallback } from "./components/InventoryAlerts";
import TopPerformers, { TopPerformersFallback } from "./components/TopPerformers";
import RecentActivityFeed, { RecentActivityFeedFallback } from "./components/RecentActivityFeed";
import { getAlertsTasks, getPaymentsBreakdown, getRecentActivityFeed, getSalesOverview, getTopPerformers } from "@/lib/analytics-action";
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
  const alertsTasks = getAlertsTasks(branchId);
  const topPerformers = getTopPerformers(branchId);
  const recentActivity = getRecentActivityFeed(branchId);

  return <>
    <div className="flex-1 flex flex-col">
      <Suspense fallback={<OverviewClientFallback />}>
        <OverviewClient
          branchId={branchId}
          todayReport={todayReport}
          thisWeekReport={thisWeekReport}
          thisMonthReport={thisMonthReport}
          paymentsBreakdownToday={paymentsBreakdownToday}
          paymentsBreakdownThisWeek={paymentsBreakdownThisWeek}
          paymentsBreakdownThisMonth={paymentsBreakdownThisMonth}
        />
      </Suspense>

      <div className="px-4">
        <Suspense fallback={<InventoryAlertsFallback />}>
          <InventoryAlerts products={products} stockData={stockData} />
        </Suspense>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <Suspense fallback={<AlertsTasksPanelFallback />}>
          <AlertsTasksPanel alertsTasks={alertsTasks} />
        </Suspense>
        <Suspense fallback={<TopPerformersFallback />}>
          <TopPerformers topPerformers={topPerformers} />
        </Suspense>
      </div>
      <div className="px-4">
        <Suspense fallback={<RecentActivityFeedFallback />}>
          <RecentActivityFeed recentActivity={recentActivity} />
        </Suspense>
      </div>
    </div>
  </>;
}
