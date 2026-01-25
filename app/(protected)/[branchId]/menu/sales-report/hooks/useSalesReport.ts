"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLastNDays } from "@/lib/date-utils";
import { useToast } from "@/context/toastContext";
import { getDailySalesSummary } from "@/lib/saleShift-actions";
import { DailySalesSummary } from "@/types";
import { handleError } from "@/utils/errorHandlers";

export const useSalesReport = () => {
  const { branchId } = useParams();
  const router = useRouter();
  const { error: toastError } = useToast();

  // Initialize with last 7 days
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getLastNDays(7);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [dailySummary, setDailySummary] = useState<DailySalesSummary>({
    eachDay: [],
    totalSales: "0",
    creditSales: "0",
    cashSales: "0",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const refreshReport = useCallback(async () => {
    if (!startDate || !endDate || !branchId) return;
    setLoading(true);
    try {
      const data = await getDailySalesSummary(
        branchId as string,
        startDate,
        endDate
      );
      setDailySummary(data);
    } catch (error) {
      toastError(handleError(error));
    } finally {
      setLoading(false);
    }
  }, [branchId, startDate, endDate, toastError,]);


  const exportToCSV = useCallback(() => {
    if (!dailySummary || dailySummary.eachDay.length === 0) {
      toastError("No data to export");
      return;
    }

    const headers = ["Date", "Total Sales", "Cash Sales", "Credit Sales"];
    const rows = dailySummary.eachDay.map((day) => [
      day.date,
      String(day.totalSales),
      String(day.cashSales),
      String(day.creditSales),
    ]);

    rows.push([
      "TOTAL",
      dailySummary.totalSales,
      dailySummary.cashSales,
      dailySummary.creditSales,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales-report-${startDate}-to-${endDate}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [dailySummary, startDate, endDate, toastError]);

  const navigateToDayDetail = useCallback(
    (date: string) => {
      router.push(`/${branchId}/menu/sales-report/${date}`);
    },
    [branchId, router]
  );

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    dailySummary,
    loading,
    refreshReport,
    exportToCSV,
    navigateToDayDetail,
  };
};
