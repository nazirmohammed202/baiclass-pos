"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { formatCurrencyToDisplay } from "@/lib/utils";

type CloseShiftModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  totalReceived: number;
  date: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CloseShiftModal({
  isOpen,
  isClosing,
  totalReceived,
  date,
  onClose,
  onConfirm,
}: CloseShiftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          disabled={isClosing}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">
          Close shift?
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          This will close the shift for the selected day. Make sure the amount received is correct.
        </p>

        <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Date:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{date || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total received:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrencyToDisplay(totalReceived)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isClosing}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isClosing}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isClosing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Closing...
              </>
            ) : (
              "Close shift"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

