"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLastNDays, getYesterdayIso } from "@/lib/date-utils";
import { useToast } from "@/context/toastContext";
import { getSalesHistoryCached } from "@/lib/sale-actions";
import { getDailySalesReport, getDailySalesSummary } from "@/lib/saleShift-actions";
import { DailySalesReport, DailySalesSummary, SalePopulatedType } from "@/types";
import { handleError } from "@/utils/errorHandlers";

export type SummaryStats = {
  totalSales: number;
  transactionCount: number;
  cashSales: number;
  creditSales: number;
  averageTransaction: number;
  cashPaymentMethod: number;
  momoPaymentMethod: number;
  retailSales: number;
  wholesaleSales: number;
  outstandingCredit: number;
};

export const computeSummaryStats = (
  sales: SalePopulatedType[]
): SummaryStats => {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const transactionCount = sales.length;
  const cashSales = sales
    .filter((sale) => sale.salesType === "cash")
    .reduce((sum, sale) => sum + sale.total, 0);
  const creditSales = sales
    .filter((sale) => sale.salesType === "credit")
    .reduce((sum, sale) => sum + sale.total, 0);
  const averageTransaction =
    transactionCount > 0 ? totalSales / transactionCount : 0;
  const cashPaymentMethod = sales
    .filter((sale) => sale.paymentMethod === "cash")
    .reduce((sum, sale) => sum + sale.total, 0);
  const momoPaymentMethod = sales
    .filter((sale) => sale.paymentMethod === "momo")
    .reduce((sum, sale) => sum + sale.total, 0);
  const retailSales = sales
    .filter((sale) => sale.priceMode === "retail")
    .reduce((sum, sale) => sum + sale.total, 0);
  const wholesaleSales = sales
    .filter((sale) => sale.priceMode === "wholesale")
    .reduce((sum, sale) => sum + sale.total, 0);
  const outstandingCredit = sales
    .filter((s) => s.salesType === "credit")
    .reduce((sum, s) => sum + (s.due || 0), 0);

  return {
    totalSales,
    transactionCount,
    cashSales,
    creditSales,
    averageTransaction,
    cashPaymentMethod,
    momoPaymentMethod,
    retailSales,
    wholesaleSales,
    outstandingCredit,
  };
};

export type ProductSaleData = {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  transactionCount: number;
};

export const computeTopProducts = (
  sales: SalePopulatedType[],
  limit = 10
): ProductSaleData[] => {
  const productMap = new Map<string, ProductSaleData>();

  sales.forEach((sale) => {
    sale.products.forEach((productItem) => {
      let productId = "unknown";
      let productName = "Unknown Product";

      if (typeof productItem.product === "string") {
        productId = productItem.product;
      } else if (
        productItem.product &&
        typeof productItem.product === "object"
      ) {
        const populatedProduct = productItem.product as {
          _id?: string;
          name?: string;
          details?: { _id?: string; name?: string };
        };
        productId =
          populatedProduct._id || populatedProduct.details?._id || "unknown";
        productName =
          populatedProduct.name ||
          populatedProduct.details?.name ||
          "Unknown Product";
      }

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName,
          quantity: 0,
          revenue: 0,
          transactionCount: 0,
        });
      }

      const productData = productMap.get(productId)!;
      productData.quantity += productItem.quantity;
      productData.revenue += productItem.total;
      productData.transactionCount += 1;
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

export type CustomerSaleData = {
  customerId: string;
  customerName: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
};

export const computeTopCustomers = (
  sales: SalePopulatedType[],
  limit = 10
): CustomerSaleData[] => {
  const customerMap = new Map<string, CustomerSaleData>();

  sales.forEach((sale) => {
    if (sale.customer) {
      const customerId = sale.customer._id;
      const customerName = sale.customer.name;

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName,
          totalSpent: 0,
          transactionCount: 0,
          averageTransaction: 0,
        });
      }

      const customerData = customerMap.get(customerId)!;
      customerData.totalSpent += sale.total;
      customerData.transactionCount += 1;
      customerData.averageTransaction =
        customerData.totalSpent / customerData.transactionCount;
    }
  });

  return Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

export type SellerSaleData = {
  sellerId: string;
  sellerName: string;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
};

export const computeSalesBySeller = (
  sales: SalePopulatedType[]
): SellerSaleData[] => {
  const sellerMap = new Map<string, SellerSaleData>();

  sales.forEach((sale) => {
    const sellerId = sale.seller._id;
    const sellerName = sale.seller.name;

    if (!sellerMap.has(sellerId)) {
      sellerMap.set(sellerId, {
        sellerId,
        sellerName,
        totalSales: 0,
        transactionCount: 0,
        averageTransaction: 0,
      });
    }

    const sellerData = sellerMap.get(sellerId)!;
    sellerData.totalSales += sale.total;
    sellerData.transactionCount += 1;
    sellerData.averageTransaction =
      sellerData.totalSales / sellerData.transactionCount;
  });

  return Array.from(sellerMap.values()).sort(
    (a, b) => b.totalSales - a.totalSales
  );
};

export type ThirtyMinSlotData = {
  slotIndex: number;
  label: string;
  sales: number;
  transactions: number;
};

export const computeThirtyMinBreakdown = (
  sales: SalePopulatedType[]
): ThirtyMinSlotData[] => {
  const slotLabel = (slotIndex: number): string => {
    const hour = Math.floor(slotIndex / 2) % 24;
    const isHalf = slotIndex % 2 === 1;
    if (hour === 0 && !isHalf) return "12 AM";
    if (hour === 0 && isHalf) return "12:30 AM";
    if (hour < 12 && !isHalf) return `${hour} AM`;
    if (hour < 12 && isHalf) return `${hour}:30 AM`;
    if (hour === 12 && !isHalf) return "12 PM";
    if (hour === 12 && isHalf) return "12:30 PM";
    if (!isHalf) return `${hour - 12} PM`;
    return `${hour - 12}:30 PM`;
  };

  const slots: ThirtyMinSlotData[] = [];
  for (let i = 0; i < 48; i++) {
    slots.push({
      slotIndex: i,
      label: slotLabel(i),
      sales: 0,
      transactions: 0,
    });
  }

  sales.forEach((sale) => {
    const saleDate = sale.createdAt
      ? typeof sale.createdAt === "string"
        ? new Date(sale.createdAt)
        : sale.createdAt
      : null;

    if (saleDate) {
      const hour = saleDate.getHours();
      const minute = saleDate.getMinutes();
      const slotIndex = hour * 2 + (minute < 30 ? 0 : 1);
      const slot = slots[slotIndex];
      if (slot) {
        slot.sales += sale.total;
        slot.transactions += 1;
      }
    }
  });

  return slots;
};

export type ChartDataPoint = { name: string; value: number };

export const computeSalesTypeData = (stats: SummaryStats): ChartDataPoint[] => [
  { name: "Cash", value: stats.cashSales },
  { name: "Credit", value: stats.creditSales },
];

export const computePaymentMethodData = (stats: SummaryStats): ChartDataPoint[] => [
  { name: "Cash", value: stats.cashPaymentMethod },
  { name: "MoMo", value: stats.momoPaymentMethod },
];

export const computePriceModeData = (stats: SummaryStats): ChartDataPoint[] => [
  { name: "Retail", value: stats.retailSales },
  { name: "Wholesale", value: stats.wholesaleSales },
];

export type UseDayDataParams = {
  date: string;
  branchId: string | string[] | undefined;
};

export const useDayData = ({ date, branchId }: UseDayDataParams) => {
  const { error: toastError } = useToast();
  const [sales, setSales] = useState<SalePopulatedType[]>([]);
  const [dailyReport, setDailyReport] = useState<DailySalesReport | null>(null);
  const [yesterdayReport, setYesterdayReport] = useState<DailySalesReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDayData = async () => {
      if (!date || !branchId) return;

      setLoading(true);
      try {
        const yesterdayIso = getYesterdayIso(date);
        const [allSales, report, yReport] = await Promise.all([
          (async () => {
            const list: SalePopulatedType[] = [];
            let page = 1;
            let hasMore = true;
            while (hasMore) {
              const data = await getSalesHistoryCached(
                branchId as string,
                date,
                date,
                "",
                page,
                100
              );
              list.push(...data.sales);
              if (data.sales.length < 100 || page >= data.pagination.pages) {
                hasMore = false;
              } else {
                page++;
              }
            }
            return list;
          })(),
          getDailySalesReport(branchId as string, date),
          yesterdayIso
            ? getDailySalesReport(branchId as string, yesterdayIso).catch(() => null)
            : Promise.resolve(null),
        ]);

        setSales(allSales);
        setDailyReport(report);
        setYesterdayReport(yReport ?? null);
      } catch (error) {
        console.error("Failed to fetch day data:", error);
        toastError(handleError(error));
        setSales([]);
        setDailyReport(null);
        setYesterdayReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDayData();
  }, [date, branchId, toastError]);

  return { sales, dailyReport, yesterdayReport, loading };
};

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
