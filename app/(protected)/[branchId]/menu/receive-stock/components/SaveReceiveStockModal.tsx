"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { X, CreditCard } from "lucide-react";
import { SupplierType, ReceiveStockItem } from "@/types";
import { formatDateToDisplay } from "@/lib/date-utils";

type SaveReceiveStockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentMethod: "cash" | "momo") => void;
  supplier: SupplierType | null;
  items: ReceiveStockItem[];
  subtotal: number;
  invoiceDiscountAmount: number;
  total: number;
  paymentType?: "cash" | "credit";
  saving?: boolean;
  receiveDate: string;
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
};

const SaveReceiveStockModal = ({
  isOpen,
  onClose,
  onSave,
  supplier,
  items,
  subtotal,
  invoiceDiscountAmount,
  total,
  paymentType = "cash",
  saving = false,
  receiveDate,
  discountType,
  discountValue,
}: SaveReceiveStockModalProps) => {
  const normalizedTotal = parseFloat(total.toFixed(2));
  const normalizedSubtotal = parseFloat(subtotal.toFixed(2));
  const normalizedInvoiceDiscount = parseFloat(invoiceDiscountAmount.toFixed(2));

  // Calculate item-level discount total
  const itemDiscountTotal = items.reduce((sum, item) => {
    const discount = item.discount ?? 0;
    if (discount > 0) {
      const rawItemTotal = item.unitPrice * item.quantity;
      const discountAmount = rawItemTotal * (discount / 100);
      return sum + discountAmount;
    }
    return sum;
  }, 0);

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo">("cash");
  const [, startTransition] = useTransition();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setPaymentMethod("cash");
      });
      setTimeout(() => {
        if (confirmButtonRef.current) {
          confirmButtonRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, startTransition]);

  const handleSave = () => {
    onSave(paymentMethod);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              Receive Stock
            </h2>
            {paymentType === "credit" && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold">
                <CreditCard className="w-4 h-4" />
                <span>CREDIT</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
            disabled={saving}
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Supplier Info */}
          {supplier && (
            <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p>
              <p className="font-medium">{supplier.name}</p>
              {supplier.address && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {supplier.address}
                </p>
              )}
            </div>
          )}

          {/* Date Info */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Receive Date
            </p>
            <p className="font-medium text-emerald-700 dark:text-emerald-300">
              {formatDateToDisplay(receiveDate)}
            </p>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Items:</span>
              <span className="font-medium">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Unique Products:</span>
              <span className="font-medium">
                {new Set(items.map((item) => item.product.details._id)).size}
              </span>
            </div>

            {/* Show subtotal if there are any discounts */}
            {(itemDiscountTotal > 0 || normalizedInvoiceDiscount > 0) && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium">₵{normalizedSubtotal.toFixed(2)}</span>
                </div>

                {/* Item-level discounts */}
                {itemDiscountTotal > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Item Discounts:</span>
                    <span>-₵{itemDiscountTotal.toFixed(2)}</span>
                  </div>
                )}

                {/* Invoice-level discount */}
                {normalizedInvoiceDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>
                      Invoice Discount
                      {discountType === "percentage" && ` (${discountValue}%)`}:
                    </span>
                    <span>-₵{normalizedInvoiceDiscount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className={(itemDiscountTotal > 0 || normalizedInvoiceDiscount > 0) ? "text-green-600 dark:text-green-400" : ""}>
                  ₵{normalizedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label
              htmlFor="paymentMethod"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "cash" | "momo")}
              className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="cash">Cash</option>
              <option value="momo">MoMo</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? "Saving..." : "Confirm Receipt"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveReceiveStockModal;
