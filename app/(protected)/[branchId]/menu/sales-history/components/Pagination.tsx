"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type PaginationType = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type PaginationProps = {
  pagination: PaginationType;
  currentItemsCount: number;
  loading: boolean;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const Pagination = ({
  pagination,
  currentItemsCount,
  loading,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.pages;
    const currentPage = pagination.page;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.pages &&
      newPage !== pagination.page
    ) {
      onPageChange(newPage);
    }
  };

  if (pagination.pages === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 px-4 py-3 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results info and limit selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{" "}
            <span className="font-medium">
              {currentItemsCount > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="limit-select"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Per page:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1 || loading}
            className="p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }
              const pageNumber = pageNum as number;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    pagination.page === pageNumber
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages || loading}
            className="p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(pagination.pages)}
            disabled={pagination.page >= pagination.pages || loading}
            className="p-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
