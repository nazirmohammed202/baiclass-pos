"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, compactNumber } from "@/lib/utils";
import { formatDateShort } from "@/lib/date-utils";

export type TrendPoint = {
  date: string;
  total: number;
};

type SalesTrendChartProps = {
  data: TrendPoint[];
  periodLabel: string;
};

export default function SalesTrendChart({
  data,
  periodLabel,
}: SalesTrendChartProps) {
  if (data.length < 2) return null;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Sales Trend
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {periodLabel}
        </p>
      </div>

      <div className="h-40 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#008080" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#008080" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickFormatter={formatDateShort}
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
              formatter={(value: number | string | undefined) => [
                formatCurrency(Number(value) || 0),
                "Sales",
              ]}
              labelFormatter={formatDateShort}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#008080"
              strokeWidth={2}
              fill="url(#trendFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#008080" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
