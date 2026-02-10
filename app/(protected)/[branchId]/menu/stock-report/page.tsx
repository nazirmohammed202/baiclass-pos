import StockReportClient from "./components/StockReportClient";

const StockReportPage = async ({}: { params: { branchId: string } }) => {
  return (
    <div>
      <StockReportClient />
    </div>
  );
};

export default StockReportPage;
