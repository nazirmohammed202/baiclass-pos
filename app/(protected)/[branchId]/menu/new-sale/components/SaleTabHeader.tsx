"use client";
import React, { Suspense } from "react";
import CustomerDropdownMenu from "@/components/CustomerDropdownMenu";
import SearchCustomer from "@/components/SearchCustomer";
import SearchCustomerSkeleton from "@/components/skeletons/SearchCustomerSkeleton";
import SearchProducts from "@/components/SearchProducts";
import SearchProductsSkeleton from "@/components/skeletons/SearchProductsSkeleton";
import SaleSettingsButton from "@/components/SaleSettingsButton";
import SaleSwitches from "@/components/SaleSwitches";
import { CustomerType, Product } from "@/types";

type SaleTabHeaderProps = {
  selectedCustomer: CustomerType | null;
  customers: Promise<CustomerType[]>;
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
  priceType: "retail" | "wholesale";
  onSelectCustomer: (customer: CustomerType) => void;
  onRemoveCustomer: () => void;
  onProductSelect?: (product: Product, stockItem: Product | undefined) => void;
  onPriceTypeChange: (priceType: "retail" | "wholesale") => void;
  salesType: "cash" | "credit";
  onSalesTypeChange: (salesType: "cash" | "credit") => void;
  showEditOnClick: boolean;
  onShowEditOnClickChange: (value: boolean) => void;
  showPriceTypeSwitch: boolean;
  showSalesTypeSwitch: boolean;
  onShowPriceTypeSwitchChange: (value: boolean) => void;
  onShowSalesTypeSwitchChange: (value: boolean) => void;
};

const SaleTabHeader = ({
  selectedCustomer,
  customers,
  products,
  stockData,
  priceType,
  onSelectCustomer,
  onRemoveCustomer,
  onProductSelect,
  onPriceTypeChange,
  salesType,
  onSalesTypeChange,
  showEditOnClick,
  onShowEditOnClickChange,
  showPriceTypeSwitch,
  showSalesTypeSwitch,
  onShowPriceTypeSwitchChange,
  onShowSalesTypeSwitchChange,
}: SaleTabHeaderProps) => {
  return (
    <section
      className={`p-2 sm:p-4 pb-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between shrink-0 gap-2 sm:gap-4 ${
        salesType === "credit"
          ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500"
          : ""
      }`}
    >
      {/* Customer Section */}
      <div className="w-full lg:w-1/4 order-1">
        {selectedCustomer ? (
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 w-full">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-medium truncate">
                {selectedCustomer.name}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {selectedCustomer.address}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {selectedCustomer.phoneNumber}
              </p>
            </div>
            <div className="shrink-0">
              <CustomerDropdownMenu onRemoveCustomer={onRemoveCustomer} />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <Suspense fallback={<SearchCustomerSkeleton />}>
              <SearchCustomer
                onSelectCustomer={onSelectCustomer}
                customers={customers}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Product Search Section */}
      <div className="relative w-full lg:w-2/4 order-2">
        <Suspense fallback={<SearchProductsSkeleton />}>
          <SearchProducts
            onSelectProduct={onProductSelect}
            products={products}
            stockData={stockData}
          />
        </Suspense>
      </div>

      {/* Switches and Settings Section */}
      <div className="w-full lg:w-1/4 flex flex-row items-center justify-between lg:justify-end gap-2 sm:gap-3 order-3">
        <div className="flex items-center justify-start lg:justify-end gap-2 sm:gap-3 lg:gap-4 flex-wrap flex-1 lg:flex-initial">
          <SaleSwitches
            priceType={priceType}
            onPriceTypeChange={onPriceTypeChange}
            salesType={salesType}
            onSalesTypeChange={onSalesTypeChange}
            showPriceTypeSwitch={showPriceTypeSwitch}
            showSalesTypeSwitch={showSalesTypeSwitch}
          />
        </div>
        <div className="flex items-center justify-end shrink-0">
          <SaleSettingsButton
            showEditOnClick={showEditOnClick}
            onShowEditOnClickChange={onShowEditOnClickChange}
            showPriceTypeSwitch={showPriceTypeSwitch}
            onShowPriceTypeSwitchChange={onShowPriceTypeSwitchChange}
            showSalesTypeSwitch={showSalesTypeSwitch}
            onShowSalesTypeSwitchChange={onShowSalesTypeSwitchChange}
          />
        </div>
      </div>
    </section>
  );
};

export default SaleTabHeader;
