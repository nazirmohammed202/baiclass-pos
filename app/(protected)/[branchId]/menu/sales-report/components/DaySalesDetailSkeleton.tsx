"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

const StatCardSkeleton = ({ withProgress = true }: { withProgress?: boolean }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
      <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-700 rounded" />
    </div>
    <div className="h-9 w-32 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
    {withProgress && (
      <div className="mt-2 flex gap-2 items-end">
        <div>
          <div className="h-2.5 w-16 bg-gray-200 dark:bg-neutral-700 rounded mb-1" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
        <div className="w-full flex flex-col items-end gap-1">
          <div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 rounded" />
          <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden" />
        </div>
      </div>
    )}
  </div>
);

const SimpleStatCardSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-3 w-28 bg-gray-200 dark:bg-neutral-700 rounded" />
      <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-700 rounded" />
    </div>
    <div className="h-9 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
  </div>
);

const SidebarCardSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-lg p-5 border border-gray-200 dark:border-neutral-800 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded" />
      <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-700 rounded" />
    </div>
    <div className="h-9 w-28 bg-gray-200 dark:bg-neutral-700 rounded" />
  </div>
);

const DaySalesDetailSkeleton = () => (
  <div className="space-y-4 p-2">
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
      <div className="flex gap-2 justify-between">
        <div className="h-8 w-40 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    </section>

    {/* Summary Stats Cards */}
    <section className="flex gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-3/4">
        <StatCardSkeleton withProgress />
        <StatCardSkeleton withProgress />
        <StatCardSkeleton withProgress />
        <StatCardSkeleton withProgress />
        <SimpleStatCardSkeleton />
        <SimpleStatCardSkeleton />
      </div>
      <div className="flex flex-col gap-4 w-1/4">
        <SidebarCardSkeleton />
        <SidebarCardSkeleton />
        <SidebarCardSkeleton />
      </div>
    </section>
  </div>
);

export default DaySalesDetailSkeleton;
