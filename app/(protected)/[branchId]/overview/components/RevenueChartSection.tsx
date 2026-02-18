"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDateToDisplayWithDay } from "@/lib/date-utils";
import { formatCurrency, num } from "@/lib/utils";

export type ChartDataPoint = {
  label: string;
  date: string;
  cash: number;
  credit: number;
};

type RevenueChartSectionProps = {
  chartData: ChartDataPoint[];
  totalSales: number;
  cashSales: number;
  creditSales: number;
  periodLabel: string;
};

export default function RevenueChartSection({
  chartData,
  totalSales,
  cashSales,
  creditSales,
  periodLabel,
}: RevenueChartSectionProps) {
  return (
    <div className="lg:w-1/2 flex flex-col justify-end">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Revenue
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {periodLabel}
        </p>
      </div>

      {chartData.length > 0 ? (
        <div className="h-44 sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
            >
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
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                      ? `${(v / 1_000).toFixed(1)}k`
                      : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
                formatter={(value: number | undefined, name?: string) => [
                  formatCurrency(num(value)),
                  name === "cash" ? "Cash" : "Credit",
                ]}
                labelFormatter={(label) => label
                }
              />
              <Legend
                formatter={(value) =>
                  value === "cash" ? "Cash" : "Credit"
                }
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="cash"
                stackId="sales"
                fill="#008080"
                radius={[10, 10, 10, 10]}
                maxBarSize={80}
              />
              <Bar
                dataKey="credit"
                stackId="sales"
                fill="#d97706"
                radius={[10, 10, 10, 10]}
                maxBarSize={80}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-60 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          No chart data available.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
        <div>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Revenue
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalSales)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Cash
          </p>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            {formatCurrency(cashSales)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Credit
          </p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(creditSales)}
          </p>
        </div>
      </div>
    </div>
  );
}
