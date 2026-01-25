"use client";
import React, { useState } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useStock } from "@/context/stockContext";
import PriceSkeleton from "@/components/skeletons/priceSkeleton";
import EditCartItemModal from "./EditCartItemModal";
import { CartItem as CartItemType } from "@/types";
type CartItemProps = {
  item: CartItemType;
  index: number;
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onRemoveProduct?: (index: number) => void;
  onUpdateItem?: (index: number, quantity: number, unitPrice: number) => void;
  priceType?: "retail" | "wholesale";
};

const CartItem = ({
  item,
  index,
  onUpdateQuantity,
  onRemoveProduct,
  onUpdateItem,
  priceType,
}: CartItemProps) => {
  const { stockMap, isStockLoading } = useStock();
  const stockItem = stockMap.get(item.product.details._id);
  const [pulsingButton, setPulsingButton] = useState<"minus" | "plus" | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [focusField, setFocusField] = useState<
    "quantity" | "unitPrice" | "subtotal" | undefined
  >(undefined);

  // Use stored unitPrice instead of fetching from stock
  const price = item.unitPrice;
  const subtotal = price * item.quantity;

  // Show skeleton if price is 0 and stock is still loading (and price wasn't manually edited)
  const isPriceLoading =
    price === 0 && isStockLoading && !item.isPriceManuallyEdited && !stockItem;

  const stockQuantity = stockItem?.stock ?? item.product.stock;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 sm:p-3 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 hover:shadow-sm transition-shadow gap-2 sm:gap-0">
      {/* Product Info */}
      <div className="flex-1 min-w-0 capitalize order-1">
        <p className="text-xs text-gray-400 dark:text-gray-400 uppercase truncate">
          {item.product.details.manufacturer}
          {item.product.details.type && (
            <span className="ml-1 sm:ml-2">• {item.product.details.type}</span>
          )}
        </p>
        <p className="font-medium text-sm sm:text-base truncate">
          {item.product.details.name}
          {item.product.details.nickname && (
            <span className="text-gray-500 ml-1 sm:ml-2 font-normal text-xs sm:text-sm">
              ({item.product.details.nickname})
            </span>
          )}
        </p>
        {item.product.details.size && (
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            • {item.product.details.size}
          </p>
        )}
      </div>

      {/* Controls Section */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 lg:gap-6 shrink-0 order-2 flex-wrap sm:flex-nowrap">
        {/* Price Display - Clickable */}
        <div className="text-right sm:text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase hidden sm:block">
            {priceType === "wholesale" ? "Wholesale" : "Retail"} Price
          </p>
          {isPriceLoading ? (
            <PriceSkeleton />
          ) : (
            <button
              onClick={() => {
                setFocusField("unitPrice");
                setIsEditModalOpen(true);
              }}
              className="font-semibold text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
              aria-label="Edit unit price"
            >
              ₵{price.toFixed(2)}
            </button>
          )}
        </div>

        {/* Stock Quantity - Hidden on very small screens */}
        <div className="text-right hidden sm:block">
          {stockQuantity !== undefined && stockQuantity !== null ? (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                Stock
              </p>
              <p
                className={`font-semibold text-sm sm:text-base ${
                  stockQuantity >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stockQuantity}
              </p>
            </>
          ) : (
            <PriceSkeleton />
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase hidden sm:block">
            Quantity
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setPulsingButton("minus");
                setTimeout(() => setPulsingButton(null), 300);
                onUpdateQuantity?.(index, item.quantity - 1);
              }}
              className={`p-1.5 sm:p-2 rounded-full bg-black dark:bg-primary   text-white hover:opacity-90 transition-opacity ${
                pulsingButton === "minus" ? "animate-pulse-once" : ""
              }`}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => {
                setFocusField("quantity");
                setIsEditModalOpen(true);
              }}
              className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
              aria-label="Edit quantity"
            >
              {item.quantity}
            </button>
            <button
              onClick={() => {
                setPulsingButton("plus");
                setTimeout(() => setPulsingButton(null), 300);
                onUpdateQuantity?.(index, item.quantity + 1);
              }}
              className={`p-1.5 sm:p-2 rounded-full bg-black dark:bg-primary  text-white hover:opacity-90 transition-opacity ${
                pulsingButton === "plus" ? "animate-pulse-once" : ""
              }`}
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase hidden sm:block">
            Subtotal
          </p>
          {isPriceLoading ? (
            <PriceSkeleton />
          ) : (
            <button
              onClick={() => {
                setFocusField("subtotal");
                setIsEditModalOpen(true);
              }}
              className="font-semibold text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
              aria-label="Edit subtotal"
            >
              ₵{subtotal.toFixed(2)}
            </button>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onRemoveProduct?.(index)}
          className="p-1.5 sm:p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors shrink-0"
          aria-label="Remove product"
        >
          <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Edit Modal */}
      {onUpdateItem && (
        <EditCartItemModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setFocusField(undefined);
          }}
          item={item}
          onSave={(quantity, unitPrice) => {
            onUpdateItem(index, quantity, unitPrice);
          }}
          focusField={focusField}
        />
      )}
    </div>
  );
};

export default CartItem;
