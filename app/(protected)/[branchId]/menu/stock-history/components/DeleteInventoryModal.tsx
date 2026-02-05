"use client";

import React from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { InventoryHistoryType } from "@/types";
import { formatCurrency } from "@/lib/utils";

type DeleteInventoryModalProps = {
  inventory: InventoryHistoryType | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteInventoryModal = ({
  inventory,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteInventoryModalProps) => {
  if (!isOpen || !inventory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">
          Delete Stock Receipt?
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          This action cannot be undone. The following stock receipt will be
          permanently deleted:
        </p>

        {/* Receipt details */}
        <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {inventory.supplier?.name || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Items:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {inventory.products.length} item
                {inventory.products.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Cost:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(inventory.totalCost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Date:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(inventory.invoiceDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInventoryModal;
