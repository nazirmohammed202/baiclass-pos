import React from "react";

const Loading = () => {
  return (
    <div className="p-4 h-full">
      <div className="h-full flex flex-col relative">
        {/* Tabs Header Skeleton */}
        <section className="flex items-end gap-1">
          <div className="flex items-center gap-2 px-5 py-4 rounded-t bg-white dark:bg-neutral-900">
            <div className="flex flex-col items-start gap-1">
              <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="p-2 rounded-lg">
            <div className="w-4 h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        </section>

        {/* Active Tab Content Skeleton */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <main className="bg-white dark:bg-neutral-900 rounded-lg sm:rounded-tr-lg sm:rounded-br-lg sm:rounded-bl-lg h-full flex flex-col overflow-hidden">
            {/* Header Skeleton */}
            <section className="p-2 sm:p-4 pb-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between shrink-0 gap-2 sm:gap-4">
              {/* Supplier Section */}
              <div className="w-full lg:w-1/4">
                <div className="h-10 bg-gray-100 dark:bg-neutral-800 rounded-md animate-pulse" />
              </div>

              {/* Product Search Section */}
              <div className="relative w-full lg:w-2/4">
                <div className="h-10 bg-gray-100 dark:bg-neutral-800 rounded-md animate-pulse" />
              </div>

              {/* Settings Section */}
              <div className="w-full lg:w-1/4 flex flex-row items-center justify-between lg:justify-end gap-2 sm:gap-3">
                <div className="h-8 w-24 bg-gray-100 dark:bg-neutral-800 rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-gray-100 dark:bg-neutral-800 rounded-md animate-pulse" />
              </div>
            </section>

            {/* Content Area Skeleton */}
            <section className="flex flex-col lg:flex-row flex-1 gap-2 sm:gap-4 min-h-0 px-2 sm:px-4 pb-2 sm:pb-4">
              {/* Items Area */}
              <article className="w-full lg:w-3/4 bg-background rounded-lg p-2 sm:p-4 overflow-y-auto flex-1 min-h-0 order-1">
                <div className="space-y-2">
                  {/* Item Skeletons */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 sm:p-3 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 gap-2 sm:gap-0"
                    >
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="h-3 w-32 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
                        <div className="h-4 w-48 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-1" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 lg:gap-6 shrink-0">
                        <div className="text-right">
                          <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-1 hidden sm:block" />
                          <div className="h-5 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-1" />
                          <div className="h-5 w-10 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                          <div className="w-10 h-6 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                          <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                        </div>
                        <div className="text-right">
                          <div className="h-3 w-12 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-1 hidden sm:block" />
                          <div className="h-5 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                        </div>
                        <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-md animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Summary Sidebar */}
              <aside className="w-full lg:w-1/4 bg-background rounded-lg p-3 sm:p-4 shrink-0 order-2 lg:sticky lg:top-0 lg:self-start">
                <div className="h-5 w-20 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-3 sm:mb-4" />
                <div className="space-y-2">
                  {/* Summary Items */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                      <div className="h-4 w-10 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                    </div>
                  ))}

                  {/* Discount Section */}
                  <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
                    <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 rounded-md animate-pulse" />
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <div className="h-5 w-12 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                      <div className="h-5 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <div className="h-11 w-full bg-emerald-200 dark:bg-emerald-900/30 rounded-md animate-pulse" />
                  </div>
                </div>
              </aside>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Loading;
