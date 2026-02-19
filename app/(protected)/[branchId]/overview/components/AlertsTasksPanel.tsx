"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CreditCard,
  Clock,
  PackageMinus,
  ShieldAlert,
  Unlink,
  ChevronRight,
  Bell,
} from "lucide-react";
import type { ReactNode } from "react";

type TaskAlert = {
  id: string;
  title: string;
  detail: string;
  amount?: string;
  time?: string;
};

type AlertsTasksPanelProps = {
  pendingCredits: TaskAlert[];
  overdueBalances: TaskAlert[];
  negativeStock: TaskAlert[];
  failedTransactions: TaskAlert[];
  noSupplier: TaskAlert[];
};

const FAKE: AlertsTasksPanelProps = {
  pendingCredits: [
    { id: "1", title: "Alhaji Musa", detail: "Invoice #1042 — 3 days ago", amount: "GHS 4,500.00" },
    { id: "2", title: "Madam Grace", detail: "Invoice #1038 — 5 days ago", amount: "GHS 2,180.00" },
    { id: "3", title: "Kofi Builders", detail: "Invoice #1035 — 7 days ago", amount: "GHS 8,320.00" },
  ],
  overdueBalances: [
    { id: "1", title: "Mensah Enterprise", detail: "Overdue 14 days", amount: "GHS 12,400.00" },
    { id: "2", title: "Ibrahim & Sons", detail: "Overdue 21 days", amount: "GHS 6,750.00" },
  ],
  negativeStock: [
    { id: "1", title: "Roofing Sheet 0.55mm", detail: "Current: -3 units", time: "Since Jan 28" },
    { id: "2", title: "4-inch Nails 1kg", detail: "Current: -12 units", time: "Since Jan 25" },
  ],
  failedTransactions: [
    { id: "1", title: "MoMo Payment #TXN-882", detail: "Timeout — GHS 1,200.00", time: "Today, 9:32 AM" },
  ],
  noSupplier: [
    { id: "1", title: "POP Cement 40kg", detail: "Added 12 days ago" },
    { id: "2", title: "Wood Glue 500ml", detail: "Added 18 days ago" },
    { id: "3", title: "Paint Roller 9-inch", detail: "Added 30 days ago" },
  ],
};

type CategoryConfig = {
  key: keyof AlertsTasksPanelProps;
  label: string;
  icon: ReactNode;
  severity: "critical" | "warning" | "info";
  href: string;
  emptyText: string;
};

function getCategoryConfig(branchId: string): CategoryConfig[] {
  return [
    {
      key: "overdueBalances",
      label: "Overdue Balances",
      icon: <Clock className="w-4 h-4" />,
      severity: "critical",
      href: `/${branchId}/menu/sales-history`,
      emptyText: "No overdue balances",
    },
    {
      key: "negativeStock",
      label: "Negative Stock",
      icon: <PackageMinus className="w-4 h-4" />,
      severity: "critical",
      href: `/${branchId}/menu/stock`,
      emptyText: "No negative stock",
    },
    {
      key: "failedTransactions",
      label: "Failed Transactions",
      icon: <ShieldAlert className="w-4 h-4" />,
      severity: "critical",
      href: `/${branchId}/menu/sales-history`,
      emptyText: "No failed transactions",
    },
    {
      key: "pendingCredits",
      label: "Pending Credit Payments",
      icon: <CreditCard className="w-4 h-4" />,
      severity: "warning",
      href: `/${branchId}/menu/sales-history`,
      emptyText: "No pending credits",
    },
    {
      key: "noSupplier",
      label: "No Supplier Assigned",
      icon: <Unlink className="w-4 h-4" />,
      severity: "info",
      href: `/${branchId}/menu/stock`,
      emptyText: "All products have suppliers",
    },
  ];
}

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900/50",
    icon: "text-red-500 dark:text-red-400",
    badge: "bg-red-500 text-white",
    dot: "bg-red-500",
    ring: "ring-red-500/20",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
    icon: "text-amber-500 dark:text-amber-400",
    badge: "bg-amber-500 text-white",
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900/50",
    icon: "text-blue-500 dark:text-blue-400",
    badge: "bg-blue-500 text-white",
    dot: "bg-blue-500",
    ring: "ring-blue-500/20",
  },
};

export default function AlertsTasksPanel(props: Partial<AlertsTasksPanelProps>) {
  const { branchId } = useParams<{ branchId: string }>();
  const data = { ...FAKE, ...props };
  const categories = getCategoryConfig(branchId);

  const criticalCount = categories
    .filter((c) => c.severity === "critical")
    .reduce((sum, c) => sum + data[c.key].length, 0);
  const warningCount = categories
    .filter((c) => c.severity === "warning")
    .reduce((sum, c) => sum + data[c.key].length, 0);
  const totalCount = categories.reduce((sum, c) => sum + data[c.key].length, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                <Bell className="w-4.5 h-4.5 text-red-500 dark:text-red-400" />
              </div>
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1 ring-2 ring-white dark:ring-neutral-900">
                  {totalCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Requires Your Attention
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {criticalCount > 0 && (
                  <span className="text-red-500 dark:text-red-400 font-medium">
                    {criticalCount} critical
                  </span>
                )}
                {criticalCount > 0 && warningCount > 0 && " · "}
                {warningCount > 0 && (
                  <span className="text-amber-500 dark:text-amber-400 font-medium">
                    {warningCount} warning{warningCount > 1 ? "s" : ""}
                  </span>
                )}
                {criticalCount === 0 && warningCount === 0 && "All clear — nothing to action"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {categories.map((cat) => {
          const items = data[cat.key];
          if (items.length === 0) return null;
          const styles = SEVERITY_STYLES[cat.severity];

          return (
            <div key={cat.key} className="px-5 py-4">
              {/* Category label */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md ${styles.bg} flex items-center justify-center ${styles.icon}`}>
                    {cat.icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                    {cat.label}
                  </p>
                  <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${styles.badge}`}>
                    {items.length}
                  </span>
                </div>
                <Link
                  href={cat.href}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Items */}
              <div className="space-y-1">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${styles.bg} border ${styles.border}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${styles.dot} shrink-0 ring-4 ${styles.ring}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {item.amount && (
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                          {item.amount}
                        </p>
                      )}
                      {item.time && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                          {item.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {items.length > 3 && (
                  <Link
                    href={cat.href}
                    className="block text-center text-[11px] font-medium text-primary hover:underline py-1.5"
                  >
                    +{items.length - 3} more
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
