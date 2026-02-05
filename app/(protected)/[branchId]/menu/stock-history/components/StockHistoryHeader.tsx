"use client";

import { useEffect, useRef } from "react";
import { Search, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isoToDate, dateToIso, formatDateToDisplay } from "@/lib/date-utils";
import { useStockHistory } from "@/context/stockHistoryContext";
import { useStockHistoryActions } from "../hooks/useStockHistoryActions";
import { useParams } from "next/navigation";

const StockHistoryHeader = () => {
  const { branchId } = useParams();
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setSearchQuery,
    searchQuery,
  } = useStockHistory();

  const { searchStockHistory, refreshStockHistory } = useStockHistoryActions({
    branchId: branchId as string,
    setDeletingId: () => { },
    setOpenDropdownId: () => { },
    onDeleteRequest: () => { },
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    // Debounce search input
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      searchStockHistory();
    }, 1000); // 1000ms debounce delay
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, searchStockHistory]);

  const handleStartDateChange = async (date: Date | null) => {
    const isoDate = dateToIso(date);
    setStartDate(isoDate);
  };

  const handleEndDateChange = (date: Date | null) => {
    const isoDate = dateToIso(date);
    setEndDate(isoDate);
  };

  useEffect(() => {
    // Refresh when dates change
    if (startDate || endDate) {
      refreshStockHistory();
    }
  }, [startDate, endDate, refreshStockHistory]);

  const hasActiveFilters = searchQuery || startDate || endDate;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200 dark:border-neutral-800">
      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Stock History
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by supplier, product..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 flex-1 lg:flex-initial">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
          <DatePicker
            selected={isoToDate(startDate)}
            onChange={handleStartDateChange}
            dateFormat="dd/MM/yyyy"
            className="flex-1 sm:flex-initial sm:w-auto px-3 py-2 text-sm sm:text-base border border-gray-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            wrapperClassName="flex-1 sm:flex-initial"
            placeholderText="DD/MM/YYYY"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <DatePicker
            selected={isoToDate(endDate)}
            onChange={handleEndDateChange}
            dateFormat="dd/MM/yyyy"
            className="flex-1 sm:flex-initial sm:w-auto px-3 py-2 text-sm sm:text-base border border-gray-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            wrapperClassName="flex-1 sm:flex-initial"
            placeholderText="DD/MM/YYYY"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800 flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Active filters:
          </span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-md text-xs">
              Search: {searchQuery}
              <button
                onClick={() => handleSearchChange("")}
                className="hover:text-red-600 dark:hover:text-red-400"
                aria-label="Clear search"
              >
                ×
              </button>
            </span>
          )}
          {startDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-md text-xs">
              From: {formatDateToDisplay(startDate)}
              <button
                onClick={() => handleStartDateChange(null)}
                className="hover:text-red-600 dark:hover:text-red-400"
                aria-label="Clear start date"
              >
                ×
              </button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-md text-xs">
              To: {formatDateToDisplay(endDate)}
              <button
                onClick={() => handleEndDateChange(null)}
                className="hover:text-red-600 dark:hover:text-red-400"
                aria-label="Clear end date"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StockHistoryHeader;
