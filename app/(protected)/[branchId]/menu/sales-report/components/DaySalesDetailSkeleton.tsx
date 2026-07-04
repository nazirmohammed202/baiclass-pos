"use client";

import { ArrowLeft } from "lucide-react";

const pulse = "animate-pulse bg-gray-200 dark:bg-neutral-700 rounded";

const StatCardSkeleton = ({
  variant = "bar",
}: {
  variant?: "target" | "bar" | "large" | "simple";
}) => (
  <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`h-3 w-24 ${pulse}`} />
      <div className={`h-4 w-4 ${pulse}`} />
    </div>
    <div
      className={`${variant === "large" ? "h-14 w-20" : "h-9 w-32"} ${pulse} ${variant === "large" ? "mb-2" : variant === "simple" ? "" : "mb-3"}`}
    />
    {variant === "target" && (
      <div className="mt-2 flex gap-2 items-end">
        <div>
          <div className={`h-2.5 w-16 ${pulse} mb-1`} />
          <div className={`h-4 w-20 ${pulse}`} />
        </div>
        <div className="w-full flex flex-col items-end gap-1">
          <div className={`h-4 w-28 ${pulse}`} />
          <div className={`w-full h-4 ${pulse} rounded-full`} />
        </div>
      </div>
    )}
    {variant === "bar" && (
      <div className="mt-4 space-y-2">
        <div className={`h-4 w-40 ${pulse}`} />
        <div className={`w-full h-4 ${pulse} rounded-full`} />
      </div>
    )}
  </div>
);

const SidebarCardSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 border border-gray-200 dark:border-neutral-800">
    <div className="flex items-start justify-between mb-3">
      <div className={`h-3 w-20 ${pulse}`} />
      <div className={`h-4 w-4 ${pulse}`} />
    </div>
    <div className={`h-9 w-28 ${pulse}`} />
  </div>
);

const ChartCardSkeleton = ({ height = "h-[200px]" }: { height?: string }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
    <div className={`h-5 w-40 ${pulse} mb-2`} />
    <div className={`h-4 w-full max-w-xs ${pulse} mb-4`} />
    <div className={`w-full ${height} ${pulse} rounded-lg`} />
  </div>
);

const TableSectionSkeleton = ({
  titleWidth = "w-32",
  columns,
  rows = 5,
}: {
  titleWidth?: string;
  columns: number[];
  rows?: number;
}) => (
  <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
    <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        <div className={`h-5 w-5 ${pulse}`} />
        <div className={`h-5 ${titleWidth} ${pulse}`} />
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-4">
        {columns.map((width, i) => (
          <div
            key={i}
            className={`h-3 ${pulse}`}
            style={{ width: `${width}%`, flexShrink: 0 }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 items-center py-1">
          {columns.map((width, i) => (
            <div
              key={i}
              className={`h-4 ${pulse}`}
              style={{ width: `${width}%`, flexShrink: 0 }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const DaySalesDetailSkeleton = () => (
  <div className="space-y-4 p-2 animate-pulse">
    {/* Header */}
    <section className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-neutral-800">
      <button
        type="button"
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4 cursor-default"
        disabled
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Report</span>
      </button>
      <div className="flex items-center gap-2 justify-between">
        <div className={`h-8 sm:h-9 w-40 sm:w-48 ${pulse}`} />
        <div className={`h-8 sm:h-9 w-36 sm:w-48 ${pulse}`} />
      </div>
    </section>

    {/* Summary stats */}
    <section className="flex flex-col lg:flex-row gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:w-3/4">
        <StatCardSkeleton variant="target" />
        <StatCardSkeleton variant="bar" />
        <StatCardSkeleton variant="bar" />
        <StatCardSkeleton variant="bar" />
        <StatCardSkeleton variant="large" />
        <StatCardSkeleton variant="large" />
        <StatCardSkeleton variant="simple" />
      </div>
      <div className="flex flex-col gap-4 lg:w-1/4">
        <SidebarCardSkeleton />
        <SidebarCardSkeleton />
        <SidebarCardSkeleton />
      </div>
    </section>

    {/* Recent sales + growth chart */}
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className={`h-5 w-28 ${pulse}`} />
        </div>
        <div className="hidden md:block p-4 space-y-3">
          <div className="flex gap-4">
            {[15, 20, 10, 12, 10, 10].map((w, i) => (
              <div key={i} className={`h-3 ${pulse}`} style={{ width: `${w}%` }} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-2">
              {[15, 20, 10, 12, 10, 10].map((w, j) => (
                <div key={j} className={`h-4 ${pulse}`} style={{ width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <ChartCardSkeleton height="h-[200px]" />
    </section>

    {/* Pie charts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCardSkeleton />
      <ChartCardSkeleton height="h-[250px]" />
      <ChartCardSkeleton height="h-[250px]" />
    </div>

    {/* Hourly heatmap */}
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
      <div className={`h-5 w-28 ${pulse} mb-4`} />
      <div className={`h-3 w-48 ${pulse} mb-3`} />
      <div className="grid grid-cols-12 sm:grid-cols-24 gap-0.5 sm:gap-1">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square min-h-[28px] sm:min-h-[32px] ${pulse} rounded-sm`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-2.5 w-8 ${pulse}`} />
        ))}
      </div>
    </div>

    {/* Tables */}
    <TableSectionSkeleton
      titleWidth="w-32"
      columns={[8, 30, 12, 15, 15, 12]}
      rows={5}
    />
    <TableSectionSkeleton
      titleWidth="w-36"
      columns={[8, 25, 18, 14, 18, 12]}
      rows={5}
    />
    <TableSectionSkeleton
      titleWidth="w-36"
      columns={[18, 12, 10, 10, 12, 12, 12, 10, 12]}
      rows={3}
    />
  </div>
);

export default DaySalesDetailSkeleton;
