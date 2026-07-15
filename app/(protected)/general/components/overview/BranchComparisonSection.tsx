"use client";

import Link from "next/link";
import { formatCurrency, pct } from "@/lib/utils";
import type { CompanyBranchPerformance } from "@/types";

type BranchComparisonSectionProps = {
  rows: CompanyBranchPerformance[] | null;
  periodLabel: string;
};

export default function BranchComparisonSection({
  rows,
  periodLabel,
}: BranchComparisonSectionProps) {
  const list = rows ? [...rows].sort((a, b) => b.revenue - a.revenue) : null;
  const totalRevenue = list?.reduce((s, r) => s + (r.revenue ?? 0), 0) ?? 0;

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Branch performance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          How each location contributed · {periodLabel}
        </p>
      </div>

      {!list ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Branch comparison will appear once{" "}
          <code className="text-xs font-mono">branch-performance</code> is live.
        </div>
      ) : list.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No branch sales in this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 dark:bg-neutral-800/40 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="text-left font-medium px-4 sm:px-5 py-3">Branch</th>
                <th className="text-right font-medium px-4 sm:px-5 py-3">Revenue</th>
                <th className="text-right font-medium px-4 sm:px-5 py-3 hidden sm:table-cell">
                  Share
                </th>
                <th className="text-right font-medium px-4 sm:px-5 py-3">Txns</th>
                <th className="text-right font-medium px-4 sm:px-5 py-3 hidden md:table-cell">
                  AOV
                </th>
                <th className="text-right font-medium px-4 sm:px-5 py-3"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {list.map((row) => {
                const share =
                  row.shareOfRevenue ?? pct(row.revenue, totalRevenue);
                return (
                  <tr
                    key={row.branchId}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800/40"
                  >
                    <td className="px-4 sm:px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {row.branchName}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {row.isWarehouse ? (
                          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
                            Warehouse
                          </span>
                        ) : null}
                        {row.suspended ? (
                          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                            Suspended
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 max-w-[180px] sm:hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, share)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-right hidden sm:table-cell">
                      <div className="inline-flex flex-col items-end gap-1 min-w-[72px]">
                        <span className="text-gray-600 dark:text-gray-300">
                          {share.toFixed(1)}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(100, share)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-right text-gray-700 dark:text-gray-300">
                      {row.transactions.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-right text-gray-700 dark:text-gray-300 hidden md:table-cell whitespace-nowrap">
                      {formatCurrency(row.averageOrderValue)}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-right">
                      <Link
                        href={`/${row.branchId}/menu`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
