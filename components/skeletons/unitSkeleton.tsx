import React from "react";

const UnitSkeleton = () => {
  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* Wholesale price skeleton */}
      <div className="flex flex-col items-start gap-1">
        <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-300 dark:bg-neutral-700 rounded animate-pulse" />
      </div>

      {/* Retail price skeleton */}
      <div className="flex flex-col items-start gap-1">
        <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-300 dark:bg-neutral-700 rounded animate-pulse" />
      </div>
    </div>
  );
};

export default UnitSkeleton;
