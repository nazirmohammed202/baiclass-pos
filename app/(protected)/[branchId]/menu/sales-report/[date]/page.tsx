import DaySalesDetail from "../components/DaySalesDetail";

const DaySalesDetailPage = async ({
  params,
}: {
  params: Promise<{ branchId: string; date: string }>;
}) => {
  const { date } = await params;
  return <DaySalesDetail date={date} />;
};

export default DaySalesDetailPage;
