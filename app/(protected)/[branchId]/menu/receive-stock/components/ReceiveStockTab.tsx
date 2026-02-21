"use client";

import React, { useState, useEffect, useRef } from "react";
import ReceiveStockTabHeader from "./ReceiveStockTabHeader";
import ReceiveStockItem from "./ReceiveStockItem";
import SaveReceiveStockModal from "./SaveReceiveStockModal";
import { BranchType, ReceiveStockItem as ReceiveStockItemType, Product, SupplierType } from "@/types";
import { Loader2 } from "lucide-react";
import { formatDateToDisplay } from "@/lib/date-utils";
import { ReceiveStockSettings } from "../hooks/useReceiveStockSettings";

type ReceiveStockTabProps = {
  supplier: SupplierType | null;
  suppliers: SupplierType[];
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
  onSupplierChange?: (supplier: SupplierType | null) => void;
  onProductSelect?: (product: Product, stockItem: Product | undefined) => void;
  tabItems: ReceiveStockItemType[];
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onRemoveProduct?: (index: number) => void;
  onUpdateItem?: (
    index: number,
    quantity: number,
    unitPrice: number,
    discount?: number,
    wholesalePrice?: number,
    retailPrice?: number,
    creditPrice?: number,
    recalculatePrices?: boolean
  ) => void;
  paymentType: "cash" | "credit";
  onPaymentTypeChange: (paymentType: "cash" | "credit") => void;
  showEditOnClick: boolean;
  onShowEditOnClickChange: (value: boolean) => void;
  showPaymentTypeSwitch: boolean;
  onShowPaymentTypeSwitchChange: (value: boolean) => void;
  autoCalcWholesale: boolean;
  onAutoCalcWholesaleChange: (value: boolean) => void;
  autoCalcRetail: boolean;
  onAutoCalcRetailChange: (value: boolean) => void;
  roundWholesale: boolean;
  onRoundWholesaleChange: (value: boolean) => void;
  roundRetail: boolean;
  onRoundRetailChange: (value: boolean) => void;
  onSave?: (
    supplier: SupplierType | null,
    items: ReceiveStockItemType[],
    total: number,
    paymentMethod: "cash" | "momo"
  ) => void;
  saving: boolean;
  receiveDate: string;
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
  onInvoiceDiscountChange?: (discountType: "percentage" | "fixed" | null, discountValue: number) => void;
  branchSettings?: BranchType["settings"];
  priceSettings: Pick<ReceiveStockSettings, "autoCalcWholesale" | "autoCalcRetail" | "roundWholesale" | "roundRetail">;
};

const ReceiveStockTab = ({
  supplier,
  suppliers,
  onSupplierChange,
  products,
  onProductSelect,
  stockData,
  tabItems,
  onUpdateQuantity,
  onRemoveProduct,
  onUpdateItem,
  paymentType,
  onPaymentTypeChange,
  showEditOnClick,
  onShowEditOnClickChange,
  showPaymentTypeSwitch,
  onShowPaymentTypeSwitchChange,
  autoCalcWholesale,
  onAutoCalcWholesaleChange,
  autoCalcRetail,
  onAutoCalcRetailChange,
  roundWholesale,
  onRoundWholesaleChange,
  roundRetail,
  onRoundRetailChange,
  onSave,
  saving,
  receiveDate,
  discountType,
  discountValue,
  onInvoiceDiscountChange,
  branchSettings,
  priceSettings,
}: ReceiveStockTabProps) => {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType | null>(supplier);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const itemsContainerRef = useRef<HTMLElement>(null);
  const previousItemsLengthRef = useRef(tabItems.length);

  useEffect(() => {
    setSelectedSupplier(supplier);
  }, [supplier]);

  useEffect(() => {
    if (itemsContainerRef.current && tabItems.length > previousItemsLengthRef.current) {
      setTimeout(() => {
        if (itemsContainerRef.current) {
          itemsContainerRef.current.scrollTo({
            top: itemsContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
    previousItemsLengthRef.current = tabItems.length;
  }, [tabItems.length, tabItems]);

  const handleRemoveSupplier = () => {
    setSelectedSupplier(null);
    if (onSupplierChange) {
      onSupplierChange(null);
    }
  };

  const handleSelectSupplier = (newSupplier: SupplierType) => {
    setSelectedSupplier(newSupplier);
    if (onSupplierChange) {
      onSupplierChange(newSupplier);
    }
  };

  // Calculate subtotal with item-level discounts
  const subtotal = tabItems.reduce((sum, item) => {
    const itemDiscount = item.discount ?? 0;
    const itemTotal = item.unitPrice * item.quantity * (1 - itemDiscount / 100);
    return sum + itemTotal;
  }, 0);

  // Calculate invoice-level discount
  const invoiceDiscountAmount = discountType === "percentage"
    ? subtotal * (discountValue / 100)
    : discountType === "fixed"
      ? Math.min(discountValue, subtotal)
      : 0;

  // Final total after all discounts
  const total = subtotal - invoiceDiscountAmount;

  const handleSave = (paymentMethod: "cash" | "momo") => {
    if (onSave) {
      onSave(selectedSupplier, tabItems, total, paymentMethod);
      setIsSaveModalOpen(false);
    }
  };

  return (
    <main className="bg-white dark:bg-neutral-900 rounded-lg sm:rounded-tr-lg sm:rounded-br-lg sm:rounded-bl-lg h-full flex flex-col overflow-hidden">
      <ReceiveStockTabHeader
        selectedSupplier={selectedSupplier}
        suppliers={suppliers}
        products={products}
        stockData={stockData}
        onSelectSupplier={handleSelectSupplier}
        onRemoveSupplier={handleRemoveSupplier}
        onProductSelect={onProductSelect}
        paymentType={paymentType}
        onPaymentTypeChange={onPaymentTypeChange}
        showEditOnClick={showEditOnClick}
        onShowEditOnClickChange={onShowEditOnClickChange}
        showPaymentTypeSwitch={showPaymentTypeSwitch}
        onShowPaymentTypeSwitchChange={onShowPaymentTypeSwitchChange}
        autoCalcWholesale={autoCalcWholesale}
        onAutoCalcWholesaleChange={onAutoCalcWholesaleChange}
        autoCalcRetail={autoCalcRetail}
        onAutoCalcRetailChange={onAutoCalcRetailChange}
        roundWholesale={roundWholesale}
        onRoundWholesaleChange={onRoundWholesaleChange}
        roundRetail={roundRetail}
        onRoundRetailChange={onRoundRetailChange}
        branchSettings={branchSettings}
      />
      <section className="flex flex-col lg:flex-row flex-1 gap-2 sm:gap-4 min-h-0 px-2 sm:px-4 pb-2 sm:pb-4">
        <article
          ref={itemsContainerRef}
          className="w-full lg:w-3/4 bg-background rounded-lg p-2 sm:p-4 overflow-y-auto flex-1 min-h-0 order-1"
        >
          <div className="space-y-2">
            {tabItems.map((item, i) => (
              <ReceiveStockItem
                key={i}
                item={item}
                index={i}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveProduct={onRemoveProduct}
                onUpdateItem={onUpdateItem}
                branchSettings={branchSettings}
                priceSettings={priceSettings}
              />
            ))}
          </div>
        </article>

        <aside className="w-full lg:w-1/4 bg-background rounded-lg p-3 sm:p-4 shrink-0 order-2 lg:sticky lg:top-0 lg:self-start">
          <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">All Items:</span>
              <span className="font-medium">
                {tabItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Unique Items:</span>
              <span className="font-medium">
                {new Set(tabItems.map((item) => item.product.details._id)).size}
              </span>
            </div>

            {/* Subtotal (after item discounts) */}
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-medium">₵{subtotal.toFixed(2)}</span>
            </div>

            {/* Invoice Discount Section */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Invoice Discount</p>
              <div className="flex gap-2">
                <select
                  value={discountType ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      onInvoiceDiscountChange?.(null, 0);
                    } else {
                      onInvoiceDiscountChange?.(value as "percentage" | "fixed", discountValue);
                    }
                  }}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-neutral-700 rounded-md bg-background"
                >
                  <option value="">None</option>
                  <option value="percentage">%</option>
                  <option value="fixed">Fixed (₵)</option>
                </select>
                {discountType && (
                  <input
                    type="number"
                    min="0"
                    step={discountType === "percentage" ? "0.5" : "0.01"}
                    max={discountType === "percentage" ? "100" : undefined}
                    value={discountValue || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onInvoiceDiscountChange?.(discountType, val);
                    }}
                    placeholder={discountType === "percentage" ? "%" : "₵"}
                    className="w-20 px-2 py-1.5 text-xs border border-gray-200 dark:border-neutral-700 rounded-md bg-background"
                  />
                )}
              </div>
              {invoiceDiscountAmount > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  -₵{invoiceDiscountAmount.toFixed(2)} off
                </p>
              )}
            </div>

            {/* Final Total */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-sm sm:text-base">
                <span>Total:</span>
                <span className={invoiceDiscountAmount > 0 ? "text-green-600 dark:text-green-400" : ""}>
                  ₵{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4">
              <button
                onClick={() => setIsSaveModalOpen(true)}
                disabled={tabItems.length === 0 || saving}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white"
                aria-label={`Save stock for ${formatDateToDisplay(receiveDate)}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  `Receive Stock (${formatDateToDisplay(receiveDate)})`
                )}
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* Save Modal */}
      {onSave && (
        <SaveReceiveStockModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSave}
          supplier={selectedSupplier}
          items={tabItems}
          subtotal={subtotal}
          invoiceDiscountAmount={invoiceDiscountAmount}
          total={total}
          paymentType={paymentType}
          saving={saving}
          receiveDate={receiveDate}
          discountType={discountType}
          discountValue={discountValue}
        />
      )}
    </main>
  );
};

export default ReceiveStockTab;
