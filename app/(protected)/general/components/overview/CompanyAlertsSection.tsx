"use client";

import Link from "next/link";
import { AlertTriangle, Info, Siren } from "lucide-react";
import type { CompanyAlertItem } from "@/types";

type CompanyAlertsSectionProps = {
  alerts: CompanyAlertItem[] | null;
};

const SEVERITY = {
  critical: {
    icon: Siren,
    className:
      "bg-red-50 text-red-800 border-red-100 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-amber-50 text-amber-900 border-amber-100 dark:bg-amber-950/30 dark:text-amber-100 dark:border-amber-900",
  },
  info: {
    icon: Info,
    className:
      "bg-sky-50 text-sky-900 border-sky-100 dark:bg-sky-950/30 dark:text-sky-100 dark:border-sky-900",
  },
} as const;

export default function CompanyAlertsSection({
  alerts,
}: CompanyAlertsSectionProps) {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden h-full">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Company alerts
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Stock, credit, and ops signals across branches
        </p>
      </div>

      {!alerts ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Alerts await <code className="text-xs font-mono">analytics/alerts</code>.
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No open alerts. Looking good.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-neutral-800 max-h-80 overflow-y-auto">
          {alerts.map((alert) => {
            const meta = SEVERITY[alert.severity] ?? SEVERITY.info;
            const Icon = meta.icon;
            return (
              <li key={alert.id} className="px-4 sm:px-5 py-3">
                <div
                  className={`rounded-lg border px-3 py-2.5 ${meta.className}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs opacity-90 mt-0.5">{alert.detail}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] opacity-80">
                        {alert.branchName ? (
                          alert.branchId ? (
                            <Link
                              href={`/${alert.branchId}/menu`}
                              className="underline underline-offset-2 font-medium"
                            >
                              {alert.branchName}
                            </Link>
                          ) : (
                            <span>{alert.branchName}</span>
                          )
                        ) : null}
                        {alert.category ? (
                          <span className="uppercase tracking-wide">
                            {alert.category}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
