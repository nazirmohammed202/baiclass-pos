const SearchProductsSkeleton = () => {
  return (
    <div className="relative w-full">
      {/* Search icon skeleton */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-neutral-700 pointer-events-none z-10">
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>

      {/* Input skeleton */}
      <div className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-200 dark:bg-neutral-800 animate-pulse h-10" />
    </div>
  );
};

export default SearchProductsSkeleton;
