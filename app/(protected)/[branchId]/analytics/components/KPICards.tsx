"use client";

import {
  TrendingUp,
  TrendingDown,
  Info,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsKPIs, KPICard } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";

type KPICardsProps = {
  data: AnalyticsKPIs | null;
  loading?: boolean;
  comparePeriodLabel?: string;
};

type CardDef = {
  key: keyof AnalyticsKPIs;
  tooltip: string;
  highlight?: "green" | "amber" | "red";
  showBar?: { ofKey?: keyof AnalyticsKPIs; color: string };
};

const PRIMARY_CARDS: CardDef[] = [
  { key: "grossRevenue", tooltip: "Sum of all completed sales in this period" },
  { key: "netRevenue", tooltip: "Gross revenue minus discounts and refunds" },
  {
    key: "totalTransactions",
    tooltip: "Total number of completed sales transactions",
  },
  {
    key: "averageOrderValue",
    tooltip: "Average revenue per transaction",
  },
  {
    key: "totalProfit",
    tooltip: "Total profit (selling price - cost price) x quantity sold",
    highlight: "green",
  },
  {
    key: "profitMargin",
    tooltip: "Profit as a percentage of gross revenue",
    highlight: "green",
  },
];

const SECONDARY_CARDS: CardDef[] = [
  {
    key: "totalItemsSold",
    tooltip: "Total quantity of products sold",
  },
  {
    key: "totalDiscounts",
    tooltip: "Total discounts given across all sales",
    highlight: "red",
  },
  {
    key: "discountRate",
    tooltip: "Discounts as a percentage of gross revenue",
    highlight: "red",
  },
  {
    key: "totalRefunds",
    tooltip: "Total value of reversed/refunded sales",
    highlight: "red",
  },
  {
    key: "refundRate",
    tooltip: "Refunds as a percentage of gross revenue",
    highlight: "red",
  },
  {
    key: "taxCollected",
    tooltip: "Total tax collected (if applicable)",
  },
];

function formatKPIValue(card: KPICard): string {
  switch (card.format) {
    case "currency":
      return formatCurrency(card.value);
    case "percent":
      return `${card.value.toFixed(1)}%`;
    case "number":
      return card.value.toLocaleString();
    default:
      return String(card.value);
  }
}

function ChangeIndicator({ changePercent }: { changePercent?: number }) {
  if (changePercent === undefined || changePercent === null) return null;

  const isPositive = changePercent >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive
          ? "text-green-600 dark:text-green-500"
          : "text-red-600 dark:text-red-500"
        }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {isPositive ? "+" : ""}
      {changePercent.toFixed(1)}%
    </span>
  );
}

function KPICardItem({ card, tooltip, comparePeriodLabel }: { card: KPICard; tooltip: string; comparePeriodLabel?: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {card.label}
        </p>
        <InfoTooltip content={tooltip}>
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
        </InfoTooltip>
      </div>
      <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
        {formatKPIValue(card)}
      </p>
      {card.changePercent !== undefined && card.changePercent !== null && (
        <div className="mt-2 flex items-center gap-2">
          <ChangeIndicator changePercent={card.changePercent} />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {comparePeriodLabel ? `vs ${comparePeriodLabel}` : "vs previous period"}
          </span>
        </div>
      )}
    </div>
  );
}

export function KPICardsFallback() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-lg p-5 animate-pulse"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-700 rounded" />
            </div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-lg p-5 animate-pulse"
          >
            <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="h-6 w-20 bg-gray-200 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function KPICards({ data, loading, comparePeriodLabel }: KPICardsProps) {
  if (loading && !data) return <KPICardsFallback />;

  if (!data) {
    return (
      <section className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          KPI data unavailable — backend endpoint needed.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {loading && (
        <div className="flex justify-end">
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        </div>
      )}
      {/* Primary KPIs — large cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRIMARY_CARDS.map((cfg) => {
          const card = data[cfg.key];
          if (!card) return null;
          return <KPICardItem key={cfg.key} card={card} tooltip={cfg.tooltip} comparePeriodLabel={comparePeriodLabel} />;
        })}
      </div>

      {/* Secondary KPIs — compact row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SECONDARY_CARDS.map((cfg) => {
          const card = data[cfg.key];
          if (!card) return null;

          return (
            <div
              key={cfg.key}
              className="bg-white dark:bg-neutral-900 rounded-lg p-4"
            >
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {card.label}
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {formatKPIValue(card)}
              </p>
              {card.changePercent !== undefined && (
                <div className="mt-1">
                  <ChangeIndicator changePercent={card.changePercent} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
