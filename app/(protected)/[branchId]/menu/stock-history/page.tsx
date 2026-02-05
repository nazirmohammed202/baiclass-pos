import { StockHistoryProvider } from "@/context/stockHistoryContext";
import StockHistoryHeader from "./components/StockHistoryHeader";
import StockHistoryTable from "./components/StockHistoryTable";

const StockHistoryPage = async ({}: { params: { branchId: string } }) => {
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
