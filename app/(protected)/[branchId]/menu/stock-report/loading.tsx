export default function StockReportLoading() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-10 flex-1 max-w-[140px] bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 w-12 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 flex-1 max-w-[140px] bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    </div>
  );
}
