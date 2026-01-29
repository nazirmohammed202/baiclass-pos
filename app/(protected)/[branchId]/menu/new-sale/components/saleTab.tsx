"use client";
import React, { useState, useEffect, useRef } from "react";
import SaleTabHeader from "./SaleTabHeader";
import CartItem from "./CartItem";
import SaveSaleModal from "./SaveSaleModal";
import { CartItem as CartItemType, CustomerType, Product } from "@/types";
import { Loader2 } from "lucide-react";
import { formatDateToDisplay } from "@/lib/date-utils";

type SaleTabProps = {
  customer: CustomerType | null;
  customers: Promise<CustomerType[]>;
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
  onCustomerChange?: (customer: CustomerType | null) => void;
  onProductSelect?: (product: Product, stockItem: Product | undefined) => void;
  tabProducts: CartItemType[];
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onRemoveProduct?: (index: number) => void;
  onUpdateItem?: (index: number, quantity: number, unitPrice: number) => void;
  priceType: "retail" | "wholesale";
  onPriceTypeChange: (priceType: "retail" | "wholesale") => void;
  salesType: "cash" | "credit";
  onSalesTypeChange: (salesType: "cash" | "credit") => void;
  showEditOnClick: boolean;
  onShowEditOnClickChange: (value: boolean) => void;
  showPriceTypeSwitch: boolean;
  showSalesTypeSwitch: boolean;
  onShowPriceTypeSwitchChange: (value: boolean) => void;
  onShowSalesTypeSwitchChange: (value: boolean) => void;
  onSaveSale?: (
    customer: CustomerType | null,
    cartItems: CartItemType[],
    total: number,
    amountPaid: number,
    priceType: "retail" | "wholesale",
    shouldPrint: boolean,
    paymentMethod: "cash" | "momo"
  ) => void;
  savingSale: boolean;
  isEditMode?: boolean;
  saleId?: string | null;
  saleDate?: string; // ISO date string (YYYY-MM-DD)
};

const SaleTab = ({
  customer,
  onCustomerChange,
  customers,
  products,
  onProductSelect,
  stockData,
  tabProducts,
  onUpdateQuantity,
  onRemoveProduct,
  onUpdateItem,
  priceType,
  onPriceTypeChange,
  salesType,
  onSalesTypeChange,
  showEditOnClick,
  onShowEditOnClickChange,
  showPriceTypeSwitch,
  showSalesTypeSwitch,
  onShowPriceTypeSwitchChange,
  onShowSalesTypeSwitchChange,
  onSaveSale,
  savingSale,
  isEditMode = false,
  saleId,
  saleDate,
}: SaleTabProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
    customer
  );
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const productsContainerRef = useRef<HTMLElement>(null);
  const previousProductsLengthRef = useRef(tabProducts.length);

  useEffect(() => {
    setSelectedCustomer(customer);
  }, [customer]);

  useEffect(() => {
    // Scroll to bottom when a new product is added (length increased)
    if (
      productsContainerRef.current &&
      tabProducts.length > previousProductsLengthRef.current
    ) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (productsContainerRef.current) {
          productsContainerRef.current.scrollTo({
            top: productsContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
    previousProductsLengthRef.current = tabProducts.length;
  }, [tabProducts.length, tabProducts]);

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
    if (onCustomerChange) {
      onCustomerChange(null);
    }
  };

  const handleSelectCustomer = (newCustomer: CustomerType) => {
    setSelectedCustomer(newCustomer);
    if (onCustomerChange) {
      onCustomerChange(newCustomer);
    }
  };

  const total = tabProducts.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);

  const handleSaveSale = (amountPaid: number, shouldPrint: boolean, paymentMethod: "cash" | "momo") => {
    if (onSaveSale) {
      onSaveSale(
        selectedCustomer,
        tabProducts,
        total,
        amountPaid,
        priceType,
        shouldPrint,
        paymentMethod
      );
      setIsSaveModalOpen(false);
    }
  };

  return (
    <main className="bg-white dark:bg-neutral-900 rounded-lg sm:rounded-tr-lg sm:rounded-br-lg sm:rounded-bl-lg h-full flex flex-col overflow-hidden">
      <SaleTabHeader
        selectedCustomer={selectedCustomer}
        customers={customers}
        products={products}
        stockData={stockData}
        priceType={priceType}
        onSelectCustomer={handleSelectCustomer}
        onRemoveCustomer={handleRemoveCustomer}
        onProductSelect={onProductSelect}
        onPriceTypeChange={onPriceTypeChange}
        salesType={salesType}
        onSalesTypeChange={onSalesTypeChange}
        showEditOnClick={showEditOnClick}
        onShowEditOnClickChange={onShowEditOnClickChange}
        showPriceTypeSwitch={showPriceTypeSwitch}
        showSalesTypeSwitch={showSalesTypeSwitch}
        onShowPriceTypeSwitchChange={onShowPriceTypeSwitchChange}
        onShowSalesTypeSwitchChange={onShowSalesTypeSwitchChange}
      />
      <section className="flex flex-col lg:flex-row flex-1 gap-2 sm:gap-4 min-h-0 px-2 sm:px-4 pb-2 sm:pb-4">
        <article
          ref={productsContainerRef}
          className="w-full lg:w-3/4 bg-background rounded-lg p-2 sm:p-4 overflow-y-auto flex-1 min-h-0 order-1"
        >
          <div className="space-y-2">
            {tabProducts.map((item, i) => (
              <CartItem
                key={i}
                item={item}
                index={i}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveProduct={onRemoveProduct}
                onUpdateItem={onUpdateItem}
                priceType={priceType}
              />
            ))}
          </div>
        </article>

        <aside className="w-full lg:w-1/4 bg-background rounded-lg p-3 sm:p-4 shrink-0 order-2 lg:sticky lg:top-0 lg:self-start">
          <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
            Total
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                All Items:
              </span>
              <span className="font-medium">
                {tabProducts.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Unique Items:
              </span>
              <span className="font-medium">
                {
                  new Set(tabProducts.map((item) => item.product.details._id))
                    .size
                }
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-sm sm:text-base">
                <span>Total:</span>
                <span>
                  ₵
                  {tabProducts
                    .reduce((sum, item) => {
                      return sum + item.unitPrice * item.quantity;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4">
              <button
                onClick={() => setIsSaveModalOpen(true)}
                disabled={tabProducts.length === 0 || savingSale}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base ${saleDate
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : isEditMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                aria-label={
                  saleDate
                    ? `Save sale for ${formatDateToDisplay(saleDate)}`
                    : isEditMode
                      ? "Update sale"
                      : "Save sale"
                }
              >
                {savingSale ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isEditMode ? "Updating..." : "Saving..."}</span>
                  </>
                ) : saleDate ? (
                  `Save Sale (${formatDateToDisplay(saleDate)})`
                ) : isEditMode ? (
                  "Update Sale"
                ) : (
                  "Save Sale"
                )}
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* Save Sale Modal */}
      {onSaveSale && (
        <SaveSaleModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveSale}
          customer={selectedCustomer}
          cartItems={tabProducts}
          total={total}
          salesType={salesType}
          savingSale={savingSale}
          isEditMode={isEditMode}
          saleDate={saleDate}
        />
      )}
    </main>
  );
};

export default SaleTab;
