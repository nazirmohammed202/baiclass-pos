"use client";

export default function CustomersTableSkeleton() {
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 dark:bg-neutral-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" /></td>
      <td className="px-4 py-3 text-center"><div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md mx-auto" /></td>
    </tr>
  );
  const SkeletonCard = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded mb-1" />
          <div className="h-3 w-40 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded-md" />
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credit limit</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
      <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
