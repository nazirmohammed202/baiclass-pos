"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactNumber, formatCurrency, num } from "@/lib/utils";
import type { CompanySalesTrendPoint } from "@/types";

type CompanySalesTrendSectionProps = {
  points: CompanySalesTrendPoint[] | null;
  periodLabel: string;
};

export default function CompanySalesTrendSection({
  points,
  periodLabel,
}: CompanySalesTrendSectionProps) {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Company sales trend
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Combined revenue across all branches · {periodLabel}
        </p>
      </div>

      {!points ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 px-4 text-center">
          Trend chart awaits{" "}
          <code className="mx-1 text-xs font-mono">sales-trend</code> endpoint.
        </div>
      ) : points.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          No sales in this period.
        </div>
      ) : (
        <div className="p-4 sm:p-5 h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="companyRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008080" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#008080" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
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
                tickFormatter={compactNumber}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
                formatter={(value: number | undefined) => [
                  formatCurrency(num(value)),
                  "Revenue",
                ]}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#008080"
                strokeWidth={2}
                fill="url(#companyRevenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
