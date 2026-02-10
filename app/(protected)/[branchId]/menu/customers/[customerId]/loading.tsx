import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
        <div className="h-7 w-48 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
        <div className="h-6 w-24 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full bg-gray-200 dark:bg-neutral-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
