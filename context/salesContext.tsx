"use client";
import { SaleType } from "@/types";
import React, { useState } from "react";

type SalesContextType = {
  startDate: string;
  setStartDate: (startDate: string) => void;
  endDate: string;
  setEndDate: (endDate: string) => void;
  salesHistory: SaleType[];
  setSalesHistory: (salesHistory: SaleType[]) => void;
};

const SalesContext = React.createContext<SalesContextType>({
  startDate: "",
  endDate: "",
  setStartDate: () => {},
  setEndDate: () => {},
  setSalesHistory: () => {},
  salesHistory: [],
});

export const SalesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState<string>(yesterday);
  const [endDate, setEndDate] = useState<string>(today);
  const [salesHistory, setSalesHistory] = useState<SaleType[]>([]);

  return (
    <SalesContext.Provider
      value={{
        startDate,
        endDate,
        salesHistory,
        setStartDate,
        setEndDate,
        setSalesHistory,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = React.useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};
