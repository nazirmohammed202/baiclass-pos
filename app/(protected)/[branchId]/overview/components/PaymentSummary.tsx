"use client";

import { Wallet, Smartphone, Building2, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ReactNode } from "react";

type PaymentChannel = {
  label: string;
  amount: number;
  icon: ReactNode;
  color: string;
  bg: string;
  ring: string;
};

type PaymentSummaryProps = {
  cash: number;
  momo: number;
  bank: number;
  card: number;
};

const FAKE: PaymentSummaryProps = {
  cash: 184500,
  momo: 126800,
  bank: 42300,
  card: 18400,
};

function buildChannels(d: PaymentSummaryProps): PaymentChannel[] {
  return [
    {
      label: "Cash",
      amount: d.cash,
      icon: <Wallet className="w-4 h-4" />,
      color: "bg-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
    },
    {
      label: "Mobile Money",
      amount: d.momo,
      icon: <Smartphone className="w-4 h-4" />,
      color: "bg-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
      ring: "ring-yellow-400/20",
    },
    {
      label: "Bank Transfer",
      amount: d.bank,
      icon: <Building2 className="w-4 h-4" />,
      color: "bg-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500/20",
    },
    {
      label: "Card",
      amount: d.card,
      icon: <CreditCard className="w-4 h-4" />,
      color: "bg-violet-500",
      bg: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
      ring: "ring-violet-500/20",
    },
  ];
}

export default function PaymentSummary(props: Partial<PaymentSummaryProps>) {
  const data = { ...FAKE, ...props };
  const channels = buildChannels(data);
  const total = channels.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Payment Breakdown
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                How customers are paying
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {channels.map((ch) => {
            const pct = total > 0 ? (ch.amount / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={ch.label}
                className={`${ch.color} transition-all duration-700 first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${pct}%` }}
                title={`${ch.label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>
        {/* Legend inline */}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {channels.map((ch) => {
            const pct = total > 0 ? (ch.amount / total) * 100 : 0;
            return (
              <div key={ch.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ch.color} shrink-0`} />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {ch.label} <span className="font-medium text-gray-700 dark:text-gray-300">{pct.toFixed(0)}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-800">
        {channels.map((ch) => {
          const pct = total > 0 ? (ch.amount / total) * 100 : 0;
          return (
            <div
              key={ch.label}
              className="bg-white dark:bg-neutral-900 p-4 flex flex-col items-center text-center"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${ch.bg} ring-4 ${ch.ring}`}>
                {ch.icon}
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                {ch.label}
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {formatCurrency(ch.amount)}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums mt-0.5">
                {pct.toFixed(1)}% of total
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
