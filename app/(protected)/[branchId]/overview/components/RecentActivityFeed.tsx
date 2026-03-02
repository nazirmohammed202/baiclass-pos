"use client";

import { ActivityItem } from "@/types";
import {
  ShoppingCart,
  UserPlus,
  RotateCcw,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { use, useState, useMemo, type ReactNode } from "react";

const PAGE_SIZE = 10;

export type RecentActivityFeedData = {
  activities: {
    items: ActivityItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
};

type RecentActivityFeedProps = {
  recentActivity: Promise<RecentActivityFeedData>;
};

const TYPE_CONFIG: Record<ActivityItem["type"], { icon: ReactNode; iconBg: string; iconColor: string }> = {
  sale: {
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  stock_adjust: {
    icon: <ArrowDownRight className="w-3.5 h-3.5" />,
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
  },
  new_customer: {
    icon: <UserPlus className="w-3.5 h-3.5" />,
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
  },
  refund: {
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    iconBg: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-500",
  },
  payment_received: {
    icon: <CreditCard className="w-3.5 h-3.5" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
  },
  stock_in: {
    icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
  },
  failed: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    iconBg: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-500",
  },
};

const AMOUNT_COLOR: Partial<Record<ActivityItem["type"], string>> = {
  sale: "text-emerald-600 dark:text-emerald-400",
  payment_received: "text-emerald-600 dark:text-emerald-400",
  refund: "text-red-500 dark:text-red-400",
  failed: "text-red-500 dark:text-red-400",
};

export function RecentActivityFeedFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-neutral-700" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 w-24 bg-gray-100 dark:bg-neutral-800 rounded" />
            </div>
          </div>
          <div className="w-12 h-5 rounded-full bg-gray-100 dark:bg-neutral-800" />
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-neutral-800/50 max-h-[420px] overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-neutral-700 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 w-40 bg-gray-100 dark:bg-neutral-800 rounded" />
            </div>
            <div className="space-y-2 text-right shrink-0">
              <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 w-12 bg-gray-100 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeActivities(data: RecentActivityFeedData | null | undefined): ActivityItem[] {
  if (!data) return [];
  const d = data as unknown;
  // New shape: { activities: { items: ActivityItem[], pagination } }
  const items = (d as { activities?: { items?: ActivityItem[] } }).activities?.items;
  if (Array.isArray(items)) return items;
  // Legacy: { activities: ActivityItem[] }
  const list = (d as { activities?: ActivityItem[] }).activities;
  if (Array.isArray(list)) return list;
  // Alternative: { items: ActivityItem[] } or { data: { items: ActivityItem[] } }
  const direct = (d as { items?: ActivityItem[] }).items;
  if (Array.isArray(direct)) return direct;
  const nested = (d as { data?: { items?: ActivityItem[] } }).data?.items;
  return Array.isArray(nested) ? nested : [];
}

export default function RecentActivityFeed({ recentActivity }: RecentActivityFeedProps) {
  const data = use(recentActivity);
  const activities = useMemo(() => normalizeActivities(data), [data]);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageActivities = useMemo(
    () =>
      activities.slice(
        currentPage * PAGE_SIZE,
        currentPage * PAGE_SIZE + PAGE_SIZE
      ),
    [activities, currentPage]
  );

  const startItem = currentPage * PAGE_SIZE + 1;
  const endItem = Math.min((currentPage + 1) * PAGE_SIZE, activities.length);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col mb-2">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Live system feed
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-gray-50 dark:divide-neutral-800/50">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
            No recent activity
          </div>
        ) : (
          pageActivities.map((item, i) => {
            const config =
              TYPE_CONFIG[item.type] ?? {
                icon: <Activity className="w-3.5 h-3.5" />,
                iconBg: "bg-gray-100 dark:bg-neutral-800",
                iconColor: "text-gray-500 dark:text-gray-400",
              };
            const amountColor = AMOUNT_COLOR[item.type] ?? "text-gray-900 dark:text-gray-100";

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/40 ${i === 0 ? "bg-primary/2" : ""
                  }`}
              >
                {/* Timeline */}
                <div className="flex flex-col items-center pt-0.5">
                  <div className={`w-8 h-8 rounded-lg ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0`}>
                    {config.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.detail}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {item.amount && (
                        <p className={`text-sm font-bold tabular-nums ${amountColor}`}>
                          {item.amount}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {activities.length > PAGE_SIZE && (
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {startItem}–{endItem} of {activities.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-16 text-center">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
