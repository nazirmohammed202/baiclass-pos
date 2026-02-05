"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Product } from "@/types";

type EditThresholdModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (threshold: number) => Promise<void>;
  saving: boolean;
};

const EditThresholdModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  saving,
}: EditThresholdModalProps) => {
  const [thresholdStr, setThresholdStr] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      Promise.resolve().then(() => {
        setThresholdStr(String(product.lowStockThreshold));
        setError(null);
      });
    }
  }, [isOpen, product]);

  const handleSave = async () => {
    const parsed = parseInt(thresholdStr, 10);
    if (thresholdStr === "" || isNaN(parsed) || parsed < 0) {
      setError("Enter a non-negative whole number");
      return;
    }
    setError(null);
    try {
      await onSave(parsed);
      onClose();
    } catch {
      // Stay open; parent shows error toast
    }
  };

  if (!isOpen) return null;

  const name =
    product?.details?.name ?? product?.details?.manufacturer ?? "Product";

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
            Edit low stock threshold
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
          {name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Stock will show as &quot;low&quot; when it falls at or below this value.
        </p>
        <div className="mb-4">
          <label
            htmlFor="threshold-value"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Threshold
          </label>
          <input
            id="threshold-value"
            type="number"
            min="0"
            step="1"
            value={thresholdStr}
            onChange={(e) => {
              setThresholdStr(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${error ? "border-red-500" : "border-gray-200 dark:border-neutral-800"
              }`}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditThresholdModal;
