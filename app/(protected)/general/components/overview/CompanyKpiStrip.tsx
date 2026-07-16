"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CompanyAnalyticsSummary } from "@/types";

type CompanyKpiStripProps = {
  summary: CompanyAnalyticsSummary | null;
  teamCount: number;
  periodLabel: string;
};

function changePct(current: number, previous?: number): number | null {
  if (previous === undefined || previous === null) return null;
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function Change({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default function CompanyKpiStrip({
  summary,
  teamCount,
  periodLabel,
}: CompanyKpiStripProps) {
  if (!summary) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {["Revenue", "Transactions", "Avg. sale", "Branches selling"].map(
          (label) => (
            <div
              key={label}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
              </p>
              <p className="mt-2 text-sm text-gray-400">Awaiting API</p>
              <p className="text-[11px] text-gray-400 mt-1">{periodLabel}</p>
            </div>
          )
        )}
      </section>
    );
  }

  const cards = [
    {
      label: "Gross revenue",
      value: formatCurrency(summary.grossRevenue),
      change: changePct(summary.grossRevenue, summary.previousGrossRevenue),
    },
    {
      label: "Transactions",
      value: summary.totalTransactions.toLocaleString(),
      change: changePct(
        summary.totalTransactions,
        summary.previousTotalTransactions
      ),
    },
    {
      label: "Avg. sale",
      value: formatCurrency(summary.averageOrderValue),
      change: null as number | null,
    },
    {
      label: "Branches selling",
      value: `${summary.branchesWithSales}/${summary.totalBranches}`,
      change: null as number | null,
      hint: `${teamCount} team member${teamCount === 1 ? "" : "s"}`,
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <Change value={card.change} />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {card.value}
          </p>
          {"hint" in card && card.hint ? (
            <p className="text-xs text-gray-400 mt-1">{card.hint}</p>
          ) : summary.totalProfit !== undefined &&
            card.label === "Gross revenue" ? (
            <p className="text-xs text-gray-400 mt-1">
              Profit {formatCurrency(summary.totalProfit)}
              {summary.profitMargin !== undefined
                ? ` · ${summary.profitMargin.toFixed(1)}%`
                : ""}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">{periodLabel}</p>
          )}
        </div>
      ))}
    </section>
  );
}
