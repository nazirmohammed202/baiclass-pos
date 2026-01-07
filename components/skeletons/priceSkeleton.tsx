import React from "react";

const PriceSkeleton = () => {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
      <div className="h-4 w-20 bg-gray-300 dark:bg-neutral-700 rounded animate-pulse" />
    </div>
  );
};

export default PriceSkeleton;

