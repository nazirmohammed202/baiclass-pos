import { getEndOfMonthIso, getStartOfMonthIso, getStartOfWeekIso, getTodayDate } from "@/lib/date-utils";
import OverviewClient from "./components/OverviewClient";
import AlertsTasksPanel from "./components/AlertsTasksPanel";
import InventoryAlerts from "./components/InventoryAlerts";
import TopPerformers from "./components/TopPerformers";
import PaymentSummary from "./components/PaymentSummary";
import RecentActivityFeed from "./components/RecentActivityFeed";
import { getSalesOverview } from "@/lib/analytics-action";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const todayReport = getSalesOverview(branchId, getTodayDate(), getTodayDate());
  const thisWeekReport = getSalesOverview(branchId, getStartOfWeekIso(), getTodayDate());
  const thisMonthReport = getSalesOverview(branchId, getStartOfMonthIso(), getEndOfMonthIso());

  return <>
    <div className="p-2flex-1  flex flex-col ">
      <OverviewClient branchId={branchId}
        todayReport={todayReport}
        thisWeekReport={thisWeekReport}
        thisMonthReport={thisMonthReport}
      />

      <div className=" mb-4">
        <PaymentSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertsTasksPanel />
        <InventoryAlerts />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <TopPerformers />
      </div>
      <RecentActivityFeed />
    </div>
  </>;
}
