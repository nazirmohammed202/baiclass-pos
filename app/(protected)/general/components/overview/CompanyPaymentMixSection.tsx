"use client";

import { Banknote, CreditCard, Smartphone, Wallet, Clock } from "lucide-react";
import type { ReactNode } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency, pct } from "@/lib/utils";
import type { PaymentsBreakdown } from "@/types";

const COLORS = ["#008080", "#10b981", "#f59e0b", "#6366f1", "#14b8a6", "#3b82f6"];

const ICONS: Record<string, ReactNode> = {
  cash: <Banknote className="w-4 h-4" />,
  momo: <Smartphone className="w-4 h-4" />,
  card: <CreditCard className="w-4 h-4" />,
  credit: <Clock className="w-4 h-4" />,
};

type CompanyPaymentMixSectionProps = {
  methods: PaymentsBreakdown[] | null;
  periodLabel: string;
};

export default function CompanyPaymentMixSection({
  methods,
  periodLabel,
}: CompanyPaymentMixSectionProps) {
  const total = methods?.reduce((s, m) => s + (m.amount ?? 0), 0) ?? 0;
  const pieData =
    methods?.map((m) => ({ name: m.label, value: m.amount ?? 0 })) ?? [];

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden h-full">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Payment mix
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          All branches · {periodLabel}
        </p>
      </div>

      {!methods ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Payment mix awaits{" "}
          <code className="text-xs font-mono">payment-breakdown</code>.
        </div>
      ) : methods.length === 0 || total === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No payments in this period.
        </div>
      ) : (
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | undefined) =>
                    formatCurrency(value ?? 0)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 w-full space-y-2">
            {methods.map((m, i) => (
              <li
                key={m.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-gray-400">
                    {ICONS[m.label.toLowerCase()] ?? (
                      <Wallet className="w-4 h-4" />
                    )}
                  </span>
                  <span className="capitalize truncate">{m.label}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(m.amount)}
                  </span>
                  <span className="block text-xs text-gray-400">
                    {pct(m.amount, total).toFixed(1)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
