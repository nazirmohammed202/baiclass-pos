"use client";

import React, { Suspense } from "react";
import SupplierDropdownMenu from "./SupplierDropdownMenu";
import SearchSupplier from "./SearchSupplier";
import SearchSupplierSkeleton from "./SearchSupplierSkeleton";
import SearchProductsStock from "./SearchProductsStock";
import SearchProductsSkeleton from "@/components/skeletons/SearchProductsSkeleton";
import ReceiveStockSettingsButton from "./ReceiveStockSettingsButton";
import PaymentTypeSwitch from "./PaymentTypeSwitch";
import { BranchType, Product, SupplierType } from "@/types";

type ReceiveStockTabHeaderProps = {
  selectedSupplier: SupplierType | null;
  suppliers: SupplierType[];
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
  onSelectSupplier: (supplier: SupplierType) => void;
  onRemoveSupplier: () => void;
  onProductSelect?: (product: Product, stockItem: Product | undefined) => void;
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
  branchSettings?: BranchType["settings"];
};

const ReceiveStockTabHeader = ({
  selectedSupplier,
  suppliers,
  products,
  stockData,
  onSelectSupplier,
  onRemoveSupplier,
  onProductSelect,
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
  branchSettings,
}: ReceiveStockTabHeaderProps) => {
  return (
    <section
      className={`p-2 sm:p-4 pb-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between shrink-0 gap-2 sm:gap-4 ${
        paymentType === "credit"
          ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500"
          : ""
      }`}
    >
      {/* Supplier Section */}
      <div className="w-full lg:w-1/4 order-1">
        {selectedSupplier ? (
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 w-full">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-medium truncate">
                {selectedSupplier.name}
              </h4>
              {selectedSupplier.address && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {selectedSupplier.address}
                </p>
              )}
              {selectedSupplier.phoneNumbers && selectedSupplier.phoneNumbers.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {selectedSupplier.phoneNumbers[0]}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <SupplierDropdownMenu onRemoveSupplier={onRemoveSupplier} />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <Suspense fallback={<SearchSupplierSkeleton />}>
              <SearchSupplier
                onSelectSupplier={onSelectSupplier}
                suppliers={suppliers}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Product Search Section */}
      <div className="relative w-full lg:w-2/4 order-2">
        <Suspense fallback={<SearchProductsSkeleton />}>
          <SearchProductsStock
            onSelectProduct={onProductSelect}
            products={products}
            stockData={stockData}
          />
        </Suspense>
      </div>

      {/* Switches and Settings Section */}
      <div className="w-full lg:w-1/4 flex flex-row items-center justify-between lg:justify-end gap-2 sm:gap-3 order-3">
        <div className="flex items-center justify-start lg:justify-end gap-2 sm:gap-3 lg:gap-4 flex-wrap flex-1 lg:flex-initial">
          <PaymentTypeSwitch
            paymentType={paymentType}
            onPaymentTypeChange={onPaymentTypeChange}
            showPaymentTypeSwitch={showPaymentTypeSwitch}
          />
        </div>
        <div className="flex items-center justify-end shrink-0">
          <ReceiveStockSettingsButton
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
        </div>
      </div>
    </section>
  );
};

export default ReceiveStockTabHeader;
