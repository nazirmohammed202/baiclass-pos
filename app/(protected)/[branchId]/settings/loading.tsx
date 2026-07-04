const SettingsLoading = () => {
  const pulse = "bg-gray-200 dark:bg-neutral-700 animate-pulse rounded";

  return (
    <main className="p-4 sm:p-6 max-w-4xl mx-auto flex-1">
      {/* Header */}
      <div className="mb-6">
        <div className={`h-8 sm:h-9 w-40 ${pulse}`} />
        <div className={`h-4 w-64 mt-2 ${pulse}`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-neutral-800 mb-6 border border-gray-200 dark:border-neutral-700">
        <div className={`flex-1 sm:flex-initial h-11 w-full sm:w-40 ${pulse}`} />
        <div className={`flex-1 sm:flex-initial h-11 w-full sm:w-40 ${pulse}`} />
      </div>

      {/* Branch information section */}
      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden mb-6">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 space-y-2">
          <div className={`h-5 w-44 ${pulse}`} />
          <div className={`h-4 w-full max-w-md ${pulse}`} />
        </div>
        <div className="p-4 sm:p-6 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className={`h-4 w-28 mb-2 ${pulse}`} />
              <div className={`h-3 w-full max-w-sm mb-2 ${pulse}`} />
              <div className={`h-10 w-full ${pulse}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Currency & daily target section */}
      <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 space-y-2">
          <div className={`h-5 w-52 ${pulse}`} />
          <div className={`h-4 w-full max-w-lg ${pulse}`} />
        </div>
        <div className="p-4 sm:p-6 space-y-5">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className={`h-4 w-32 mb-2 ${pulse}`} />
              <div className={`h-3 w-full max-w-md mb-2 ${pulse}`} />
              <div className={`h-10 w-full ${pulse}`} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default SettingsLoading;
