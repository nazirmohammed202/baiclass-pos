"use client";

import React from "react";
import { createPortal } from "react-dom";
import { SalePopulatedType } from "@/types";
import { X, AlertTriangle } from "lucide-react";

type DeleteSaleModalProps = {
  sale: SalePopulatedType | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteSaleModal = ({
  sale,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteSaleModalProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen && mounted && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "unset";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, mounted]);

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !sale) return null;

  const invoiceNumber =
    sale.invoiceNumber || (sale._id ? sale._id.slice(-8).toUpperCase() : "—");

  const modalContent = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete Sale
            </h2>
          </div>
          {!isDeleting && (
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete this sale? This action cannot be
            undone.
          </p>
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-md p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Invoice Number:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {invoiceNumber}
                </span>
              </div>
              {sale.customer && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Customer:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {sale.customer.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  ₵{sale.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Deleting...
              </>
            ) : (
              "Delete Sale"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    // Fallback: render directly if portal isn't available
    return isOpen && sale ? modalContent : null;
  }

  if (typeof document !== "undefined" && document.body) {
    return createPortal(modalContent, document.body);
  }

  // Fallback: render directly
  return isOpen && sale ? modalContent : null;
};

export default DeleteSaleModal;
