"use client";

import {
  Boxes,
  AlertTriangle,
  PackageX,
  PackageCheck,
  ArrowDownUp,
  Warehouse,
  Info,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { InventoryHealthData } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";

type InventoryHealthSectionProps = {
  data: InventoryHealthData | null;
  loading?: boolean;
};

export function InventoryHealthFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-36 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-neutral-800/50 animate-pulse">
            <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="h-7 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InventoryHealthSection({
  data,
  loading,
}: InventoryHealthSectionProps) {
  if (loading && !data) return <InventoryHealthFallback />;

  if (!data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Inventory Health
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inventory health data unavailable — backend endpoint needed.
          </p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "INVENTORY VALUE (COST)",
      value: formatCurrency(data.totalValueCost),
      icon: <Warehouse className="w-4 h-4" />,
      tooltip: "Sum of (basePrice x stock) for all products",
    },
    {
      label: "INVENTORY VALUE (RETAIL)",
      value: formatCurrency(data.totalValueRetail),
      icon: <Warehouse className="w-4 h-4" />,
      tooltip: "Sum of (retailPrice x stock) for all products",
    },
    {
      label: "GMROI",
      value: data.gmroi.toFixed(2),
      icon: <ArrowDownUp className="w-4 h-4" />,
      tooltip: "Gross Margin Return on Inventory — higher is better (>1 means profitable)",
    },
    {
      label: "TOTAL SKUs",
      value: data.totalSkus.toLocaleString(),
      icon: <Boxes className="w-4 h-4" />,
      tooltip: "Total number of unique products in this branch",
    },
    {
      label: "LOW STOCK",
      value: data.lowStockCount.toLocaleString(),
      icon: <AlertTriangle className="w-4 h-4" />,
      tooltip: "Products with stock below their low stock threshold",
      alert: data.lowStockCount > 0,
      alertColor: "text-amber-600 dark:text-amber-500",
    },
    {
      label: "OUT OF STOCK",
      value: data.outOfStockCount.toLocaleString(),
      icon: <PackageX className="w-4 h-4" />,
      tooltip: "Products with zero or negative stock",
      alert: data.outOfStockCount > 0,
      alertColor: "text-red-600 dark:text-red-500",
    },
    {
      label: "OVERSTOCKED",
      value: data.overstockedCount.toLocaleString(),
      icon: <PackageCheck className="w-4 h-4" />,
      tooltip: "Products with excessive stock relative to sales velocity",
      alert: data.overstockedCount > 0,
      alertColor: "text-orange-600 dark:text-orange-500",
    },
    {
      label: "AVG. TURNOVER (DAYS)",
      value: data.averageTurnover.toFixed(1),
      icon: <ArrowDownUp className="w-4 h-4" />,
      tooltip: "Average number of days to sell through current stock at current velocity",
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Inventory Health
          </h3>
          <InfoTooltip content="Current snapshot of inventory levels and turnover">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        )}
      </div>

      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-neutral-900 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {m.label}
              </p>
              <InfoTooltip content={m.tooltip}>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className={`text-2xl font-semibold tabular-nums ${m.alert ? m.alertColor : "text-gray-900 dark:text-gray-100"
              }`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
