"use client";

import { Wallet, CreditCard, Smartphone, Banknote, Clock, Info, Loader2 } from "lucide-react";
import { formatCurrency, pct } from "@/lib/utils";
import type { PaymentsBreakdown } from "@/types";
import type { ReactNode } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import InfoTooltip from "@/components/ui/tooltip";

type PaymentBreakdownSectionProps = {
  data: PaymentsBreakdown[] | null;
  loading?: boolean;
  periodLabel: string;
};

const COLORS = ["#008080", "#10b981", "#f59e0b", "#6366f1", "#14b8a6", "#3b82f6"];

const METHOD_ICONS: Record<string, ReactNode> = {
  cash: <Banknote className="w-4 h-4" />,
  momo: <Smartphone className="w-4 h-4" />,
  card: <CreditCard className="w-4 h-4" />,
  credit: <Clock className="w-4 h-4" />,
};

function getIcon(label: string) {
  return METHOD_ICONS[label.toLowerCase()] ?? <Wallet className="w-4 h-4" />;
}

export function PaymentBreakdownFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-40 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5 flex gap-6">
        <div className="w-48 h-48 rounded-full bg-gray-100 dark:bg-neutral-800 mx-auto" />
        <div className="flex-1 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-neutral-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentBreakdownSection({
  data,
  loading,
  periodLabel,
}: PaymentBreakdownSectionProps) {
  if (loading && (!data || data.length === 0)) return <PaymentBreakdownFallback />;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payment Breakdown
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No payment data available.</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + (d.amount ?? 0), 0);
  const pieData = data.map((d) => ({ name: d.label, value: d.amount ?? 0 }));

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Payment Breakdown
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">— {periodLabel}</span>
          <InfoTooltip content="How customers are paying — Cash, MoMo, Card, Credit">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
          )}
          <div className="text-right">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col lg:flex-row gap-6">
        {/* Pie chart */}
        <div className="lg:w-1/3 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Method rows */}
        <div className="lg:w-2/3 space-y-3">
          {data.map((d, i) => {
            const p = pct(d.amount ?? 0, total);
            const icon = getIcon(d.label);
            const color = COLORS[i % COLORS.length];

            return (
              <div key={d.label} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {d.label}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                      {formatCurrency(d.amount ?? 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${p}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums w-12 text-right">
                      {p.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
