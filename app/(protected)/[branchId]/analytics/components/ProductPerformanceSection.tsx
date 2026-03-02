"use client";

import { useState } from "react";
import { Package, TrendingUp, TrendingDown, Archive, Info, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductPerformanceItem } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";

type ProductPerformanceSectionProps = {
  data: {
    topSelling: ProductPerformanceItem[];
    mostProfitable: ProductPerformanceItem[];
    worstPerforming: ProductPerformanceItem[];
    deadStock: ProductPerformanceItem[];
  } | null;
  loading?: boolean;
};

type ProductTab = "topSelling" | "mostProfitable" | "worstPerforming" | "deadStock";

const TABS: { key: ProductTab; label: string; icon: typeof TrendingUp; tooltip: string }[] = [
  { key: "topSelling", label: "Top Selling", icon: TrendingUp, tooltip: "Products ranked by total revenue" },
  { key: "mostProfitable", label: "Most Profitable", icon: TrendingUp, tooltip: "Products ranked by profit margin contribution" },
  { key: "worstPerforming", label: "Worst Performing", icon: TrendingDown, tooltip: "Low sales products with high stock" },
  { key: "deadStock", label: "Dead Stock", icon: Archive, tooltip: "No sales in selected period but has stock" },
];

export function ProductPerformanceFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-40 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-neutral-800 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ProductPerformanceSection({
  data,
  loading,
}: ProductPerformanceSectionProps) {
  const [tab, setTab] = useState<ProductTab>("topSelling");

  if (loading && !data) return <ProductPerformanceFallback />;

  if (!data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Product Performance
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Product performance data unavailable — backend endpoint needed.
          </p>
        </div>
      </div>
    );
  }

  const items = data[tab] ?? [];
  const activeTabDef = TABS.find((t) => t.key === tab)!;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Product Performance
          </h3>
          <InfoTooltip content={activeTabDef.tooltip}>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-neutral-700 overflow-x-auto bg-gray-50 dark:bg-neutral-800/50">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer relative ${
              tab === key
                ? "text-primary bg-white dark:bg-neutral-900"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span
              className={`ml-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${
                tab === key
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-200 dark:bg-neutral-700 text-gray-400"
              }`}
            >
              {(data[key] ?? []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">No products in this category</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty Sold</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {items.slice(0, 15).map((product, i) => (
                <tr
                  key={product.productId}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{i + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {product.name}
                    {product.category && (
                      <span className="ml-2 text-[11px] text-gray-400 dark:text-gray-500">{product.category}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {product.quantitySold.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatCurrency(product.profit)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {product.margin.toFixed(1)}%
                  </td>
                  <td className={`px-4 py-3 text-sm text-right tabular-nums ${
                    product.stock <= 0 ? "text-red-500 font-medium" : "text-gray-600 dark:text-gray-400"
                  }`}>
                    {product.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
