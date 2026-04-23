"use client";

import {
  ShieldAlert,
  TrendingDown,
  Tag,
  Percent,
  RotateCcw,
  PackageX,
  Clock,
  Loader2,
} from "lucide-react";
import type { AlertRisk, AnalyticsAlertsData } from "@/types";
import type { ReactNode } from "react";

type AlertsRiskSectionProps = {
  data: AnalyticsAlertsData | null;
  loading?: boolean;
};

const TYPE_ICONS: Record<AlertRisk["type"], ReactNode> = {
  revenue_drop: <TrendingDown className="w-4 h-4" />,
  high_discount: <Tag className="w-4 h-4" />,
  low_margin: <Percent className="w-4 h-4" />,
  high_refund: <RotateCcw className="w-4 h-4" />,
  stock_critical: <PackageX className="w-4 h-4" />,
  credit_overdue: <Clock className="w-4 h-4" />,
};

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900/50",
    icon: "text-red-500 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
    icon: "text-amber-500 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900/50",
    icon: "text-blue-500 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
};

export function AlertsRiskFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-48 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="space-y-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-4 flex items-start gap-3 border-b border-gray-100 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AlertsRiskSection({
  data,
  loading,
}: AlertsRiskSectionProps) {
  if (loading && !data) return <AlertsRiskFallback />;

  const alerts = data?.alerts ?? [];
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Alerts & Risk Indicators
            </h3>
            {alerts.length > 0 && (
              <span className="min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white px-1.5">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
            )}
          {alerts.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {criticalCount > 0 && (
                <span className="text-red-500 font-medium">{criticalCount} critical</span>
              )}
              {criticalCount > 0 && warningCount > 0 && " · "}
              {warningCount > 0 && (
                <span className="text-amber-500 font-medium">{warningCount} warning{warningCount > 1 ? "s" : ""}</span>
              )}
            </p>
          )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length === 0 ? (
        <div className="p-8 text-center">
          <ShieldAlert className="w-8 h-8 text-emerald-300 dark:text-emerald-800 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">All clear</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data ? "No active alerts. Business metrics look healthy." : "Alerts data unavailable — backend endpoint needed."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {alerts.map((alert) => {
            const styles = SEVERITY_STYLES[alert.severity];
            const icon = TYPE_ICONS[alert.type] ?? <ShieldAlert className="w-4 h-4" />;

            return (
              <div
                key={alert.id}
                className={`px-5 py-4 flex items-start gap-3 ${styles.bg} border-l-4 ${styles.border}`}
              >
                <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {alert.detail}
                  </p>
                </div>
                {alert.metric && (
                  <span className={`text-xs font-bold tabular-nums shrink-0 px-2.5 py-1 rounded-full ${styles.badge}`}>
                    {alert.metric}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
