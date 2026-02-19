"use client";

import {
  ShoppingCart,
  Package,
  UserPlus,
  RotateCcw,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Activity,
} from "lucide-react";
import type { ReactNode } from "react";

type ActivityType =
  | "sale"
  | "stock_adjust"
  | "new_customer"
  | "refund"
  | "payment_received"
  | "stock_in"
  | "failed";

type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  time: string;
  amount?: string;
};

type RecentActivityFeedProps = {
  activities: ActivityItem[];
};

const FAKE_ACTIVITIES: ActivityItem[] = [
  { id: "1", type: "sale", title: "Sale #2034", detail: "Alhaji Musa — 3 items", time: "2 min ago", amount: "₵ 450.00" },
  { id: "2", type: "stock_adjust", title: "Stock Adjusted", detail: "Dangote Cement 50kg — removed 5 units", time: "8 min ago" },
  { id: "3", type: "payment_received", title: "Payment Received", detail: "Mensah Enterprise — MoMo", time: "15 min ago", amount: "₵ 2,400.00" },
  { id: "4", type: "new_customer", title: "New Customer", detail: "Ibrahim Trading Co. added", time: "22 min ago" },
  { id: "5", type: "sale", title: "Sale #2033", detail: "Walk-in customer — 1 item", time: "31 min ago", amount: "₵ 180.00" },
  { id: "6", type: "refund", title: "Refund Processed", detail: "Sale #2028 — Roofing Sheet 0.55mm", time: "45 min ago", amount: "-₵ 320.00" },
  { id: "7", type: "stock_in", title: "Stock Received", detail: "Iron Rod 12mm — +200 units from supplier", time: "1 hr ago" },
  { id: "8", type: "failed", title: "Transaction Failed", detail: "MoMo timeout — Sale #2031", time: "1 hr ago", amount: "₵ 1,200.00" },
  { id: "9", type: "sale", title: "Sale #2032", detail: "Kofi Builders — 5 items", time: "2 hrs ago", amount: "₵ 3,750.00" },
  { id: "10", type: "payment_received", title: "Payment Received", detail: "Madam Grace — Cash", time: "2 hrs ago", amount: "₵ 800.00" },
];

const TYPE_CONFIG: Record<ActivityType, { icon: ReactNode; iconBg: string; iconColor: string }> = {
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

const AMOUNT_COLOR: Partial<Record<ActivityType, string>> = {
  sale: "text-emerald-600 dark:text-emerald-400",
  payment_received: "text-emerald-600 dark:text-emerald-400",
  refund: "text-red-500 dark:text-red-400",
  failed: "text-red-500 dark:text-red-400",
};

export default function RecentActivityFeed(props: Partial<RecentActivityFeedProps>) {
  const activities = props.activities ?? FAKE_ACTIVITIES;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col">
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
          activities.map((item, i) => {
            const config = TYPE_CONFIG[item.type];
            const amountColor = AMOUNT_COLOR[item.type] ?? "text-gray-900 dark:text-gray-100";

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/40 ${
                  i === 0 ? "bg-primary/2" : ""
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
    </div>
  );
}
