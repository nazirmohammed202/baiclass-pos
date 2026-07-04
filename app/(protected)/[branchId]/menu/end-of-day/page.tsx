import EndOfDayClient from "./components/EndOfDayClient";

export default async function EndOfDayPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  return <EndOfDayClient branchId={branchId} />;
}
