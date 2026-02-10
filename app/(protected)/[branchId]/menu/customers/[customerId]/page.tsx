import { getCustomerById } from "@/lib/customer-actions";
import CustomerProfile from "./CustomerProfile";
import { getBranch } from "@/lib/branch-actions";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ branchId: string; customerId: string }>;
}) {
  const { branchId, customerId } = await params;
  const customerPromise = getCustomerById(customerId);
  const branchPromise = getBranch(branchId);
  return (
    <CustomerProfile
      branchId={branchId}
      customerPromise={customerPromise}
      branchPromise={branchPromise}
    />
  );
}
