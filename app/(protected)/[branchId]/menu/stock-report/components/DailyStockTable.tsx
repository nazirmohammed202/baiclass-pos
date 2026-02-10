"use client";

import { formatCurrency } from "@/lib/utils";
import { useStockReport } from "../hooks/useStockReport";
import { dateToIso, formatDateToDisplayWithDay } from "@/lib/date-utils";

type DailyStockTableProps = ReturnType<typeof useStockReport>;

const DailyStockTable = ({
  dailySummary,
  loading,
  navigateToDayDetail,
}: DailyStockTableProps) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (dailySummary.eachDay.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No stock receipt data found</p>
          <p className="text-sm mt-2">Try adjusting your date range</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cash
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Credit
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Receipts
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
            {dailySummary.eachDay.map((day) => (
              <tr
                key={day.date}
                onClick={() => navigateToDayDetail(day.date)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(day.date).toDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                  {formatCurrency(day.totalCost)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(day.cashCost)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(day.creditCost)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                  {day.receiptCount}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                  {day.itemsReceived}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-neutral-800 font-semibold border-t-2 border-gray-300 dark:border-neutral-600">
              <td className="px-4 py-3 whitespace-nowrap text-xl font-bold text-gray-900 dark:text-gray-100">
                TOTAL
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xl text-right font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(dailySummary.totalCost)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xl text-right font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(dailySummary.cashCost)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xl text-right font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(dailySummary.creditCost)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xl text-right font-bold text-gray-900 dark:text-gray-100">
                {dailySummary.receiptCount}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xl text-right font-bold text-gray-900 dark:text-gray-100">
                {dailySummary.itemsReceived}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {dailySummary.eachDay.map((day) => (
          <div
            key={day.date}
            onClick={() => navigateToDayDetail(day.date)}
            className="p-4 border-b border-gray-200 dark:border-neutral-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {formatDateToDisplayWithDay(day.date)}
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(day.totalCost)}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Cash:{" "}
                </span>
                {formatCurrency(day.cashCost)}
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Credit:{" "}
                </span>
                {formatCurrency(day.creditCost)}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{day.receiptCount} receipts</span>
              <span>{day.itemsReceived} items</span>
            </div>
          </div>
        ))}
        <div className="p-4 bg-gray-50 dark:bg-neutral-800 border-t-2 border-gray-300 dark:border-neutral-600">
          <div className="flex justify-between items-start mb-2">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              TOTAL
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(dailySummary.totalCost)}
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Cash:{" "}
              </span>
              {formatCurrency(dailySummary.cashCost)}
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Credit:{" "}
              </span>
              {formatCurrency(dailySummary.creditCost)}
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{dailySummary.receiptCount} receipts</span>
            <span>{dailySummary.itemsReceived} items</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStockTable;
