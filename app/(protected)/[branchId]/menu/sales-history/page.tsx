import { useSales } from "@/context/salesContext";
import SalesHistoryHeader from "./components/salesHistoryHeader";
import { getSalesHistory, getSalesHistoryCached } from "@/lib/sale-actions";
import { connection } from "next/server";
import SalesHistoryTable from "./components/salesHistoryTable";

const SalesHistoryPage = async ({
  params,
}: {
  params: { branchId: string };
}) => {
  await connection();
  const { branchId } = await params;
  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];
  const salesHistory = getSalesHistoryCached(branchId, startDate, endDate);

  return (
    <div>
      <SalesHistoryHeader />
      <SalesHistoryTable sales={salesHistory} />
    </div>
  );
};

export default SalesHistoryPage;
