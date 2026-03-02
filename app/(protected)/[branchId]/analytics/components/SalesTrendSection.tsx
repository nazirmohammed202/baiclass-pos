"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Info, Loader2 } from "lucide-react";
import { formatCurrency, compactNumber } from "@/lib/utils";
import type { SalesTrendPoint } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";

type SalesTrendSectionProps = {
  data: SalesTrendPoint[] | null;
  compareEnabled: boolean;
  loading?: boolean;
  periodLabel: string;
  currentDatesLabel?: string;
  compareDatesLabel?: string;
};

type TrendMetric = "revenue" | "profit" | "transactions";

const METRIC_TABS: { key: TrendMetric; label: string; color: string }[] = [
  { key: "revenue", label: "Revenue", color: "#008080" },
  { key: "profit", label: "Profit", color: "#10b981" },
  { key: "transactions", label: "Transactions", color: "#6366f1" },
];

export function SalesTrendFallback() {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5">
        <div className="h-72 bg-gray-100 dark:bg-neutral-800 rounded" />
      </div>
    </section>
  );
}

export default function SalesTrendSection({
  data,
  compareEnabled,
  loading,
  periodLabel,
  currentDatesLabel,
  compareDatesLabel,
}: SalesTrendSectionProps) {
  const [metric, setMetric] = useState<TrendMetric>("revenue");

  if (loading && !data) return <SalesTrendFallback />;

  const currentTab = METRIC_TABS.find((t) => t.key === metric)!;
  const currentKey = metric;
  const prevKey = `previous${metric.charAt(0).toUpperCase() + metric.slice(1)}` as keyof SalesTrendPoint;
  const isCurrency = metric !== "transactions";
  const formatter = (v: number) => (isCurrency ? formatCurrency(v) : v.toLocaleString());

  if (!data || data.length === 0) {
    return (
      <section className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sales Trend
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sales trend data unavailable — backend endpoint needed.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sales Trend
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">— {periodLabel}</span>
          <InfoTooltip content="Dynamic aggregation: 1 day = hourly, 7-30 days = daily, 30+ days = weekly">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        )}

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5">
          {METRIC_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMetric(tab.key)}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${metric === tab.key
                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentTab.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={currentTab.color} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={isCurrency ? compactNumber : (v) => String(v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number | undefined, name?: string) => [
                  formatter(value ?? 0),
                  name === currentKey
                    ? (currentDatesLabel || "Current period")
                    : (compareDatesLabel || "Previous period"),
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === currentKey
                    ? (currentDatesLabel || "Current period")
                    : (compareDatesLabel || "Previous period")
                }
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {compareEnabled && (
                <Area
                  type="monotone"
                  dataKey={prevKey}
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  fill="url(#gradPrevious)"
                  dot={false}
                />
              )}
              <Area
                type="monotone"
                dataKey={currentKey}
                stroke={currentTab.color}
                strokeWidth={2.5}
                fill="url(#gradCurrent)"
                dot={false}
                activeDot={{ r: 5, fill: currentTab.color, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
