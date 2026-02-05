"use client";
import { InventoryHistoryType } from "@/types";
import React, { useState } from "react";

type PaginationType = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type StockHistoryContextType = {
  startDate: string;
  setStartDate: (startDate: string) => void;
  endDate: string;
  setEndDate: (endDate: string) => void;
  stockHistory: InventoryHistoryType[];
  setStockHistory: (stockHistory: InventoryHistoryType[]) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  pagination: PaginationType;
  setPagination: (pagination: PaginationType) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
};

const StockHistoryContext = React.createContext<StockHistoryContextType>({
  startDate: "",
  endDate: "",
  setStartDate: () => {},
  setEndDate: () => {},
  setStockHistory: () => {},
  stockHistory: [],
  searchQuery: "",
  setSearchQuery: () => {},
  loading: true,
  setLoading: () => {},
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  setPagination: () => {},
  page: 1,
  setPage: () => {},
  limit: 10,
  setLimit: () => {},
});

export const StockHistoryProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState<string>(yesterday);
  const [endDate, setEndDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stockHistory, setStockHistory] = useState<InventoryHistoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  return (
    <StockHistoryContext.Provider
      value={{
        startDate,
        endDate,
        stockHistory,
        setStartDate,
        setEndDate,
        setStockHistory,
        searchQuery,
        setSearchQuery,
        loading,
        setLoading,
        pagination,
        setPagination,
        page,
        setPage,
        limit,
        setLimit,
      }}
    >
      {children}
    </StockHistoryContext.Provider>
  );
};

export const useStockHistory = () => {
  const context = React.useContext(StockHistoryContext);
  if (!context) {
    throw new Error("useStockHistory must be used within a StockHistoryProvider");
  }
  return context;
};
