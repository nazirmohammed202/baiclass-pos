"use server";
import React from "react";
import { StockProvider } from "@/context/stockContext";
import { getBranchProductsStockData } from "@/lib/branch-actions";

const StockHandler = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StockProvider>{children}</StockProvider>;
};

export default StockHandler;
