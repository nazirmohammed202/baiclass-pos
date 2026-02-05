import ReceiveStockTabs from "./components/ReceiveStockTabs";
import {
  getBranch,
  getBranchProductsMetadata,
  getBranchProductsStockData,
} from "@/lib/branch-actions";
import { getSuppliers } from "@/lib/suppliers-actions";
import React from "react";

const ReceiveStock = async ({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) => {
  const { branchId } = await params;
  const products = getBranchProductsMetadata(branchId);
  const stockData = getBranchProductsStockData(branchId);
  const suppliers = getSuppliers(branchId);
  const branch = getBranch(branchId);

  return (
    <div className="px-4 h-full">
      <ReceiveStockTabs
        products={products}
        stockData={stockData}
        suppliers={suppliers}
        branch={branch}
      />
    </div>
  );
};

export default ReceiveStock;
