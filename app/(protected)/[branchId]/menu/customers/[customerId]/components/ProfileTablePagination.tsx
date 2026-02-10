"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type PaginationType = { total: number; page: number; limit: number; pages: number };

type ProfileTablePaginationProps = {
  pagination: PaginationType;
  currentItemsCount: number;
  loading: boolean;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export default function ProfileTablePagination({
  pagination,
  currentItemsCount,
  loading,
  limit,
  onPageChange,
  onLimitChange,
}: ProfileTablePaginationProps) {
  const getPageNumbers = (): (number | string)[] => {
    const totalPages = pagination.pages;
    const currentPage = pagination.page;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages && newPage !== pagination.page) onPageChange(newPage);
  };

  if (pagination.pages <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/30">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {currentItemsCount > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          </span>
          {" – "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>
          {" of "}
          <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.total}</span>
        </span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="text-sm border border-gray-300 dark:border-neutral-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handlePageChange(1)}
          disabled={pagination.page === 1 || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1 || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, i) =>
            pageNum === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2.5 py-1.5 text-sm text-gray-500">
                …
              </span>
            ) : (
              <button
                key={pageNum as number}
                type="button"
                onClick={() => handlePageChange(pageNum as number)}
                disabled={loading}
                className={`min-w-9 px-2.5 py-1.5 text-sm rounded-lg border transition-colors ${
                  pagination.page === pageNum
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pageNum as number}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handlePageChange(pagination.pages)}
          disabled={pagination.page >= pagination.pages || loading}
          className="p-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
