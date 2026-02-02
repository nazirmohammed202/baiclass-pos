"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Product } from "@/types";

export type PriceFieldType = "basePrice" | "wholesalePrice" | "retailPrice";

const LABELS: Record<PriceFieldType, string> = {
  basePrice: "Base price",
  wholesalePrice: "Wholesale price",
  retailPrice: "Retail price",
};

type EditPriceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  field: PriceFieldType;
  onSave: (value: number) => Promise<void>;
  saving: boolean;
};

type EditPriceFormProps = {
  product: Product;
  field: PriceFieldType;
  onSave: (value: number) => Promise<void>;
  onClose: () => void;
  saving: boolean;
};

const EditPriceForm = ({ product, field, onSave, onClose, saving }: EditPriceFormProps) => {
  const current = field in product ? (product[field] as number | undefined) : undefined;
  const initialValue = current !== undefined && current !== null ? current.toFixed(2) : "";

  const [valueStr, setValueStr] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const parsed = parseFloat(valueStr);
    if (valueStr === "" || isNaN(parsed) || parsed < 0) {
      setError("Enter a number ≥ 0");
      return;
    }
    setError(null);
    try {
      await onSave(Math.round(parsed * 100) / 100);
      onClose();
    } catch {
      // Stay open; parent shows error toast
    }
  };

  const name = product.details?.name ?? product.details?.manufacturer ?? "Product";
  const label = LABELS[field];

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Edit {label.toLowerCase()}
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
      <div className="mb-4">
        <label
          htmlFor="price-value"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label} (₵)
        </label>
        <input
          id="price-value"
          type="number"
          min="0"
          step="0.01"
          value={valueStr}
          onChange={(e) => {
            setValueStr(e.target.value);
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
  );
};

const EditPriceModal = ({
  isOpen,
  onClose,
  product,
  field,
  onSave,
  saving,
}: EditPriceModalProps) => {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <EditPriceForm
        key={`${product._id}-${field}`}
        product={product}
        field={field}
        onSave={onSave}
        onClose={onClose}
        saving={saving}
      />
    </div>
  );
};

export default EditPriceModal;
