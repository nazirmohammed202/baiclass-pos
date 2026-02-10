import { getSuppliers } from "@/lib/suppliers-actions";
import SuppliersSection from "./components/SuppliersSection";

const SuppliersPage = async ({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) => {
  const { branchId } = await params;
  const initialSuppliers = getSuppliers(branchId);

  return (
    <div className="p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
      <SuppliersSection branchId={branchId} initialSuppliers={initialSuppliers} />
    </div>
  );
};

export default SuppliersPage;
