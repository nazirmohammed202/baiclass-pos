"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Users, User, Info } from "lucide-react";
import { formatDateToDisplayWithDay, getYesterdayIso } from "@/lib/date-utils";
import { getSalesHistoryCached } from "@/lib/sale-actions";
import { getDailySalesReport } from "@/lib/saleShift-actions";
import { DailySalesReport, SalePopulatedType } from "@/types";
import { fmt, formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/toastContext";
import { handleError } from "@/utils/errorHandlers";
import ViewSaleModal from "../../sales-history/components/viewSaleModal";
import SalesHistoryTableSkeleton from "../../sales-history/components/salesHistoryTableSkeleton";
import InfoTooltip from "@/components/ui/tooltip";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DaySalesDetailProps = {
  date: string;
};

type ProductSaleData = {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  transactionCount: number;
};

type CustomerSaleData = {
  customerId: string;
  customerName: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
};

type SellerSaleData = {
  sellerId: string;
  sellerName: string;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
};

type HourlySalesData = {
  hour: number;
  hourLabel: string;
  sales: number;
  transactions: number;
};

const COLORS = [
  "#008080",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
];

const DaySalesDetail = ({ date }: DaySalesDetailProps) => {
  const { branchId } = useParams();
  const router = useRouter();
  const { error: toastError } = useToast();

  const [sales, setSales] = useState<SalePopulatedType[]>([]);
  const [dailyReport, setDailyReport] = useState<DailySalesReport | null>(null);
  const [yesterdayReport, setYesterdayReport] = useState<DailySalesReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewingSale, setViewingSale] = useState<SalePopulatedType | null>(
    null
  );

  const summaryStats = useMemo(() => {
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
  }, [sales]);

  const topProducts = useMemo(() => {
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
      .slice(0, 10);
  }, [sales]);

  const topCustomers = useMemo(() => {
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
      .slice(0, 10);
  }, [sales]);

  const salesBySeller = useMemo(() => {
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
  }, [sales]);

  const hourlyBreakdown = useMemo(() => {
    const hourlyMap = new Map<number, HourlySalesData>();

    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, {
        hour: i,
        hourLabel:
          i === 0
            ? "12 AM"
            : i < 12
              ? `${i} AM`
              : i === 12
                ? "12 PM"
                : `${i - 12} PM`,
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
        const hourData = hourlyMap.get(hour)!;
        hourData.sales += sale.total;
        hourData.transactions += 1;
      }
    });

    return Array.from(hourlyMap.values());
  }, [sales]);

  const salesTypeData = [
    { name: "Cash", value: summaryStats.cashSales },
    { name: "Credit", value: summaryStats.creditSales },
  ];

  const paymentMethodData = [
    { name: "Cash", value: summaryStats.cashPaymentMethod },
    { name: "MoMo", value: summaryStats.momoPaymentMethod },
  ];

  const priceModeData = [
    { name: "Retail", value: summaryStats.retailSales },
    { name: "Wholesale", value: summaryStats.wholesaleSales },
  ];

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

  const handleBack = () => {
    router.back();
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(2));
  };

  if (loading) {
    return (
      <div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 mb-4 ">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Report
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sales for {formatDateToDisplayWithDay(date)}
          </h1>
        </div>
        <SalesHistoryTableSkeleton />
      </div>
    );
  }

  const report = dailyReport;

  // Calculate percentages for progress bars
  const totalSalesNum = Number(report?.totalSales ?? "0");
  const cashSalesNum = Number(report?.totalCashSales ?? "0");
  const creditSalesNum = Number(report?.totalCreditSales ?? "0");
  const cashPercentage = totalSalesNum > 0 ? (cashSalesNum / totalSalesNum) * 100 : 0;
  const creditPercentage = totalSalesNum > 0 ? (creditSalesNum / totalSalesNum) * 100 : 0;
  const ePaymentNum = Number(report?.totalElectronicPayments ?? "0");
  const ePaymentPercentage = cashSalesNum > 0 ? (ePaymentNum / cashSalesNum) * 100 : 0;
  const grossProfitNum = Number(report?.grossProfit ?? "0");
  const expensesNum = Number(report?.totalExpenses ?? "0");
  const netProfitNum = grossProfitNum - expensesNum;

  const yesterdayTotalNum = Number(yesterdayReport?.totalSales ?? "0");
  const growthPercent =
    yesterdayTotalNum > 0
      ? ((totalSalesNum - yesterdayTotalNum) / yesterdayTotalNum) * 100
      : totalSalesNum > 0
        ? 100
        : 0;

  const growthDoughnutData =
    totalSalesNum === 0 && yesterdayTotalNum === 0
      ? [
        { name: "Yesterday", value: 1 },
        { name: "Today", value: 1 },
      ]
      : [
        { name: "Yesterday", value: yesterdayTotalNum || 0 },
        { name: "Today", value: totalSalesNum || 0 },
      ];
  const hasGrowthData = totalSalesNum > 0 || yesterdayTotalNum > 0;

  return (
    <div className="space-y-4 p-2">
      {/* Header */}
      <section className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-neutral-800 ">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Report
        </button>

        <div className="flex items-center gap-2 justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sales Analytics
          </h1>

          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 ">
            {formatDateToDisplayWithDay(date)}
          </h3>
        </div>
      </section>

      {/* Summary Stats Cards */}
      <section className="flex gap-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-3/4">
          {/* Total Sales */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                TOTAL SALES
              </p>
              <InfoTooltip content="The total revenue from all sales transactions for this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {fmt(report?.totalSales)}
            </p>
            <div className="mt-2 flex gap-2 items-end">
              <div>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Daily Target</p>
                <p className="font-medium">{fmt(report?.dailySalesTarget)}</p>
              </div>

              <div className="w-full flex flex-col items-end gap-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{calculatePercentage(Number(report?.totalSales), Number(report?.dailySalesTarget))}% Completed</p>
                <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded transition-all brightness-150"
                    style={{ width: `${calculatePercentage(Number(report?.totalSales), Number(report?.dailySalesTarget))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Cash Sales */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                TOTAL CASH SALES
              </p>
              <InfoTooltip content="Total revenue from cash sales for this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {fmt(report?.totalCashSales)}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {cashPercentage.toFixed(1)}% ({fmt(report?.totalCashSales)}) of Total
                </p>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded overflow-hidden">
                <div
                  className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(cashPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Total Credit Sales */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                TOTAL CREDIT SALES
              </p>
              <InfoTooltip content="Total revenue from credit sales for this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {fmt(report?.totalCreditSales)}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {creditPercentage.toFixed(1)}% ({fmt(report?.totalCreditSales)}) of Total
                </p>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(creditPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>




          {/* Total E-Payment */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                TOTAL E-PAYMENT
              </p>
              <InfoTooltip content="Total e-payment (MoMo, etc.) for this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {fmt(report?.totalElectronicPayments)}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {ePaymentPercentage.toFixed(1)}% ({fmt(report?.totalElectronicPayments)}) of Cash Sales
                </p>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(ePaymentPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Products Sold */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                PRODUCTS SOLD
              </p>
              <InfoTooltip content="Total number of products sold this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-6xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {report?.totalProductsSold ?? 0}
            </p>
          </div>

          {/* Average Sale */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                AVERAGE SALE
              </p>
              <InfoTooltip content="Total number of products sold this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-6xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {fmt(report?.averageSale)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-1/4">
          {/* Gross Profit */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                GROSS PROFIT
              </p>
              <InfoTooltip content="Gross profit (revenue minus cost of goods) for this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {fmt(report?.grossProfit)}
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                EXPENSES
              </p>
              <InfoTooltip content="Total expenses for this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {fmt(report?.totalExpenses)}
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                NET PROFIT
              </p>
              <InfoTooltip content="Gross profit minus expenses for this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p
              className={`text-3xl font-semibold ${netProfitNum >= 0
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
                }`}
            >
              {formatCurrency(netProfitNum)}
            </p>
          </div>
        </div>
      </section>


      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Sales
            </h3>
          </div>
          {sales.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No sales found for this day</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {sales.map((sale) => {
                      const saleDate = sale.createdAt
                        ? typeof sale.createdAt === "string"
                          ? new Date(sale.createdAt)
                          : sale.createdAt
                        : null;
                      const timeStr = saleDate
                        ? saleDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "-";

                      return (
                        <tr
                          key={sale._id}
                          onClick={() => setViewingSale(sale)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {sale.invoiceNumber || sale._id.slice(-8)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {sale.customer?.name || "Walk-in"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {sale.products.length}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(sale.total)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sale.salesType === "credit"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                            >
                              {sale.salesType === "credit" ? "Credit" : "Cash"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {timeStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden">
                {sales.map((sale) => {
                  const saleDate = sale.createdAt
                    ? typeof sale.createdAt === "string"
                      ? new Date(sale.createdAt)
                      : sale.createdAt
                    : null;
                  const timeStr = saleDate
                    ? saleDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "-";

                  return (
                    <div
                      key={sale._id}
                      onClick={() => setViewingSale(sale)}
                      className="p-4 border-b border-gray-200 dark:border-neutral-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {sale.invoiceNumber || sale._id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {sale.customer?.name || "Walk-in"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(sale.total)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {timeStr}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sale.salesType === "credit"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                        >
                          {sale.salesType === "credit" ? "Credit" : "Cash"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {sale.products.length} item
                          {sale.products.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Growth vs Yesterday Doughnut */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Growth vs Yesterday
          </h3>
          {!hasGrowthData && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              No sales data for today or yesterday
            </p>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={growthDoughnutData}
                cx="50%"
                cy="88%"
                startAngle={180}
                endAngle={0}
                innerRadius={34}
                outerRadius={82}
                cornerRadius={50}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  hasGrowthData
                    ? `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    : name
                }
              >
                <Cell fill="#9ca3af" stroke="none" />
                <Cell fill={COLORS[0]} stroke="none" />
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          {hasGrowthData && (
            <p
              className={`text-center text-sm font-semibold mt-1 ${growthPercent >= 0
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
                }`}
            >
              {growthPercent >= 0 ? "+" : ""}
              {growthPercent.toFixed(1)}% vs yesterday
            </p>
          )}
        </div>
      </section>



      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">
            Sales Type Breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This chart shows the breakdown of sales by type.</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={salesTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {salesTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">
            Payment Method Breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This chart shows the breakdown of sales by payment method.</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[(index) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">
            Price Mode
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This chart shows the breakdown of sales by price mode.</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priceModeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {priceModeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[(index) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Sales Heat Map */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Hourly Sales
        </h3>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sales by hour (darker = higher)
          </p>
          {(() => {
            const maxSales = Math.max(
              ...hourlyBreakdown.map((h) => h.sales),
              1
            );
            return (
              <div className="grid grid-cols-12 sm:grid-cols-24 gap-0.5 sm:gap-1">
                {hourlyBreakdown.map((hour) => {
                  const intensity =
                    maxSales > 0 ? hour.sales / maxSales : 0;
                  const opacity = 0.12 + 0.88 * intensity;
                  return (
                    <div
                      key={hour.hour}
                      title={`${hour.hourLabel}: ${formatCurrency(hour.sales)}`}
                      className={`aspect-square min-h-[28px] sm:min-h-[32px] rounded-sm transition-colors ${
                        intensity === 0
                          ? "bg-gray-200 dark:bg-neutral-700"
                          : ""
                      }`}
                      style={
                        intensity > 0
                          ? {
                              backgroundColor: `rgba(194, 65, 12, ${opacity})`,
                            }
                          : undefined
                      }
                    >
                      <span className="sr-only">
                        {hour.hourLabel} {formatCurrency(hour.sales)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 px-0.5">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Products
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {topProducts.map((product, index) => (
                  <tr
                    key={product.productId}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {product.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {product.transactionCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {calculatePercentage(
                        product.revenue,
                        summaryStats.totalSales
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Customers
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Transaction
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {topCustomers.map((customer, index) => (
                  <tr
                    key={customer.customerId}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {customer.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {customer.transactionCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(customer.averageTransaction)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {calculatePercentage(
                        customer.totalSpent,
                        summaryStats.totalSales
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales by Seller */}
      {salesBySeller.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Sales by Seller
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Transaction
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {salesBySeller.map((seller) => (
                  <tr
                    key={seller.sellerId}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {seller.sellerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(seller.totalSales)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {seller.transactionCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(seller.averageTransaction)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {calculatePercentage(
                        seller.totalSales,
                        summaryStats.totalSales
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* View Sale Modal */}
      {viewingSale && (
        <ViewSaleModal
          sale={viewingSale}
          isOpen={!!viewingSale}
          onClose={() => setViewingSale(null)}
        />
      )}
    </div>
  );
};

export default DaySalesDetail;
