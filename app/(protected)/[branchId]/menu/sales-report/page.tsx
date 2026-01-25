import SalesReportHeader from "./components/SalesReportHeader";
import DailySalesTable from "./components/DailySalesTable";

const SalesReportPage = async ({ }: { params: { branchId: string } }) => {
  return (
    <div>
      <SalesReportHeader />
      <DailySalesTable />
    </div>
  );
};

export default SalesReportPage;
