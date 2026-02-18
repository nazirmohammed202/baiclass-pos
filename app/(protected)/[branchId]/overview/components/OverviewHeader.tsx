"use client";

export type Period = "today" | "7d" | "30d" | "month";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Week" },
  { value: "30d", label: "Month" },
  { value: "month", label: "This Month" },
];

type OverviewHeaderProps = {
  accountName: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
};

export default function OverviewHeader({
  accountName,
  period,
  onPeriodChange,
}: OverviewHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
        Hello, {accountName}
      </h1>
      <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 rounded-full p-1 border border-gray-200 dark:border-neutral-800">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPeriodChange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              period === opt.value
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function getPeriodLabel(period: Period): string {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "";
}
