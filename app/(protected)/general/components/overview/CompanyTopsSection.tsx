"use client";

import { formatCurrency } from "@/lib/utils";
import type { CompanyTopItem } from "@/types";

type CompanyTopsSectionProps = {
  products: CompanyTopItem[] | null;
  employees: CompanyTopItem[] | null;
  periodLabel: string;
};

function TopList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: CompanyTopItem[] | null;
  emptyLabel: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>
      {!items ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No data yet.</p>
      ) : (
        <ol className="space-y-2">
          {items.slice(0, 5).map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-3 text-sm"
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </p>
                {item.subtitle ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {item.valueLabel?.toLowerCase().includes("₵") ||
                  item.valueLabel?.includes("GHS")
                    ? item.valueLabel
                    : formatCurrency(item.value)}
                </p>
                {item.valueLabel &&
                !item.valueLabel.toLowerCase().includes("₵") ? (
                  <p className="text-xs text-gray-400">{item.valueLabel}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function CompanyTopsSection({
  products,
  employees,
  periodLabel,
}: CompanyTopsSectionProps) {
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Top across company
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Products and staff · {periodLabel}
        </p>
      </div>
      <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-8">
        <TopList
          title="Products"
          items={products}
          emptyLabel="Awaiting tops API."
        />
        <div className="hidden md:block w-px bg-gray-100 dark:bg-neutral-800" />
        <TopList
          title="Team"
          items={employees}
          emptyLabel="Awaiting tops API."
        />
      </div>
    </section>
  );
}
