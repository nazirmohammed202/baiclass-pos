"use server";
import React from "react";
import { StockProvider } from "@/context/stockContext";
import { getBranchProductsStockData } from "@/lib/branch-actions";

const StockHandler = async ({
  children,
  branchId,
}: {
  children: React.ReactNode;
  branchId: string;
}) => {
  const stockData = getBranchProductsStockData(branchId);
  return (
    <StockProvider branchId={branchId as string} stockData={stockData}>
      {children}
    </StockProvider>
  );
};

export default StockHandler;
