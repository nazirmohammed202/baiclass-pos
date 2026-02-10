"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  Info,
  RotateCcw,
} from "lucide-react";
import { formatDateToDisplayWithDay, getYesterdayIso } from "@/lib/date-utils";
import { getInventoryHistory } from "@/lib/inventory-actions";
import { InventoryHistoryType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/toastContext";
import { handleError } from "@/utils/errorHandlers";
import ViewInventoryModal from "../../stock-history/components/ViewInventoryModal";
import InfoTooltip from "@/components/ui/tooltip";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DayStockDetailProps = {
  date: string;
};

type ProductStockData = {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
  receiptCount: number;
};

type SupplierStockData = {
  supplierId: string;
  supplierName: string;
  totalCost: number;
  receiptCount: number;
  averageReceipt: number;
};

type HourlyStockData = {
  hour: number;
  hourLabel: string;
  cost: number;
  receipts: number;
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

const DayStockDetail = ({ date }: DayStockDetailProps) => {
  const { branchId } = useParams();
  const router = useRouter();
  const { error: toastError } = useToast();

  const [receipts, setReceipts] = useState<InventoryHistoryType[]>([]);
  const [yesterdayReceipts, setYesterdayReceipts] = useState<
    InventoryHistoryType[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewingReceipt, setViewingReceipt] =
    useState<InventoryHistoryType | null>(null);

  const activeReceiptsList = useMemo(
    () => receipts.filter((r) => !r.reversed),
    [receipts]
  );

  const summaryStats = useMemo(() => {
    const totalCost = activeReceiptsList.reduce(
      (sum, r) => sum + (r.totalCost ?? 0),
      0
    );
    const receiptCount = activeReceiptsList.length;
    const cashCost = activeReceiptsList
      .filter((r) => r.paymentType === "cash")
      .reduce((sum, r) => sum + (r.totalCost ?? 0), 0);
    const creditCost = activeReceiptsList
      .filter((r) => r.paymentType === "credit")
      .reduce((sum, r) => sum + (r.totalCost ?? 0), 0);
    const cashPaymentMethod = activeReceiptsList
      .filter((r) => r.paymentMethod === "cash")
      .reduce((sum, r) => sum + (r.totalCost ?? 0), 0);
    const momoPaymentMethod = activeReceiptsList
      .filter((r) => r.paymentMethod === "momo")
      .reduce((sum, r) => sum + (r.totalCost ?? 0), 0);
    const itemsReceived = activeReceiptsList.reduce(
      (sum, r) =>
        sum + (r.products?.reduce((s, p) => s + (p.quantity ?? 0), 0) ?? 0),
      0
    );
    const averageReceipt =
      receiptCount > 0 ? totalCost / receiptCount : 0;
    const reversedCount = receipts.filter((r) => r.reversed).length;

    return {
      totalCost,
      receiptCount,
      cashCost,
      creditCost,
      cashPaymentMethod,
      momoPaymentMethod,
      itemsReceived,
      averageReceipt,
      reversedCount,
    };
  }, [receipts, activeReceiptsList]);

  const topProducts = useMemo(() => {
    const productMap = new Map<string, ProductStockData>();

    activeReceiptsList.forEach((receipt) => {
      receipt.products?.forEach((item) => {
        let productId = "unknown";
        let productName = "Unknown Product";

        if (typeof item.product === "string") {
          productId = item.product;
        } else if (item.product && typeof item.product === "object") {
          const p = item.product as { _id?: string; name?: string; details?: { _id?: string; name?: string } };
          productId = p._id || p.details?._id || "unknown";
          productName = p.name || p.details?.name || "Unknown Product";
        }

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            productName,
            quantity: 0,
            cost: 0,
            receiptCount: 0,
          });
        }
        const data = productMap.get(productId)!;
        data.quantity += item.quantity ?? 0;
        data.cost += item.total ?? item.basePrice * (item.quantity ?? 0);
        data.receiptCount += 1;
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);
  }, [activeReceiptsList]);

  const topSuppliers = useMemo(() => {
    const supplierMap = new Map<string, SupplierStockData>();

    activeReceiptsList.forEach((receipt) => {
      const supplierId =
        typeof receipt.supplier === "string"
          ? receipt.supplier
          : receipt.supplier?._id ?? "no-supplier";
      const supplierName =
        typeof receipt.supplier === "object" && receipt.supplier?.name
          ? receipt.supplier.name
          : "No supplier";

      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          supplierId,
          supplierName,
          totalCost: 0,
          receiptCount: 0,
          averageReceipt: 0,
        });
      }
      const data = supplierMap.get(supplierId)!;
      data.totalCost += receipt.totalCost ?? 0;
      data.receiptCount += 1;
      data.averageReceipt = data.totalCost / data.receiptCount;
    });

    return Array.from(supplierMap.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);
  }, [activeReceiptsList]);

  const hourlyBreakdown = useMemo(() => {
    const hourlyMap = new Map<number, HourlyStockData>();

    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, {
        hour: i,
        hourLabel:
          i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`,
        cost: 0,
        receipts: 0,
      });
    }

    activeReceiptsList.forEach((receipt) => {
      const d = receipt.invoiceDate
        ? typeof receipt.invoiceDate === "string"
          ? new Date(receipt.invoiceDate)
          : receipt.invoiceDate
        : null;
      if (d) {
        const hour = d.getHours();
        const hourData = hourlyMap.get(hour)!;
        hourData.cost += receipt.totalCost ?? 0;
        hourData.receipts += 1;
      }
    });

    return Array.from(hourlyMap.values());
  }, [activeReceiptsList]);

  const paymentTypeData = [
    { name: "Cash", value: summaryStats.cashCost },
    { name: "Credit", value: summaryStats.creditCost },
  ];

  const paymentMethodData = [
    { name: "Cash", value: summaryStats.cashPaymentMethod },
    { name: "MoMo", value: summaryStats.momoPaymentMethod },
  ];

  const yesterdayTotal = useMemo(
    () =>
      yesterdayReceipts
        .filter((r) => !r.reversed)
        .reduce((sum, r) => sum + (r.totalCost ?? 0), 0),
    [yesterdayReceipts]
  );

  const growthPercent =
    yesterdayTotal > 0
      ? ((summaryStats.totalCost - yesterdayTotal) / yesterdayTotal) * 100
      : summaryStats.totalCost > 0
        ? 100
        : 0;

  const growthDoughnutData =
    summaryStats.totalCost === 0 && yesterdayTotal === 0
      ? [
        { name: "Yesterday", value: 1 },
        { name: "Today", value: 1 },
      ]
      : [
        { name: "Yesterday", value: yesterdayTotal || 0 },
        { name: "Today", value: summaryStats.totalCost || 0 },
      ];
  const hasGrowthData = summaryStats.totalCost > 0 || yesterdayTotal > 0;

  useEffect(() => {
    const fetchData = async () => {
      if (!date || !branchId) return;

      setLoading(true);
      try {
        const yesterdayIso = getYesterdayIso(date);

        const [todayRes, yesterdayRes] = await Promise.all([
          (async () => {
            const all: InventoryHistoryType[] = [];
            let page = 1;
            let hasMore = true;
            while (hasMore) {
              const res = await getInventoryHistory({
                branchId: branchId as string,
                startDate: date,
                endDate: date,
                page,
                limit: 100,
              });
              if (res.error || !res.receipts) break;
              all.push(...res.receipts);
              if (
                !res.pagination ||
                page >= res.pagination.pages ||
                res.receipts.length < 100
              )
                hasMore = false;
              else page++;
            }
            return all;
          })(),
          yesterdayIso
            ? (async () => {
              const all: InventoryHistoryType[] = [];
              let page = 1;
              let hasMore = true;
              while (hasMore) {
                const res = await getInventoryHistory({
                  branchId: branchId as string,
                  startDate: yesterdayIso,
                  endDate: yesterdayIso,
                  page,
                  limit: 100,
                });
                if (res.error || !res.receipts) break;
                all.push(...res.receipts);
                if (
                  !res.pagination ||
                  page >= res.pagination.pages ||
                  res.receipts.length < 100
                )
                  hasMore = false;
                else page++;
              }
              return all;
            })()
            : Promise.resolve([]),
        ]);

        setReceipts(todayRes);
        setYesterdayReceipts(yesterdayRes ?? []);
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
        toastError(handleError(error));
        setReceipts([]);
        setYesterdayReceipts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, branchId, toastError]);

  const handleBack = () => router.back();

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(2));
  };

  const cashPercentage =
    summaryStats.totalCost > 0
      ? (summaryStats.cashCost / summaryStats.totalCost) * 100
      : 0;
  const creditPercentage =
    summaryStats.totalCost > 0
      ? (summaryStats.creditCost / summaryStats.totalCost) * 100
      : 0;
  const momoPercentage =
    summaryStats.cashCost > 0
      ? (summaryStats.momoPaymentMethod / summaryStats.cashCost) * 100
      : 0;

  if (loading) {
    return (
      <div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Report
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Stock for {formatDateToDisplayWithDay(date)}
          </h1>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800 animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  const activeReceipts = activeReceiptsList;

  return (
    <div className="space-y-4 p-2">
      <section className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-neutral-800">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Report
        </button>
        <div className="flex items-center gap-2 justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Stock Analytics
          </h1>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatDateToDisplayWithDay(date)}
          </h3>
        </div>
      </section>

      <section className="flex gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-3/4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                TOTAL COST
              </p>
              <InfoTooltip content="Total cost of all stock received this day">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summaryStats.totalCost)}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                CASH RECEIPTS
              </p>
              <InfoTooltip content="Total cost from cash purchases">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {formatCurrency(summaryStats.cashCost)}
            </p>
            <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(cashPercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {cashPercentage.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                CREDIT RECEIPTS
              </p>
              <InfoTooltip content="Total cost from credit purchases">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {formatCurrency(summaryStats.creditCost)}
            </p>
            <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all"
                style={{ width: `${Math.min(creditPercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {creditPercentage.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                RECEIPTS
              </p>
              <InfoTooltip content="Number of stock receipts received">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-6xl font-semibold text-gray-900 dark:text-gray-100">
              {summaryStats.receiptCount}
            </p>
            {summaryStats.reversedCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                {summaryStats.reversedCount} reversed
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                ITEMS RECEIVED
              </p>
              <InfoTooltip content="Total product units received">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-6xl font-semibold text-gray-900 dark:text-gray-100">
              {summaryStats.itemsReceived}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                AVERAGE RECEIPT
              </p>
              <InfoTooltip content="Average cost per receipt">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-6xl font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summaryStats.averageReceipt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-1/4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Growth vs Yesterday
            </h3>
            <ResponsiveContainer width="100%" height={120}>
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
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
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
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Receipts
            </h3>
          </div>
          {activeReceipts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No stock receipts for this day</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Received By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Items
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {activeReceipts.map((receipt) => {
                      const d = receipt.invoiceDate
                        ? new Date(receipt.invoiceDate)
                        : null;
                      const timeStr = d
                        ? d.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "—";
                      return (
                        <tr
                          key={receipt._id}
                          onClick={() => setViewingReceipt(receipt)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {typeof receipt.supplier === "object" && receipt.supplier?.name
                              ? receipt.supplier.name
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {receipt.receivedBy?.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {receipt.products?.length ?? 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(receipt.totalCost ?? 0)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${receipt.paymentType === "credit"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                            >
                              {receipt.paymentType === "credit" ? "Credit" : "Cash"}
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
                {activeReceipts.map((receipt) => {
                  const d = receipt.invoiceDate
                    ? new Date(receipt.invoiceDate)
                    : null;
                  const timeStr = d
                    ? d.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "—";
                  return (
                    <div
                      key={receipt._id}
                      onClick={() => setViewingReceipt(receipt)}
                      className="p-4 border-b border-gray-200 dark:border-neutral-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {typeof receipt.supplier === "object" && receipt.supplier?.name
                              ? receipt.supplier.name
                              : "—"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {receipt.receivedBy?.name || "—"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(receipt.totalCost ?? 0)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {timeStr}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${receipt.paymentType === "credit"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                        >
                          {receipt.paymentType === "credit" ? "Credit" : "Cash"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {receipt.products?.length ?? 0} items
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Payment Type
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={paymentTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {paymentTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Payment Method
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
              >
                {paymentMethodData.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Hourly Receiving
          </h3>
          <div className="space-y-2">
            {(() => {
              const maxCost = Math.max(
                ...hourlyBreakdown.map((h) => h.cost),
                1
              );
              return (
                <div className="grid grid-cols-12 sm:grid-cols-24 gap-0.5 sm:gap-1">
                  {hourlyBreakdown.map((hour) => {
                    const intensity = maxCost > 0 ? hour.cost / maxCost : 0;
                    const opacity = 0.12 + 0.88 * intensity;
                    return (
                      <div
                        key={hour.hour}
                        title={`${hour.hourLabel}: ${formatCurrency(hour.cost)}`}
                        className={`aspect-square min-h-[28px] sm:min-h-[32px] rounded-sm transition-colors ${intensity === 0 ? "bg-gray-200 dark:bg-neutral-700" : ""
                          }`}
                        style={
                          intensity > 0
                            ? {
                              backgroundColor: `rgba(6, 95, 70, ${opacity})`,
                            }
                            : undefined
                        }
                      >
                        <span className="sr-only">
                          {hour.hourLabel} {formatCurrency(hour.cost)}
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
      </div>

      {topProducts.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Products Received
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {topProducts.map((p, i) => (
                  <tr
                    key={p.productId}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{i + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {p.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {p.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(p.cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {calculatePercentage(
                        p.cost,
                        summaryStats.totalCost
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

      {topSuppliers.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Suppliers
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Receipts
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Avg Receipt
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {topSuppliers.map((s, i) => (
                  <tr
                    key={s.supplierId}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{i + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {s.supplierName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(s.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {s.receiptCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(s.averageReceipt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {calculatePercentage(
                        s.totalCost,
                        summaryStats.totalCost
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

      {viewingReceipt && (
        <ViewInventoryModal
          inventory={viewingReceipt}
          isOpen={!!viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};

export default DayStockDetail;
