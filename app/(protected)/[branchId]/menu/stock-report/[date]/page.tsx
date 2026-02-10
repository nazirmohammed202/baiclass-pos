import DayStockDetail from "../components/DayStockDetail";

const DayStockDetailPage = async ({
  params,
}: {
  params: Promise<{ branchId: string; date: string }>;
}) => {
  const { date } = await params;
  return <DayStockDetail date={date} />;
};

export default DayStockDetailPage;
