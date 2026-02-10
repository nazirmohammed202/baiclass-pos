import React from "react";

export default function Loading() {
  return (
    <div>
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="h-8 w-40 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
        <div className="mt-4 max-w-md">
          <div className="h-10 w-full bg-gray-200 dark:bg-neutral-700 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Address</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 dark:bg-neutral-700 rounded" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
