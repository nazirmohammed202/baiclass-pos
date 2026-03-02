import SaleTabs from "@/app/(protected)/[branchId]/menu/new-sale/components/saleTabs";
import { StockProvider } from "@/context/stockContext";
import {
  getBranch,
  getBranchCustomers,
  getBranchProductsMetadata,
  getBranchProductsStockData,
} from "@/lib/branch-actions";
import React from "react";

const NewSale = async ({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) => {
  const { branchId } = await params;
  const customers = getBranchCustomers(branchId);
  const products = getBranchProductsMetadata(branchId);
  const stockData = getBranchProductsStockData(branchId);
  const branch = getBranch(branchId);

  return (
    <div className="p-4 h-full">
      <StockProvider>
        <SaleTabs
          customers={customers}
          products={products}
          stockData={stockData}
          branch={branch}
        />
      </StockProvider>
    </div>
  );
};

export default NewSale;
