const NewSaleLoading = () => {
  return (
    <div className="p-4 h-full">
      <div className="h-full flex flex-col relative">
        {/* Tabs bar */}
        <section className="flex items-end gap-1 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2 px-5 py-4 rounded-t bg-white dark:bg-neutral-900 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
          </div>
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 shrink-0">
            <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-600 rounded" />
          </div>
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 shrink-0">
            <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-600 rounded" />
          </div>
        </section>

        {/* Tab content card */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <main className="bg-white dark:bg-neutral-900 rounded-lg sm:rounded-tr-lg sm:rounded-br-lg sm:rounded-bl-lg h-full flex flex-col overflow-hidden">
            {/* Header: customer + product search + switches */}
            <section className="p-2 sm:p-4 pb-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 sm:gap-4 shrink-0">
              <div className="w-full lg:w-1/4">
                <div className="w-full h-10 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
              </div>
              <div className="w-full lg:w-2/4">
                <div className="w-full h-10 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="h-9 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-9 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-9 w-9 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            </section>

            {/* Body: cart list + Total sidebar */}
            <section className="flex flex-col lg:flex-row flex-1 gap-2 sm:gap-4 min-h-0 px-2 sm:px-4 pb-2 sm:pb-4">
              <article className="w-full lg:w-3/4 bg-background rounded-lg p-2 sm:p-4 flex-1 min-h-0 overflow-hidden">
                <div className="space-y-2">
                  <div className="h-18 w-full bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                  <div className="h-18 w-full bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                  <div className="h-18 w-[90%] bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                </div>
              </article>

              <aside className="w-full lg:w-1/4 bg-background rounded-lg p-3 sm:p-4 shrink-0 lg:sticky lg:top-0 lg:self-start">
                <div className="h-5 w-14 bg-gray-200 dark:bg-neutral-700 rounded mb-3 sm:mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-4 w-6 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between gap-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-4 w-6 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
                  <div className="flex justify-between gap-2">
                    <div className="h-4 w-12 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <div className="w-full h-11 rounded-md bg-gray-200 dark:bg-neutral-700 animate-pulse" />
                </div>
              </aside>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NewSaleLoading;
