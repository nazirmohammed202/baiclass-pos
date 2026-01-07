"use client";
import { Product } from "@/types";
import { createContext, useContext, useState } from "react";

type StockContextType = {
  stockMap: Map<string, Product>;
  setStockMap: (stockMap: Map<string, Product>) => void;
  isStockLoading: boolean;
  setIsStockLoading: (loading: boolean) => void;
};

const stockContext = createContext<StockContextType | null>(null);

export const StockProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [stockMap, setStockMap] = useState<Map<string, Product>>(new Map());
  const [isStockLoading, setIsStockLoading] = useState(true);
  return (
    <stockContext.Provider
      value={{ stockMap, setStockMap, isStockLoading, setIsStockLoading }}
    >
      {children}
    </stockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(stockContext);
  if (!context) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
};
