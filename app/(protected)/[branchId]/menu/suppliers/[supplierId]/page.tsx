import { getSupplierById } from "@/lib/suppliers-actions";
import SupplierProfile from "./SupplierProfile";
import { getBranch } from "@/lib/branch-actions";

export default async function SupplierProfilePage({
  params,
}: {
  params: Promise<{ branchId: string; supplierId: string }>;
}) {
  const { branchId, supplierId } = await params;
  const supplierPromise = getSupplierById(supplierId);
  const branchPromise = getBranch(branchId);
  return (
    <SupplierProfile
      branchId={branchId}
      supplierPromise={supplierPromise}
      branchPromise={branchPromise}
    />
  );
}
