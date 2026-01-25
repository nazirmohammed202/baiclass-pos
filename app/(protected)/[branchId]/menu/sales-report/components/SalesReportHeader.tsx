"use client";

import { Calendar, Download } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isoToDate, dateToIso, formatDateToDisplay, getLastNDays } from "@/lib/date-utils";
import { useSalesReport } from "../hooks/useSalesReport";
import { useEffect } from "react";

type SalesReportHeaderProps = ReturnType<typeof useSalesReport>;

const SalesReportHeader = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  exportToCSV,
  dailySummary,
  loading,
  refreshReport,
}: SalesReportHeaderProps) => {

  const handleStartDateChange = async (date: Date | null) => {
    const isoDate = dateToIso(date);
    setStartDate(isoDate);
  };

  const handleEndDateChange = (date: Date | null) => {
    const isoDate = dateToIso(date);
    setEndDate(isoDate);
  };

  const handleQuickFilter = (days: number) => {
    const { startDate: newStartDate, endDate: newEndDate } = getLastNDays(days);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const isQuickFilterActive = (days: number): boolean => {
    const { startDate: filterStartDate, endDate: filterEndDate } = getLastNDays(days);
    return startDate === filterStartDate && endDate === filterEndDate;
  };

  const hasActiveFilters = startDate || endDate;

  useEffect(() => {
    // Refresh when dates change
    if (startDate || endDate) {
      refreshReport();
    }
  }, [startDate, endDate, refreshReport]);



  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200 dark:border-neutral-800">
      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Sales Report
        </h1>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={!dailySummary || dailySummary.eachDay.length === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range and Quick Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
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

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleQuickFilter(7)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${isQuickFilterActive(7)
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickFilter(30)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${isQuickFilterActive(30)
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleQuickFilter(90)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${isQuickFilterActive(90)
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
          >
            Last 90 Days
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800 flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Active filters:
          </span>
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

export default SalesReportHeader;
