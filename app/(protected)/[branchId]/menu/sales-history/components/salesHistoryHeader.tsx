"use client";

import React, { useState } from "react";
import { Search, Filter, Calendar, Download } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isoToDate, dateToIso, formatDateToDisplay } from "@/lib/date-utils";
import { useParams } from "next/navigation";
import { getSalesHistoryCached } from "@/lib/sale-actions";
import { useSales } from "@/context/salesContext";

type SalesHistoryHeaderProps = {
  onSearchChange?: (search: string) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  onFilterChange?: (filters: {
    salesType?: "cash" | "credit" | "all";
    paymentMethod?: "cash" | "momo" | "all";
  }) => void;
  onExport?: () => void;
};

const SalesHistoryHeader = ({
  onSearchChange,
  onDateRangeChange,
  onFilterChange,
  onExport,
}: SalesHistoryHeaderProps) => {
  const branchId = useParams().branchId as string;

  const [searchQuery, setSearchQuery] = useState("");
  const { startDate, endDate, setStartDate, setEndDate } = useSales();
  const [salesTypeFilter, setSalesTypeFilter] = useState<
    "cash" | "credit" | "all"
  >("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<
    "cash" | "momo" | "all"
  >("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleStartDateChange = async (date: Date | null) => {
    const isoDate = dateToIso(date);
    setStartDate(isoDate);
    if (isoDate) {
      const data = await getSalesHistoryCached(
        branchId,
        isoDate,
        endDate
      ).catch((error) => console.error(error));

      console.log(data);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    const isoDate = dateToIso(date);
    setEndDate(isoDate);
    if (isoDate) {
      onDateRangeChange?.(startDate, isoDate);
    }
  };

  const handleSalesTypeChange = (type: "cash" | "credit" | "all") => {
    setSalesTypeFilter(type);
    onFilterChange?.({
      salesType: type,
      paymentMethod: paymentMethodFilter,
    });
  };

  const handlePaymentMethodChange = (method: "cash" | "momo" | "all") => {
    setPaymentMethodFilter(method);
    onFilterChange?.({
      salesType: salesTypeFilter,
      paymentMethod: method,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSalesTypeFilter("all");
    setPaymentMethodFilter("all");
    onSearchChange?.("");
    onDateRangeChange?.("", "");
    onFilterChange?.({
      salesType: "all",
      paymentMethod: "all",
    });
  };

  const hasActiveFilters =
    searchQuery ||
    startDate ||
    endDate ||
    salesTypeFilter !== "all" ||
    paymentMethodFilter !== "all";

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200 dark:border-neutral-800">
      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Sales History
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium"
              aria-label="Export sales"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
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
            placeholder="Search by customer, invoice, product..."
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

        {/* Filter Dropdown */}
        <DropdownMenu.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-md transition-colors text-sm sm:text-base font-medium ${
                hasActiveFilters
                  ? "bg-primary/10 border-primary text-primary dark:bg-primary/20"
                  : "border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              }`}
              aria-label="Filter sales"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[240px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-3 z-50"
              sideOffset={5}
              align="end"
            >
              <div className="space-y-4">
                {/* Sales Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sales Type
                  </label>
                  <div className="flex flex-col gap-2">
                    {(["all", "cash", "credit"] as const).map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="salesType"
                          checked={salesTypeFilter === type}
                          onChange={() => handleSalesTypeChange(type)}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {type === "all" ? "All Types" : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <div className="flex flex-col gap-2">
                    {(["all", "cash", "momo"] as const).map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethodFilter === method}
                          onChange={() => handlePaymentMethodChange(method)}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {method === "all"
                            ? "All Methods"
                            : method === "momo"
                            ? "Mobile Money"
                            : method}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsFilterOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
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
          {salesTypeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-md text-xs capitalize">
              Type: {salesTypeFilter}
              <button
                onClick={() => handleSalesTypeChange("all")}
                className="hover:text-red-600 dark:hover:text-red-400"
                aria-label="Clear sales type filter"
              >
                ×
              </button>
            </span>
          )}
          {paymentMethodFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-md text-xs capitalize">
              Payment:{" "}
              {paymentMethodFilter === "momo"
                ? "Mobile Money"
                : paymentMethodFilter}
              <button
                onClick={() => handlePaymentMethodChange("all")}
                className="hover:text-red-600 dark:hover:text-red-400"
                aria-label="Clear payment method filter"
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

export default SalesHistoryHeader;
