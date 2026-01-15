"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SalePopulatedType } from "@/types";
import { getSalesHistoryCached, getTodaySales } from "@/lib/sale-actions";
import { formatCurrency } from "@/lib/utils";
import { X, Eye, Edit, Printer, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import ViewSaleModal from "@/app/(protected)/[branchId]/menu/sales-history/components/viewSaleModal";
import { getTodayDate } from "@/lib/date-utils";

type TodaySalesSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditSale: (saleId: string) => void;
};

const TodaySalesSidebar = ({
  isOpen,
  onClose,
  onEditSale,
}: TodaySalesSidebarProps) => {
  const params = useParams();
  const branchId = params.branchId as string;
  const [sales, setSales] = useState<SalePopulatedType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingSale, setViewingSale] = useState<SalePopulatedType | null>(
    null
  );

  // Fetch today's sales
  const fetchTodaySales = useCallback(async () => {
    if (!isOpen || !branchId) return;

    setLoading(true);
    try {
      const data = await getTodaySales(branchId);
      setSales(data);
    } catch (error) {
      console.error("Failed to fetch today's sales:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, branchId]);

  useEffect(() => {
    fetchTodaySales();
  }, [fetchTodaySales]);

  const handleEdit = (sale: SalePopulatedType) => {
    onEditSale(sale._id);
    onClose();
  };

  const handlePrint = (sale: SalePopulatedType) => {
    setViewingSale(sale);
  };

  const formatTime = (dateString: string | Date | undefined): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-neutral-900 
          border-l border-gray-200 dark:border-neutral-800 
          shadow-xl z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Today&apos;s Sales
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : sales.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No sales found for today
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-neutral-800">
              {sales.map((sale) => (
                <div
                  key={sale._id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Sale Header */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 ">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {sale.invoiceNumber ||
                            (sale._id ? sale._id.slice(-8).toUpperCase() : "—")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(sale.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sale Details */}
                  <div className="space-y-1 mb-3">
                    {sale.customer && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="">Customer: </span>
                        <span className="font-medium">
                          {sale.customer.name}
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="">Items:</span>{" "}
                      <span className="font-medium">
                        {sale.products.length}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(sale.total)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingSale(sale)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center gap-1"
                      title="View Sale"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(sale)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center gap-1"
                      title="Edit Sale"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handlePrint(sale)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center gap-1"
                      title="Print Sale"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Sale Modal */}
      <ViewSaleModal
        sale={viewingSale}
        isOpen={viewingSale !== null}
        onClose={() => setViewingSale(null)}
      />
    </>
  );
};

export default TodaySalesSidebar;
