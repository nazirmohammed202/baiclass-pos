const LoadingSkeleton = () => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow p-8 w-full max-w-md">
        {/* Title skeleton */}
        <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-700 rounded mb-2 mx-auto animate-pulse" />

        {/* Greeting text skeleton */}
        <div className="mb-6 text-center space-y-2">
          <div className="h-5 w-32 bg-gray-200 dark:bg-neutral-700 rounded mx-auto animate-pulse" />
          <div className="h-5 w-40 bg-gray-200 dark:bg-neutral-700 rounded mx-auto animate-pulse" />
        </div>

        {/* Select dropdown skeleton */}
        <div className="mb-6">
          <div className="h-12 w-full bg-gray-200 dark:bg-neutral-700 rounded border border-gray-300 dark:border-neutral-800 animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="h-12 w-full bg-gray-200 dark:bg-neutral-700 rounded mt-2 animate-pulse" />
      </div>
    </section>
  );
};

export default LoadingSkeleton;
