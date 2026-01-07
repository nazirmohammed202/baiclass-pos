"use client";

import React, { use } from "react";
import { SaleType } from "@/types";
import { formatDateToDisplay } from "@/lib/date-utils";
import { Eye, ChevronRight } from "lucide-react";

type SalesHistoryTableProps = {
  sales: Promise<SaleType[]>;
  onSaleClick?: (sale: SaleType) => void;
};

const formatCurrency = (amount: number): string => {
  return `₵${amount.toFixed(2)}`;
};

const SalesHistoryTable = ({ sales, onSaleClick }: SalesHistoryTableProps) => {
  const salesData = use(sales);

  if (salesData.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No sales found</p>
          <p className="text-sm mt-2">
            Try adjusting your filters or date range
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Paid
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Due
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {salesData.map((sale) => (
              <tr
                key={sale._id}
                className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                onClick={() => onSaleClick?.(sale)}
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(sale.createdAt as string).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {sale._id ? sale._id.slice(-8).toUpperCase() : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {sale.products.length} item
                  {sale.products.length !== 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                  {formatCurrency(sale.paid)}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span
                    className={
                      sale.due > 0
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {formatCurrency(sale.due)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {sale.paymentMethod === "momo"
                      ? "Mobile Money"
                      : sale.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-gray-300">
                    {sale.salesType || "cash"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaleClick?.(sale);
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                    aria-label="View sale details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700">
        {salesData.map((sale) => (
          <div
            key={sale._id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            onClick={() => onSaleClick?.(sale)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Invoice: {sale._id ? sale._id.slice(-8).toUpperCase() : "—"}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateToDisplay(sale.createdAt as string)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaleClick?.(sale);
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                aria-label="View sale details"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Items
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {sale.products.length} item
                  {sale.products.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(sale.total)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Paid
                </span>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(sale.paid)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Due
                </span>
                <p
                  className={`text-sm font-medium ${
                    sale.due > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {formatCurrency(sale.due)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {sale.paymentMethod === "momo"
                  ? "Mobile Money"
                  : sale.paymentMethod}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-gray-300">
                {sale.salesType || "cash"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesHistoryTable;
