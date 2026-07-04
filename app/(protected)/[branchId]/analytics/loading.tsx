import { KPICardsFallback } from "./components/KPICards";

const AnalyticsLoading = () => {
  const pulse = "bg-gray-200 dark:bg-neutral-700 animate-pulse rounded";

  return (
    <div className="space-y-4 p-2 sm:p-4 flex-1">
      {/* Header controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className={`h-8 w-36 ${pulse}`} />
        <div className="flex flex-wrap items-center gap-2">
          <div className={`h-10 w-32 ${pulse}`} />
          <div className={`h-10 w-28 ${pulse}`} />
          <div className={`h-10 w-24 ${pulse}`} />
        </div>
      </div>

      <KPICardsFallback />

      {/* Sales trend chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-4">
        <div className={`h-5 w-40 mb-4 ${pulse}`} />
        <div className={`h-64 w-full ${pulse}`} />
      </div>

      {/* Two-column sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-4"
          >
            <div className={`h-5 w-44 mb-4 ${pulse}`} />
            <div className={`h-48 w-full ${pulse}`} />
          </div>
        ))}
      </div>

      {/* Product performance */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-4">
        <div className={`h-5 w-52 mb-4 ${pulse}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-40 w-full ${pulse}`} />
          ))}
        </div>
      </div>

      {/* Staff performance */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-4">
        <div className={`h-5 w-44 mb-4 ${pulse}`} />
        <div className={`h-56 w-full ${pulse}`} />
      </div>

      {/* Bottom two-column */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-4"
          >
            <div className={`h-5 w-40 mb-4 ${pulse}`} />
            <div className={`h-44 w-full ${pulse}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsLoading;
