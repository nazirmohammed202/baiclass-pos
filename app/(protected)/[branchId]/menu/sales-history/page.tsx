import SalesHistoryHeader from "./components/salesHistoryHeader";
import SalesHistoryTable from "./components/salesHistoryTable";

const SalesHistoryPage = async ({}: { params: { branchId: string } }) => {
  return (
    <div>
      <SalesHistoryHeader />
      <SalesHistoryTable />
    </div>
  );
};

export default SalesHistoryPage;
