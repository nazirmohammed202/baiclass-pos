"use client";

import React from "react";
import { X } from "lucide-react";
import { Product } from "@/types";

type RemoveProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: () => Promise<void>;
  removing: boolean;
};

const RemoveProductModal = ({
  isOpen,
  onClose,
  product,
  onConfirm,
  removing,
}: RemoveProductModalProps) => {
  if (!isOpen) return null;

  const name =
    product?.details?.name ?? product?.details?.manufacturer ?? "this product";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Remove product
          </h2>
          <button
            onClick={onClose}
            disabled={removing}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Remove <span className="font-medium text-gray-900 dark:text-gray-100">{name}</span> from
          this branch? Stock and prices will be cleared. You can add it again later.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={removing}
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={removing}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {removing ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveProductModal;
