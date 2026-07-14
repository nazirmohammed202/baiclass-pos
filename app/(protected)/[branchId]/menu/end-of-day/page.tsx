import { requireMenuAccess } from "@/lib/require-menu-access";
import EndOfDayClient from "./components/EndOfDayClient";

export default async function EndOfDayPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  await requireMenuAccess(branchId, "/end-of-day");
  return <EndOfDayClient branchId={branchId} />;
}
