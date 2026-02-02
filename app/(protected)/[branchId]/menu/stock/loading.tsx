const StockLoading = () => {
  return (
    <div className="p-4 h-full">
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        {/* Header: search + Add products */}
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0 flex gap-2">
            <div className="relative flex-1 min-w-0">
              <div className="w-full h-10 pl-10 pr-4 py-2 rounded-md bg-gray-200 dark:bg-neutral-700 animate-pulse" />
            </div>
            <div className="h-10 w-32 rounded-md bg-gray-200 dark:bg-neutral-700 animate-pulse shrink-0" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  Threshold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Base
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Wholesale
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Retail
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="animate-pulse">
                  {/* Product column skeleton */}
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
                          <div className="h-5 w-12 bg-gray-200 dark:bg-neutral-700 rounded" />
                        </div>
                        <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
                      </div>
                    </div>
                  </td>
                  {/* Stock */}
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 w-10 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" />
                  </td>
                  {/* Threshold */}
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 w-8 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" />
                  </td>
                  {/* Base */}
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" />
                  </td>
                  {/* Wholesale */}
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" />
                  </td>
                  {/* Retail */}
                  <td className="px-4 py-3 text-right">
                    <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded ml-auto" />
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-700 rounded mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockLoading;
