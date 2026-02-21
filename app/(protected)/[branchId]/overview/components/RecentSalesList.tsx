"use client";

import { useState } from "react";
import type { SalePopulatedType } from "@/types";
import ViewSaleModal from "@/app/(protected)/[branchId]/menu/sales-history/components/viewSaleModal";
import { formatCurrency } from "@/lib/utils";

type RecentSalesListProps = {
  sales: SalePopulatedType[];
};

export default function RecentSalesList({ sales }: RecentSalesListProps) {
  const [viewingSale, setViewingSale] = useState<SalePopulatedType | null>(
    null
  );

  if (sales.length === 0) return null;

  return (
    <>
      <div className="pt-4 mt-auto">
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Latest Sales
        </p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {sales.slice(0, 5).map((sale) => {
            const customer =
              sale.customer && typeof sale.customer === "object"
                ? sale.customer.name
                : "Walk-in";
            return (
              <div
                key={sale._id}
                onClick={() => setViewingSale(sale)}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary uppercase">
                      {customer.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-900 dark:text-gray-100 truncate capitalize">
                    {customer}
                  </p>
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 shrink-0 ml-2">
                  {formatCurrency(sale.total)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {viewingSale && (
        <ViewSaleModal
          sale={viewingSale}
          isOpen={!!viewingSale}
          onClose={() => setViewingSale(null)}
        />
      )}
    </>
  );
}
