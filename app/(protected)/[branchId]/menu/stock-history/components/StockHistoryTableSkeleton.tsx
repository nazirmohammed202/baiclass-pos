"use client";

import React from "react";

const StockHistoryTableSkeleton = () => {
  // Skeleton row component for desktop
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 bg-gray-200 dark:bg-neutral-700 rounded"></div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded ml-auto"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-20 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md mx-auto"></div>
      </td>
    </tr>
  );

  // Skeleton card component for mobile
  const SkeletonCard = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded mb-2"></div>
          <div className="flex items-center gap-4">
            <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-700 rounded mb-1"></div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded"></div>
        </div>
        <div>
          <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-700 rounded mb-1"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-6 w-20 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Received By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default StockHistoryTableSkeleton;
