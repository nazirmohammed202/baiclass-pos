"use client";

import { use, useState } from "react";
import { Trophy, ShoppingBag, Users, UserCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Performer } from "@/types";

export type TopPerformersData = {
  products: Performer[];
  customers: Performer[];
  employees: Performer[];
};

type TopPerformersProps = {
  topPerformers: Promise<TopPerformersData>;
};

const TABS = [
  { key: "products" as const, label: "Products", icon: ShoppingBag },
  { key: "customers" as const, label: "Customers", icon: Users },
  { key: "employees" as const, label: "Employees", icon: UserCheck },
] as const;

export function TopPerformersFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-neutral-700" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
      <div className="flex border-b border-gray-100 dark:border-neutral-800">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 py-3 flex items-center justify-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-neutral-700" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded" />
            <div className="w-[18px] h-[18px] rounded-full bg-gray-100 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-b border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="space-y-1">
            <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
            <div className="h-3 w-28 bg-gray-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded" />
      </div>
      <div className="px-5 divide-y divide-gray-50 dark:divide-neutral-800/50">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-neutral-700 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-28 bg-gray-200 dark:bg-neutral-700 rounded" />
                <div className="h-3 w-16 bg-gray-100 dark:bg-neutral-800 rounded" />
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MEDAL = ["bg-amber-400", "bg-gray-300 dark:bg-gray-500", "bg-amber-700"];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${MEDAL[rank - 1]}`}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-neutral-800 shrink-0">
      {rank}
    </span>
  );
}

function PerformerRow({
  performer,
  rank,
  maxValue,
}: {
  performer: Performer;
  rank: number;
  maxValue: number;
}) {
  const barPct = maxValue > 0 ? (performer.value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-2.5">
      <RankBadge rank={rank} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {performer.name}
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums shrink-0">
            {formatCurrency(performer.value)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${rank === 1
                ? "bg-primary"
                : rank === 2
                  ? "bg-primary/70"
                  : rank === 3
                    ? "bg-primary/50"
                    : "bg-primary/30"
                }`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          {performer.secondary && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
              {performer.secondary}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TopPerformers({ topPerformers }: TopPerformersProps) {
  const resolved = use(topPerformers);
  const data: TopPerformersData = {
    products: resolved.products ?? [],
    customers: resolved.customers ?? [],
    employees: resolved.employees ?? [],
  };
  const [activeTab, setActiveTab] = useState<keyof TopPerformersData>("products");

  const items = data[activeTab];
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  const topItem = items[0];
  const totalValue = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Top Performers
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                By revenue generated
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-neutral-800">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all cursor-pointer relative ${activeTab === key
              ? "text-primary"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className={`ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${activeTab === key
              ? "bg-primary/10 text-primary"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-gray-500"
              }`}>
              {data[key].length}
            </span>
            {activeTab === key && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Highlight strip */}
      {topItem && (
        <div className="px-5 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {topItem.name}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Leading with {formatCurrency(topItem.value)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total
            </p>
            <p className="text-sm font-bold text-primary tabular-nums">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>
      )}

      {/* Ranked list */}
      <div className="px-5 divide-y divide-gray-50 dark:divide-neutral-800/50">
        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No data available yet
          </div>
        ) : (
          items.slice(0, 5).map((performer, i) => (
            <PerformerRow
              key={performer.id}
              performer={performer}
              rank={i + 1}
              maxValue={maxValue}
            />
          ))
        )}
      </div>
    </div>
  );
}
