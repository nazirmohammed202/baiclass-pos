import { getCustomers, getCustomersBalanceDue } from "@/lib/customer-actions";
import CustomersSection from "./components/CustomersSection";

const CustomersPage = async ({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) => {
  const { branchId } = await params;
  const initialCustomers = getCustomers(branchId);
  const initialCustomersBalanceDue = getCustomersBalanceDue(branchId);

  return (
    <div className="p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
      <CustomersSection branchId={branchId} initialCustomers={initialCustomers} initialCustomersBalanceDue={initialCustomersBalanceDue} />
    </div>
  );
};

export default CustomersPage;
