"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Printer, X, CreditCard } from "lucide-react";
import { CustomerType } from "@/types";
import { CartItem } from "@/hooks/useSaleTabsPersistence";

type SaveSaleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amountPaid: number, shouldPrint: boolean) => void;
  customer: CustomerType | null;
  cartItems: CartItem[];
  total: number;
  salesType?: "cash" | "credit";
  savingSale?: boolean;
  isSaving?: boolean;
};

const SaveSaleModal = ({
  isOpen,
  onClose,
  onSave,
  customer,
  cartItems,
  total,
  salesType = "cash",
  savingSale = false,
  isSaving = false,
}: SaveSaleModalProps) => {
  const [amountPaidStr, setAmountPaidStr] = useState("");
  const amountPaidInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setAmountPaidStr(total.toFixed(2));
      });
      // Focus amount paid input after modal opens
      setTimeout(() => {
        if (amountPaidInputRef.current) {
          amountPaidInputRef.current.focus();
          amountPaidInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, total, startTransition]);

  const amountPaid = parseFloat(amountPaidStr) || 0;
  const change = amountPaid - total;

  const handleSave = (shouldPrint: boolean) => {
    if (amountPaid < total) {
      return; // Can't save if amount paid is less than total
    }
    onSave(amountPaid, shouldPrint);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(true); // Default to save only on Enter
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
              Save Sale
            </h2>
            {salesType === "credit" && (
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
            disabled={savingSale || isSaving}
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Customer Info */}
          {customer && (
            <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer
              </p>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {customer.address}
              </p>
            </div>
          )}

          {/* Sale Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Items:</span>
              <span className="font-medium">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Unique Products:
              </span>
              <span className="font-medium">
                {
                  new Set(cartItems.map((item) => item.product.details._id))
                    .size
                }
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>₵{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label
              htmlFor="amountPaid"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Amount Paid (₵)
            </label>
            <input
              ref={amountPaidInputRef}
              type="number"
              id="amountPaid"
              min={total}
              step="0.01"
              value={amountPaidStr}
              onChange={(e) => setAmountPaidStr(e.target.value)}
              onBlur={() => {
                if (amountPaidStr !== "") {
                  const parsed = parseFloat(amountPaidStr);
                  if (!isNaN(parsed)) {
                    setAmountPaidStr(
                      (Math.round(parsed * 100) / 100).toFixed(2)
                    );
                  }
                }
              }}
              className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Change */}
          {amountPaid > total && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Change:
                </span>
                <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                  ₵{change.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {amountPaid < total && amountPaidStr !== "" && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                Amount paid must be at least ₵{total.toFixed(2)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={savingSale}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={
                  savingSale ||
                  isSaving ||
                  amountPaid < total ||
                  amountPaidStr === ""
                }
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {savingSale || isSaving ? "Saving..." : "Save Only"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={
                savingSale || amountPaid < total || amountPaidStr === ""
              }
              className="w-full flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {savingSale ? "Saving..." : "Save and Print"}
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveSaleModal;
