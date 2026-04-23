"use client";

import { useState } from "react";
import { UserCheck, AlertTriangle, Info, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { StaffPerformanceItem } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";

type StaffPerformanceSectionProps = {
  data: StaffPerformanceItem[] | null;
  loading?: boolean;
};

type SortKey = "revenue" | "transactions" | "averageSale" | "itemsSold";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "transactions", label: "Transactions" },
  { key: "averageSale", label: "Avg. Sale" },
  { key: "itemsSold", label: "Items Sold" },
];

export function StaffPerformanceFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-40 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 dark:bg-neutral-800 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function StaffPerformanceSection({
  data,
  loading,
}: StaffPerformanceSectionProps) {
  const [sortBy, setSortBy] = useState<SortKey>("revenue");

  if (loading && (!data || data.length === 0)) return <StaffPerformanceFallback />;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Staff Performance
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Staff performance data unavailable — backend endpoint needed.
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Staff Performance
          </h3>
          <InfoTooltip content="Revenue, efficiency and flagged discount/refund behavior per employee">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
          )}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${sortBy === opt.key
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Seller</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transactions</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Sale</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items Sold</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discounts</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Refunds</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {sorted.map((staff) => {
              const highDiscount = staff.discountsGiven > staff.revenue * 0.1;
              const highRefund = staff.refundsProcessed > staff.transactions * 0.05;

              return (
                <tr
                  key={staff.staffId}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {staff.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatCurrency(staff.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {staff.transactions}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {formatCurrency(staff.averageSale)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {staff.itemsSold.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right tabular-nums ${highDiscount ? "text-amber-600 dark:text-amber-500 font-medium" : "text-gray-600 dark:text-gray-400"
                    }`}>
                    {formatCurrency(staff.discountsGiven)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right tabular-nums ${highRefund ? "text-red-600 dark:text-red-500 font-medium" : "text-gray-600 dark:text-gray-400"
                    }`}>
                    {formatCurrency(staff.refundsProcessed)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(highDiscount || highRefund) ? (
                      <InfoTooltip content={`${highDiscount ? "High discount rate" : ""}${highDiscount && highRefund ? " + " : ""}${highRefund ? "High refund rate" : ""}`}>
                        <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto cursor-help" />
                      </InfoTooltip>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
