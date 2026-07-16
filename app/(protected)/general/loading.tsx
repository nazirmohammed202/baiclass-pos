export default function GeneralLoading() {
  return (
    <main className="p-6 max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="h-10 w-56 bg-gray-200 dark:bg-neutral-800 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
      </div>
      <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
    </main>
  );
}
