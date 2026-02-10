"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLastNDays } from "@/lib/date-utils";
import { useToast } from "@/context/toastContext";
import { getInventoryHistory } from "@/lib/inventory-actions";
import { InventoryHistoryType } from "@/types";
import { handleError } from "@/utils/errorHandlers";

export type DailyStockSummaryDay = {
  date: string;
  totalCost: number;
  creditCost: number;
  cashCost: number;
  receiptCount: number;
  itemsReceived: number;
};

export type DailyStockSummary = {
  eachDay: DailyStockSummaryDay[];
  totalCost: number;
  creditCost: number;
  cashCost: number;
  receiptCount: number;
  itemsReceived: number;
};

const aggregateReceiptsByDay = (
  receipts: InventoryHistoryType[]
): DailyStockSummary => {
  const dayMap = new Map<string, DailyStockSummaryDay>();

  receipts.forEach((receipt) => {
    if (receipt.reversed) return;
    const dateStr = receipt.invoiceDate?.toString().split("T")[0] || "";
    if (!dateStr) return;

    if (!dayMap.has(dateStr)) {
      dayMap.set(dateStr, {
        date: dateStr,
        totalCost: 0,
        creditCost: 0,
        cashCost: 0,
        receiptCount: 0,
        itemsReceived: 0,
      });
    }

    const day = dayMap.get(dateStr)!;
    day.totalCost += receipt.totalCost ?? 0;
    day.receiptCount += 1;
    day.itemsReceived += receipt.products?.reduce((s, p) => s + (p.quantity ?? 0), 0) ?? 0;

    if (receipt.paymentType === "credit") {
      day.creditCost += receipt.totalCost ?? 0;
    } else {
      day.cashCost += receipt.totalCost ?? 0;
    }
  });

  const eachDay = Array.from(dayMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalCost = eachDay.reduce((s, d) => s + d.totalCost, 0);
  const creditCost = eachDay.reduce((s, d) => s + d.creditCost, 0);
  const cashCost = eachDay.reduce((s, d) => s + d.cashCost, 0);
  const receiptCount = eachDay.reduce((s, d) => s + d.receiptCount, 0);
  const itemsReceived = eachDay.reduce((s, d) => s + d.itemsReceived, 0);

  return {
    eachDay,
    totalCost,
    creditCost,
    cashCost,
    receiptCount,
    itemsReceived,
  };
};

export const useStockReport = () => {
  const { branchId } = useParams();
  const router = useRouter();
  const { error: toastError } = useToast();

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getLastNDays(7);

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [dailySummary, setDailySummary] = useState<DailyStockSummary>({
    eachDay: [],
    totalCost: 0,
    creditCost: 0,
    cashCost: 0,
    receiptCount: 0,
    itemsReceived: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const refreshReport = useCallback(async () => {
    if (!startDate || !endDate || !branchId) return;
    setLoading(true);
    try {
      const allReceipts: InventoryHistoryType[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getInventoryHistory({
          branchId: branchId as string,
          startDate,
          endDate,
          page,
          limit: 100,
        });

        if (response.error || !response.receipts) {
          break;
        }

        allReceipts.push(...response.receipts);

        const pagination = response.pagination;
        if (!pagination || page >= pagination.pages || response.receipts.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }

      const summary = aggregateReceiptsByDay(allReceipts);
      setDailySummary(summary);
    } catch (error) {
      toastError(handleError(error));
      setDailySummary({
        eachDay: [],
        totalCost: 0,
        creditCost: 0,
        cashCost: 0,
        receiptCount: 0,
        itemsReceived: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [branchId, startDate, endDate, toastError]);

  useEffect(() => {
    if (startDate || endDate) {
      refreshReport();
    }
  }, [startDate, endDate, refreshReport]);

  const exportToCSV = useCallback(() => {
    if (!dailySummary || dailySummary.eachDay.length === 0) {
      toastError("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Total Cost",
      "Cash Cost",
      "Credit Cost",
      "Receipts",
      "Items Received",
    ];
    const rows = dailySummary.eachDay.map((day) => [
      day.date,
      String(day.totalCost.toFixed(2)),
      String(day.cashCost.toFixed(2)),
      String(day.creditCost.toFixed(2)),
      String(day.receiptCount),
      String(day.itemsReceived),
    ]);

    rows.push([
      "TOTAL",
      dailySummary.totalCost.toFixed(2),
      dailySummary.cashCost.toFixed(2),
      dailySummary.creditCost.toFixed(2),
      String(dailySummary.receiptCount),
      String(dailySummary.itemsReceived),
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
      `stock-report-${startDate}-to-${endDate}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [dailySummary, startDate, endDate, toastError]);

  const navigateToDayDetail = useCallback(
    (date: string) => {
      router.push(`/${branchId}/menu/stock-report/${date}`);
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
