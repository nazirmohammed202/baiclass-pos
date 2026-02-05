"use client";

import React from "react";
import { X } from "lucide-react";
import { InventoryHistoryType } from "@/types";
import { formatCurrency } from "@/lib/utils";

type ViewInventoryModalProps = {
  inventory: InventoryHistoryType | null;
  isOpen: boolean;
  onClose: () => void;
};

const ViewInventoryModal = ({
  inventory,
  isOpen,
  onClose,
}: ViewInventoryModalProps) => {
  if (!isOpen || !inventory) return null;

  const discountAmount =
    inventory.discountType === "percentage"
      ? (inventory.totalCost / (1 - (inventory.discountValue || 0) / 100)) *
      ((inventory.discountValue || 0) / 100)
      : inventory.discountValue || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Stock Receipt Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Summary Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Date
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(inventory.invoiceDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Supplier
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {inventory.supplier?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Received By
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {inventory.receivedBy?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Payment Type
              </p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${inventory.paymentType === "credit"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
              >
                {inventory.paymentType}
              </span>
            </div>
            {inventory.paymentMethod && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Payment Method
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {inventory.paymentMethod === "momo"
                    ? "Mobile Money"
                    : inventory.paymentMethod}
                </span>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Base Price
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Discount
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {inventory.products.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 capitalize">
                      <div>{item.product.name}</div>
                      {(item.product.manufacturer || item.product.size) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.product.manufacturer}
                          {item.product.size && ` • ${item.product.size}`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-gray-100">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.basePrice)}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      {item.discount && item.discount > 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          -{item.discount}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Items Total:
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(
                    inventory.products.reduce((sum, p) => sum + p.total, 0)
                  )}
                </span>
              </div>
              {inventory.discountType && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>
                    Discount{" "}
                    {inventory.discountType === "percentage"
                      ? `(${inventory.discountValue}%)`
                      : "(Fixed)"}
                    :
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200 dark:border-neutral-700">
                <span className="text-gray-900 dark:text-gray-100">
                  Total Cost:
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(inventory.totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          {inventory.note && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 uppercase font-medium mb-1">
                Note
              </p>
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                {inventory.note}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInventoryModal;
