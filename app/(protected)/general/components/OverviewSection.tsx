"use client";

import Link from "next/link";
import { MapPin, Warehouse } from "lucide-react";
import type { CompanyType } from "@/types";

type OverviewSectionProps = {
  company: CompanyType;
};

export default function OverviewSection({ company }: OverviewSectionProps) {
  const branches = company.branches ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Company-wide view across all branches. Open a branch to sell, stock, or
          change branch settings.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Branches" value={String(branches.length)} />
        <StatCard
          label="Team members"
          value={String(company.members?.length ?? 0)}
          hint="From company roster"
        />
        <StatCard label="Company" value={company.name} compact />
      </section>

      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Branches
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Jump into a branch to work the till and inventory.
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

      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
        <Warehouse className="w-4 h-4 mt-0.5 shrink-0" />
        Cross-branch analytics will live here once the company analytics endpoints
        are available. Team and branch roster are ready now.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  compact,
}: {
  label: string;
  value: string;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 font-semibold text-gray-900 dark:text-gray-100 ${
          compact ? "text-base truncate" : "text-2xl"
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
