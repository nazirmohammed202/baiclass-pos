"use client";

import { Users, UserPlus, UserCheck, ShoppingBag, Heart, Info, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CustomerAnalyticsData } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";

type CustomerAnalyticsSectionProps = {
  data: CustomerAnalyticsData | null;
  loading?: boolean;
};

export function CustomerAnalyticsFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-36 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
            <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="h-7 w-12 bg-gray-200 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerAnalyticsSection({
  data,
  loading,
}: CustomerAnalyticsSectionProps) {
  if (loading && !data) return <CustomerAnalyticsFallback />;

  if (!data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Customer Analytics
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customer analytics data unavailable — backend endpoint needed.
          </p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { icon: <UserPlus className="w-4 h-4" />, label: "NEW CUSTOMERS", value: data.newCustomers.toLocaleString(), tooltip: "First-time buyers in this period" },
    { icon: <UserCheck className="w-4 h-4" />, label: "RETURNING", value: data.returningCustomers.toLocaleString(), tooltip: "Customers who bought before this period" },
    { icon: <Heart className="w-4 h-4" />, label: "REPEAT RATE", value: `${data.repeatPurchaseRate.toFixed(1)}%`, tooltip: "Percentage of returning customers" },
    { icon: <ShoppingBag className="w-4 h-4" />, label: "AVG. BASKET", value: `${data.averageBasketSize.toFixed(1)} items`, tooltip: "Average items per transaction" },
  ];

  const topCustomers = data.topCustomers ?? [];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Customer Analytics
          </h3>
          <InfoTooltip content="Segmentation, retention and lifetime value">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        )}
      </div>

      {/* Summary cards */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100 dark:border-neutral-800">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-neutral-900 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {card.label}
              </p>
              <InfoTooltip content={card.tooltip}>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </InfoTooltip>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top customers table */}
      {topCustomers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transactions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CLV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {topCustomers.slice(0, 10).map((customer, i) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">#{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{customer.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatCurrency(customer.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {customer.transactions}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {formatCurrency(customer.clv)}
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
