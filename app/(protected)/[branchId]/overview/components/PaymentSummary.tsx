"use client";

import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PaymentsBreakdown } from "@/types";

const channelStyles = [
  { bar: "bg-emerald-500", dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", ring: "ring-emerald-500/20" },
  { bar: "bg-blue-500", dot: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", ring: "ring-blue-500/20" },
  { bar: "bg-purple-500", dot: "bg-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", ring: "ring-purple-500/20" },
  { bar: "bg-red-500", dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/30", ring: "ring-red-500/20" },
] as const;

type ChannelItem = {
  label: string;
  amount: number;
  icon: React.ReactNode;
  bar: string;
  dot: string;
  bg: string;
  ring: string;
};

type PaymentSummaryProps = {
  paymentsBreakdown: PaymentsBreakdown[];
  periodLabel?: string;
};

export default function PaymentSummary({ paymentsBreakdown, periodLabel }: PaymentSummaryProps) {
  const channels: ChannelItem[] = paymentsBreakdown.map((d, index) => {
    const style = channelStyles[index % channelStyles.length];
    return {
      label: d?.label ?? "",
      amount: d?.amount ?? 0,
      icon: <Wallet className="w-4 h-4" />,
      ...style,
    };
  });

  const total = channels.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg overflow-hidden">
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
                {periodLabel ? `How customers are paying — ${periodLabel}` : "How customers are paying"}
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

      <div className="px-5 pt-4 pb-3">
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {channels.map((ch) => {
            const pct = total > 0 ? (ch.amount / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={ch.label}
                className={`${ch.bar} transition-all duration-700 first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${pct}%` }}
                title={`${ch.label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {channels.map((ch) => {
            const pct = total > 0 ? (ch.amount / total) * 100 : 0;
            return (
              <div key={ch.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ch.dot} shrink-0`} />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {ch.label} <span className="font-medium text-gray-700 dark:text-gray-300">{pct.toFixed(0)}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

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
