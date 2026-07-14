import { StockHistoryProvider } from "@/context/stockHistoryContext";
import { requireMenuAccess } from "@/lib/require-menu-access";
import StockHistoryHeader from "./components/StockHistoryHeader";
import StockHistoryTable from "./components/StockHistoryTable";

const StockHistoryPage = async ({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) => {
  const { branchId } = await params;
  await requireMenuAccess(branchId, "/stock-history");

  return (
    <StockHistoryProvider>
      <div>
        <StockHistoryHeader />
        <StockHistoryTable />
      </div>
    </StockHistoryProvider>
  );
};

export default StockHistoryPage;
