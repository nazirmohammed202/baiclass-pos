import AnalyticsClient from "./components/AnalyticsClient";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AnalyticsClient branchId={branchId} />
    </div>
  );
}
