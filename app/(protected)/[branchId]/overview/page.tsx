import { getDailySalesReport } from "@/lib/saleShift-actions";
import { getTodayDate } from "@/lib/date-utils";
import OverviewClient from "./components/OverviewClient";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const initialReport = await getDailySalesReport(branchId, getTodayDate());

  return <OverviewClient initialReport={initialReport} branchId={branchId} />;
}
