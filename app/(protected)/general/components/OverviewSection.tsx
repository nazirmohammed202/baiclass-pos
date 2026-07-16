"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type {
  CompanyAnalyticsBundle,
  CompanyType,
} from "@/types";
import OverviewPeriodToolbar from "./overview/OverviewPeriodToolbar";
import CompanyKpiStrip from "./overview/CompanyKpiStrip";
import BranchComparisonSection from "./overview/BranchComparisonSection";
import CompanySalesTrendSection from "./overview/CompanySalesTrendSection";
import CompanyPaymentMixSection from "./overview/CompanyPaymentMixSection";
import CompanyAlertsSection from "./overview/CompanyAlertsSection";
import CompanyTopsSection from "./overview/CompanyTopsSection";

type OverviewSectionProps = {
  company: CompanyType;
  periodLabel: string;
  analytics: CompanyAnalyticsBundle;
};

export default function OverviewSection({
  company,
  periodLabel,
  analytics,
}: OverviewSectionProps) {
  const branches = company.branches ?? [];
  const teamCount = company.members?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Company-wide performance across all branches. Open a branch for
            day-to-day ops.
          </p>
        </div>
        <OverviewPeriodToolbar periodLabel={periodLabel} />
      </div>

      {!analytics.anyLoaded ? (
        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs sm:text-sm text-amber-900 dark:text-amber-100">
          Analytics endpoints are not live yet — cards below show the layout.
          See <code className="font-mono text-[11px]">docs/backend.md</code> for
          routes to implement.
        </div>
      ) : null}

      <CompanyKpiStrip
        summary={analytics.summary}
        teamCount={teamCount}
        periodLabel={periodLabel}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <CompanySalesTrendSection
            points={analytics.salesTrend}
            periodLabel={periodLabel}
          />
        </div>
        <div className="xl:col-span-2">
          <CompanyPaymentMixSection
            methods={analytics.paymentBreakdown}
            periodLabel={periodLabel}
          />
        </div>
      </div>

      <BranchComparisonSection
        rows={analytics.branchPerformance}
        periodLabel={periodLabel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CompanyAlertsSection alerts={analytics.alerts} />
        <CompanyTopsSection
          products={analytics.tops?.products ?? null}
          employees={analytics.tops?.employees ?? null}
          periodLabel={periodLabel}
        />
      </div>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Branches
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Jump into a location to sell, stock, or change branch settings.
            </p>
          </div>
          <Link
            href="/select-branch"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            Select branch
          </Link>
        </div>

        {branches.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No branches yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
            {branches.map((branch) => (
              <li key={branch._id}>
                <Link
                  href={`/${branch._id}/menu`}
                  className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {branch.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {branch.address || "No address"}
                    </p>
                  </div>
                  <span className="text-sm text-primary font-medium shrink-0">
                    Open
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
