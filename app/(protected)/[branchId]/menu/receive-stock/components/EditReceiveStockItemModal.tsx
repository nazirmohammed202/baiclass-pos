"use client";

import React, { useState, useEffect, useMemo, useTransition, useRef } from "react";
import { X, RefreshCw } from "lucide-react";
import { BranchType, ReceiveStockItem } from "@/types";
import { calculateDerivedPrices } from "../hooks/useReceiveStockActions";
import { ReceiveStockSettings } from "../hooks/useReceiveStockSettings";

type EditReceiveStockItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: ReceiveStockItem;
  onSave: (
    quantity: number,
    unitPrice: number,
    discount?: number,
    wholesalePrice?: number,
    retailPrice?: number,
    recalculatePrices?: boolean
  ) => void;
  focusField?: "quantity" | "unitPrice" | "subtotal" | "discount" | "wholesalePrice" | "retailPrice";
  branchSettings?: BranchType["settings"];
  priceSettings: Pick<ReceiveStockSettings, "autoCalcWholesale" | "autoCalcRetail" | "roundWholesale" | "roundRetail">;
};

const EditReceiveStockItemModal = ({
  isOpen,
  onClose,
  item,
  onSave,
  focusField,
  branchSettings,
  priceSettings,
}: EditReceiveStockItemModalProps) => {
  const [quantityStr, setQuantityStr] = useState(item.quantity.toString());
  const [unitPriceStr, setUnitPriceStr] = useState(item.unitPrice.toFixed(2));
  const [wholesalePriceStr, setWholesalePriceStr] = useState((item.wholesalePrice ?? 0).toFixed(2));
  const [retailPriceStr, setRetailPriceStr] = useState((item.retailPrice ?? 0).toFixed(2));
  const [subtotalStr, setSubtotalStr] = useState<string | null>(null);
  const [discountStr, setDiscountStr] = useState((item.discount ?? 0).toString());
  const [errors, setErrors] = useState<{
    quantity?: string;
    unitPrice?: string;
    discount?: string;
  }>({});
  const [, startTransition] = useTransition();

  const quantityInputRef = useRef<HTMLInputElement>(null);
  const unitPriceInputRef = useRef<HTMLInputElement>(null);
  const wholesalePriceInputRef = useRef<HTMLInputElement>(null);
  const retailPriceInputRef = useRef<HTMLInputElement>(null);
  const subtotalInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);

  const quantity = useMemo(() => {
    const parsed = parseFloat(quantityStr);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }, [quantityStr]);

  const unitPrice = useMemo(() => {
    const parsed = parseFloat(unitPriceStr);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }, [unitPriceStr]);

  const discount = useMemo(() => {
    const parsed = parseFloat(discountStr);
    return isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
  }, [discountStr]);

  const subtotal = useMemo(() => {
    if (subtotalStr !== null && subtotalStr !== "") {
      const parsed = parseFloat(subtotalStr);
      return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    }
    const rawSubtotal = quantity * unitPrice;
    const discountedSubtotal = rawSubtotal * (1 - discount / 100);
    return Math.round(discountedSubtotal * 100) / 100;
  }, [quantity, unitPrice, subtotalStr, discount]);

  // Calculate derived prices for display
  const calculatedPrices = useMemo(() => {
    return calculateDerivedPrices(unitPrice, branchSettings, priceSettings);
  }, [unitPrice, branchSettings, priceSettings]);

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setQuantityStr(item.quantity.toString());
        setUnitPriceStr(item.unitPrice.toFixed(2));
        setWholesalePriceStr((item.wholesalePrice ?? 0).toFixed(2));
        setRetailPriceStr((item.retailPrice ?? 0).toFixed(2));
        setDiscountStr((item.discount ?? 0).toString());
        setSubtotalStr(null);
        setErrors({});
      });

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
        } else if (focusField === "discount" && discountInputRef.current) {
          discountInputRef.current.focus();
          discountInputRef.current.select();
        } else if (focusField === "wholesalePrice" && wholesalePriceInputRef.current) {
          wholesalePriceInputRef.current.focus();
          wholesalePriceInputRef.current.select();
        } else if (focusField === "retailPrice" && retailPriceInputRef.current) {
          retailPriceInputRef.current.focus();
          retailPriceInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, item, startTransition, focusField]);

  const handleQuantityChange = (value: string) => {
    setQuantityStr(value);
    setErrors((prev) => ({ ...prev, quantity: undefined }));

    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setErrors((prev) => ({
          ...prev,
          quantity: "Quantity must be >= 0",
        }));
        return;
      }

      if (subtotalStr !== null && subtotalStr !== "") {
        const parsedSubtotal = parseFloat(subtotalStr);
        if (!isNaN(parsedSubtotal) && numValue > 0) {
          const newUnitPrice = parsedSubtotal / numValue;
          setUnitPriceStr((Math.round(newUnitPrice * 100) / 100).toFixed(2));
        }
      } else {
        setSubtotalStr(null);
      }
    }
  };

  const handleUnitPriceChange = (value: string) => {
    setUnitPriceStr(value);
    setErrors((prev) => ({ ...prev, unitPrice: undefined }));

    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setErrors((prev) => ({ ...prev, unitPrice: "Price must be >= 0" }));
        return;
      }

      // Auto-calculate wholesale and retail if not manually edited
      if (!item.isWholesalePriceManuallyEdited && priceSettings.autoCalcWholesale) {
        const newPrices = calculateDerivedPrices(numValue, branchSettings, priceSettings);
        if (newPrices.wholesalePrice !== undefined) {
          setWholesalePriceStr(newPrices.wholesalePrice.toFixed(2));
        }
      }
      if (!item.isRetailPriceManuallyEdited && priceSettings.autoCalcRetail) {
        const newPrices = calculateDerivedPrices(numValue, branchSettings, priceSettings);
        if (newPrices.retailPrice !== undefined) {
          setRetailPriceStr(newPrices.retailPrice.toFixed(2));
        }
      }
    }

    setSubtotalStr(null);
  };

  const handleSubtotalChange = (value: string) => {
    setSubtotalStr(value === "" ? null : value);
    setErrors((prev) => ({ ...prev, unitPrice: undefined }));

    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return;
      }

      // Reverse calculate unit price from subtotal considering discount
      const discountMultiplier = 1 - discount / 100;
      if (quantity > 0 && discountMultiplier > 0) {
        const newUnitPrice = numValue / (quantity * discountMultiplier);
        setUnitPriceStr((Math.round(newUnitPrice * 100) / 100).toFixed(2));
      } else if (quantity > 0) {
        const newUnitPrice = numValue / quantity;
        setUnitPriceStr((Math.round(newUnitPrice * 100) / 100).toFixed(2));
      } else {
        setUnitPriceStr((Math.round(numValue * 100) / 100).toFixed(2));
      }
    }
  };

  const handleDiscountChange = (value: string) => {
    setDiscountStr(value);
    setErrors((prev) => ({ ...prev, discount: undefined }));

    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        setErrors((prev) => ({
          ...prev,
          discount: "Discount must be 0-100%",
        }));
        return;
      }
    }
    // Clear subtotal when discount changes to recalculate
    setSubtotalStr(null);
  };

  const recalculateFromBase = () => {
    const newPrices = calculateDerivedPrices(unitPrice, branchSettings, priceSettings);
    if (newPrices.wholesalePrice !== undefined) {
      setWholesalePriceStr(newPrices.wholesalePrice.toFixed(2));
    }
    if (newPrices.retailPrice !== undefined) {
      setRetailPriceStr(newPrices.retailPrice.toFixed(2));
    }
  };

  const handleSave = () => {
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

    const parsedDiscount = parseFloat(discountStr);
    const roundedDiscount = isNaN(parsedDiscount) ? 0 : Math.min(100, Math.max(0, parsedDiscount));

    const parsedWholesale = parseFloat(wholesalePriceStr);
    const roundedWholesale = isNaN(parsedWholesale) ? undefined : Math.round(parsedWholesale * 100) / 100;

    const parsedRetail = parseFloat(retailPriceStr);
    const roundedRetail = isNaN(parsedRetail) ? undefined : Math.round(parsedRetail * 100) / 100;

    onSave(roundedQuantity, roundedUnitPrice, roundedDiscount, roundedWholesale, roundedRetail);
    onClose();
  };

  if (!isOpen) return null;

  const showWholesale = branchSettings?.wholesaleEnabled;
  const showRetail = branchSettings?.retailEnabled;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              Edit Item
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
          {/* First Row: Quantity, Base Price, Discount, Subtotal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            {/* Unit Price (Base Price) */}
            <div>
              <label
                htmlFor="unitPrice"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Base Price (₵)
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
                  if (unitPriceStr !== "") {
                    const parsed = parseFloat(unitPriceStr);
                    if (!isNaN(parsed)) {
                      setUnitPriceStr((Math.round(parsed * 100) / 100).toFixed(2));
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

            {/* Discount */}
            <div>
              <label
                htmlFor="discount"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Discount (%)
              </label>
              <input
                ref={discountInputRef}
                type="number"
                id="discount"
                min="0"
                max="100"
                step="0.5"
                value={discountStr}
                onChange={(e) => handleDiscountChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                onBlur={() => {
                  if (discountStr !== "") {
                    const parsed = parseFloat(discountStr);
                    if (!isNaN(parsed)) {
                      setDiscountStr(Math.min(100, Math.max(0, parsed)).toString());
                    }
                  }
                }}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.discount
                    ? "border-red-500"
                    : "border-gray-200 dark:border-neutral-800"
                }`}
              />
              {errors.discount && (
                <p className="mt-1 text-sm text-red-500">{errors.discount}</p>
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
                  if (subtotalStr === null || subtotalStr === "") {
                    setSubtotalStr(null);
                  } else {
                    const parsed = parseFloat(subtotalStr);
                    if (!isNaN(parsed)) {
                      setSubtotalStr((Math.round(parsed * 100) / 100).toFixed(2));
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Second Row: Wholesale and Retail Prices (if enabled) */}
          {(showWholesale || showRetail) && (
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selling Prices
                </p>
                <button
                  type="button"
                  onClick={recalculateFromBase}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  title="Recalculate from base price"
                >
                  <RefreshCw className="w-3 h-3" />
                  Recalculate
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Wholesale Price */}
                {showWholesale && (
                  <div>
                    <label
                      htmlFor="wholesalePrice"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Wholesale (₵)
                      {branchSettings?.wholesalePricePercentage !== undefined && (
                        <span className="text-xs text-gray-500 ml-1">
                          (+{(branchSettings.wholesalePricePercentage * 100).toFixed(0)}%)
                        </span>
                      )}
                    </label>
                    <input
                      ref={wholesalePriceInputRef}
                      type="number"
                      id="wholesalePrice"
                      min="0"
                      step="0.01"
                      value={wholesalePriceStr}
                      onChange={(e) => setWholesalePriceStr(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSave();
                        }
                      }}
                      onBlur={() => {
                        if (wholesalePriceStr !== "") {
                          const parsed = parseFloat(wholesalePriceStr);
                          if (!isNaN(parsed)) {
                            setWholesalePriceStr((Math.round(parsed * 100) / 100).toFixed(2));
                          }
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {calculatedPrices.wholesalePrice !== undefined && priceSettings.autoCalcWholesale && (
                      <p className="mt-1 text-xs text-gray-500">
                        Auto: ₵{calculatedPrices.wholesalePrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {/* Retail Price */}
                {showRetail && (
                  <div>
                    <label
                      htmlFor="retailPrice"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Retail (₵)
                      {branchSettings?.retailPricePercentage !== undefined && (
                        <span className="text-xs text-gray-500 ml-1">
                          (+{(branchSettings.retailPricePercentage * 100).toFixed(0)}%)
                        </span>
                      )}
                    </label>
                    <input
                      ref={retailPriceInputRef}
                      type="number"
                      id="retailPrice"
                      min="0"
                      step="0.01"
                      value={retailPriceStr}
                      onChange={(e) => setRetailPriceStr(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSave();
                        }
                      }}
                      onBlur={() => {
                        if (retailPriceStr !== "") {
                          const parsed = parseFloat(retailPriceStr);
                          if (!isNaN(parsed)) {
                            setRetailPriceStr((Math.round(parsed * 100) / 100).toFixed(2));
                          }
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {calculatedPrices.retailPrice !== undefined && priceSettings.autoCalcRetail && (
                      <p className="mt-1 text-xs text-gray-500">
                        Auto: ₵{calculatedPrices.retailPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {discount > 0
              ? `${discount}% discount applied. Subtotal reflects discounted price.`
              : quantity > 0
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

export default EditReceiveStockItemModal;
