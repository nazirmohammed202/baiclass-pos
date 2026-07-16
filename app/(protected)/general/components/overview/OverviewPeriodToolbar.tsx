"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getTodayDate } from "@/lib/date-utils";
import type { AnalyticsPeriod } from "@/types";

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "last7", label: "7 days" },
  { id: "last30", label: "30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "custom", label: "Custom" },
];

type OverviewPeriodToolbarProps = {
  periodLabel: string;
};

export default function OverviewPeriodToolbar({
  periodLabel,
}: OverviewPeriodToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = getTodayDate();
  const current = (searchParams.get("period") as AnalyticsPeriod) || "last7";
  const customStart = searchParams.get("start") || today;
  const customEnd = searchParams.get("end") || today;

  const pushParams = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("tab");
    mutate(next);
    const qs = next.toString();
    router.push(qs ? `/general?${qs}` : "/general");
  };

  const setPeriod = (period: AnalyticsPeriod) => {
    pushParams((next) => {
      if (period === "last7") {
        next.delete("period");
      } else {
        next.set("period", period);
      }

      if (period === "custom") {
        if (!next.get("start")) next.set("start", customStart || today);
        if (!next.get("end")) next.set("end", customEnd || today);
      } else {
        next.delete("start");
        next.delete("end");
      }
    });
  };

  const setCustomDate = (key: "start" | "end", value: string) => {
    if (!value) return;
    pushParams((next) => {
      next.set("period", "custom");
      next.set(key, value);
      if (!next.get(key === "start" ? "end" : "start")) {
        next.set(key === "start" ? "end" : "start", value);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {periodLabel}
          </span>
        </p>
        <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                current === p.id
                  ? "bg-white dark:bg-neutral-700 text-primary shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {current === "custom" ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
          <label className="text-gray-500 dark:text-gray-400 font-medium">
            From
            <input
              type="date"
              value={customStart}
              max={customEnd || undefined}
              onChange={(e) => setCustomDate("start", e.target.value)}
              className="ml-2 px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <span className="text-gray-400 font-medium">to</span>
          <label className="text-gray-500 dark:text-gray-400 font-medium">
            <span className="sr-only">To</span>
            <input
              type="date"
              value={customEnd}
              min={customStart || undefined}
              onChange={(e) => setCustomDate("end", e.target.value)}
              className="px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
