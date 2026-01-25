import SalesReportClient from "./components/SalesReportClient";

const SalesReportPage = async ({}: { params: { branchId: string } }) => {
  return (
    <div>
      <SalesReportClient />
    </div>
  );
};

export default SalesReportPage;
