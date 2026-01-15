"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useRef,
} from "react";
import { X } from "lucide-react";
import { CartItem } from "@/types";

type EditCartItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem;
  onSave: (quantity: number, unitPrice: number) => void;
  focusField?: "quantity" | "unitPrice" | "subtotal";
};

const EditCartItemModal = ({
  isOpen,
  onClose,
  item,
  onSave,
  focusField,
}: EditCartItemModalProps) => {
  const [quantityStr, setQuantityStr] = useState(item.quantity.toString());
  const [unitPriceStr, setUnitPriceStr] = useState(item.unitPrice.toFixed(2));
  const [subtotalStr, setSubtotalStr] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    quantity?: string;
    unitPrice?: string;
  }>({});
  const [, startTransition] = useTransition();

  // Refs for input fields
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const unitPriceInputRef = useRef<HTMLInputElement>(null);
  const subtotalInputRef = useRef<HTMLInputElement>(null);

  // Parse numeric values from strings
  const quantity = useMemo(() => {
    const parsed = parseFloat(quantityStr);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }, [quantityStr]);

  const unitPrice = useMemo(() => {
    const parsed = parseFloat(unitPriceStr);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }, [unitPriceStr]);

  // Calculate subtotal - use manual value if set, otherwise calculate from quantity * unitPrice
  const subtotal = useMemo(() => {
    if (subtotalStr !== null && subtotalStr !== "") {
      const parsed = parseFloat(subtotalStr);
      return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    }
    return Math.round(quantity * unitPrice * 100) / 100;
  }, [quantity, unitPrice, subtotalStr]);

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setQuantityStr(item.quantity.toString());
        setUnitPriceStr(item.unitPrice.toFixed(2));
        setSubtotalStr(null);
        setErrors({});
      });

      // Focus the appropriate field after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (focusField === "quantity" && quantityInputRef.current) {
          quantityInputRef.current.focus();
          quantityInputRef.current.select();
        } else if (focusField === "unitPrice" && unitPriceInputRef.current) {
          unitPriceInputRef.current.focus();
          unitPriceInputRef.current.select();
        } else if (focusField === "subtotal" && subtotalInputRef.current) {
          subtotalInputRef.current.focus();
          subtotalInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, item, startTransition, focusField]);

  const handleQuantityChange = (value: string) => {
    // Allow empty string for editing
    setQuantityStr(value);
    setErrors((prev) => ({ ...prev, quantity: undefined }));

    // If value is not empty, validate and recalculate
    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setErrors((prev) => ({
          ...prev,
          quantity: "Quantity must be >= 0",
        }));
        return;
      }

      // If subtotal was manually edited, recalculate unit price
      if (subtotalStr !== null && subtotalStr !== "") {
        const parsedSubtotal = parseFloat(subtotalStr);
        if (!isNaN(parsedSubtotal) && numValue > 0) {
          const newUnitPrice = parsedSubtotal / numValue;
          setUnitPriceStr((Math.round(newUnitPrice * 100) / 100).toFixed(2));
        }
      } else {
        // Clear manual subtotal to use calculated value
        setSubtotalStr(null);
      }
    }
  };

  const handleUnitPriceChange = (value: string) => {
    // Allow empty string for editing
    setUnitPriceStr(value);
    setErrors((prev) => ({ ...prev, unitPrice: undefined }));

    // If value is not empty, validate
    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setErrors((prev) => ({ ...prev, unitPrice: "Price must be >= 0" }));
        return;
      }
    }

    // Clear manual subtotal to use calculated value
    setSubtotalStr(null);
  };

  const handleSubtotalChange = (value: string) => {
    // Allow empty string for editing
    setSubtotalStr(value === "" ? null : value);
    setErrors((prev) => ({ ...prev, unitPrice: undefined }));

    // If value is not empty, validate and recalculate
    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return;
      }

      if (quantity > 0) {
        // Calculate unit price from subtotal and quantity, round to 2 decimal places
        const newUnitPrice = numValue / quantity;
        setUnitPriceStr((Math.round(newUnitPrice * 100) / 100).toFixed(2));
      } else {
        // If quantity is 0, set unit price to subtotal (assumes quantity will be 1)
        setUnitPriceStr((Math.round(numValue * 100) / 100).toFixed(2));
      }
    }
  };

  const handleSave = () => {
    // Parse and validate quantity
    const parsedQuantity = parseFloat(quantityStr);
    if (isNaN(parsedQuantity) || quantityStr === "") {
      setErrors((prev) => ({
        ...prev,
        quantity: "Quantity is required",
      }));
      return;
    }
    const roundedQuantity = Math.round(parsedQuantity);
    if (roundedQuantity <= 0) {
      setErrors((prev) => ({
        ...prev,
        quantity: "Quantity must be greater than 0",
      }));
      return;
    }

    // Parse and validate unit price
    const parsedUnitPrice = parseFloat(unitPriceStr);
    if (isNaN(parsedUnitPrice) || unitPriceStr === "") {
      setErrors((prev) => ({
        ...prev,
        unitPrice: "Unit price is required",
      }));
      return;
    }
    const roundedUnitPrice = Math.round(parsedUnitPrice * 100) / 100;
    if (roundedUnitPrice < 0) {
      setErrors((prev) => ({ ...prev, unitPrice: "Price must be >= 0" }));
      return;
    }

    onSave(roundedQuantity, roundedUnitPrice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              Edit Cart Item
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {item.product.details.manufacturer} • {item.product.details.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Row of editable fields */}
          <div className="grid grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Quantity
              </label>
              <input
                ref={quantityInputRef}
                type="number"
                id="quantity"
                min="0"
                step="1"
                value={quantityStr}
                onChange={(e) => handleQuantityChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                onBlur={() => {
                  // Format to whole number on blur
                  if (quantityStr !== "") {
                    const parsed = parseFloat(quantityStr);
                    if (!isNaN(parsed)) {
                      setQuantityStr(Math.round(parsed).toString());
                    }
                  }
                }}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.quantity
                    ? "border-red-500"
                    : "border-gray-200 dark:border-neutral-800"
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label
                htmlFor="unitPrice"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Unit Price (₵)
              </label>
              <input
                ref={unitPriceInputRef}
                type="number"
                id="unitPrice"
                min="0"
                step="0.01"
                value={unitPriceStr}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                onBlur={() => {
                  // Format to 2 decimal places on blur
                  if (unitPriceStr !== "") {
                    const parsed = parseFloat(unitPriceStr);
                    if (!isNaN(parsed)) {
                      setUnitPriceStr(
                        (Math.round(parsed * 100) / 100).toFixed(2)
                      );
                    }
                  }
                }}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.unitPrice
                    ? "border-red-500"
                    : "border-gray-200 dark:border-neutral-800"
                }`}
              />
              {errors.unitPrice && (
                <p className="mt-1 text-sm text-red-500">{errors.unitPrice}</p>
              )}
            </div>

            {/* Subtotal */}
            <div>
              <label
                htmlFor="subtotal"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Subtotal (₵)
              </label>
              <input
                ref={subtotalInputRef}
                type="number"
                id="subtotal"
                min="0"
                step="0.01"
                value={subtotalStr !== null ? subtotalStr : subtotal.toFixed(2)}
                onChange={(e) => handleSubtotalChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                onBlur={() => {
                  // Format to 2 decimal places on blur if not manually set
                  if (subtotalStr === null || subtotalStr === "") {
                    setSubtotalStr(null);
                  } else {
                    const parsed = parseFloat(subtotalStr);
                    if (!isNaN(parsed)) {
                      setSubtotalStr(
                        (Math.round(parsed * 100) / 100).toFixed(2)
                      );
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 ">
            {quantity > 0
              ? "Editing any field will automatically recalculate the others"
              : "Editing subtotal will set unit price (assumes quantity 1)"}
          </p>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCartItemModal;
