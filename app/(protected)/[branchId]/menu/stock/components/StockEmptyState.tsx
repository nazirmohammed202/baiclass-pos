"use client";

import React from "react";
import { Package } from "lucide-react";
import { Product } from "@/types";
import StockHeader, { StockFilterType } from "./StockHeader";
import AddNewProductModal from "@/components/AddNewProductModal";
import AddSystemProductModal from "@/components/AddSystemProductModal";

type StockEmptyStateProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stockFilter: StockFilterType;
  setStockFilter: (filter: StockFilterType) => void;
  isAddDropdownOpen: boolean;
  setIsAddDropdownOpen: (open: boolean) => void;
  openAddNewProductModal: () => void;
  openAddSystemProductModal: () => void;
  handleExportToExcel: () => void;
  isNewProductModalOpen: boolean;
  setIsNewProductModalOpen: (open: boolean) => void;
  isSystemProductModalOpen: boolean;
  setIsSystemProductModalOpen: (open: boolean) => void;
  allSystemProducts: Product["details"][] | null;
  products: Product[];
  onSuccess: () => void;
};

const StockEmptyState = ({
  searchQuery,
  setSearchQuery,
  stockFilter,
  setStockFilter,
  isAddDropdownOpen,
  setIsAddDropdownOpen,
  openAddNewProductModal,
  openAddSystemProductModal,
  handleExportToExcel,
  isNewProductModalOpen,
  setIsNewProductModalOpen,
  isSystemProductModalOpen,
  setIsSystemProductModalOpen,
  allSystemProducts,
  products,
  onSuccess,
}: StockEmptyStateProps) => {
  return (
    <section className="h-full flex flex-col">
      <StockHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setIsAddDropdownOpen(true)}
        onAddNewProduct={openAddNewProductModal}
        onAddSystemProduct={openAddSystemProductModal}
        isAddDropdownOpen={isAddDropdownOpen}
        setIsAddDropdownOpen={setIsAddDropdownOpen}
        productTypes={[]}
        selectedTypes={[]}
        onToggleType={() => {}}
        onClearTypes={() => {}}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        onExportToExcel={handleExportToExcel}
        stockCounts={{ all: 0, outOfStock: 0, lowStock: 0, inStock: 0 }}
      />

      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No products in stock</p>
            <p className="text-sm mt-2">
              Use &quot;Add products&quot; to add system products or create a new product.
            </p>
          </div>
        </div>
      </div>

      <AddNewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />
      <AddSystemProductModal
        isOpen={isSystemProductModalOpen}
        onClose={() => setIsSystemProductModalOpen(false)}
        systemProducts={allSystemProducts ?? []}
        branchProducts={products}
        onSuccess={onSuccess}
      />
    </section>
  );
};

export default StockEmptyState;
