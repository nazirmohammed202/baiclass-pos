"use client";

import React from "react";
import { use } from "react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { MoreVertical, Package } from "lucide-react";
import EditStockValueModal from "./EditStockValueModal";
import EditThresholdModal from "./EditThresholdModal";
import StockHeader from "./StockHeader";
import EditPriceModal from "./EditPriceModal";
import EditProductDetailsModal from "./EditProductDetailsModal";
import RemoveProductModal from "./RemoveProductModal";
import StockActionDropdown, { useStockDropdownPortal } from "./StockActionDropdown";
import StockEmptyState from "./StockEmptyState";
import { useCompany } from "@/context/companyContext";
import AddNewProductModal from "@/components/AddNewProductModal";
import AddSystemProductModal from "@/components/AddSystemProductModal";
import { useStockTable } from "../hooks/useStockTable";

type StockTableProps = {
  branchId: string;
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
};

const StockTable = ({ branchId, products: productsPromise, stockData: stockDataPromise }: StockTableProps) => {
  const { allSystemProducts } = useCompany();
  const products = use(productsPromise);

  const {
    // Data
    stockMap,
    isStockLoading,
    filteredProducts,
    productTypes,
    stockCounts,

    // Filter state & handlers
    searchQuery,
    setSearchQuery,
    selectedTypes,
    stockFilter,
    setStockFilter,
    handleToggleType,
    handleClearTypes,

    // Modal state
    stockModalProduct,
    setStockModalProduct,
    thresholdModalProduct,
    setThresholdModalProduct,
    priceModalProduct,
    setPriceModalProduct,
    priceModalField,
    detailsModalProduct,
    setDetailsModalProduct,
    removeModalProduct,
    setRemoveModalProduct,

    // Add products state
    isAddDropdownOpen,
    setIsAddDropdownOpen,
    isNewProductModalOpen,
    setIsNewProductModalOpen,
    isSystemProductModalOpen,
    setIsSystemProductModalOpen,

    // Loading state
    saving,
    removing,

    // Handlers
    handleSaveStock,
    handleSaveThreshold,
    handleSavePrice,
    handleSaveDetails,
    handleRemoveProduct,
    handleExportToExcel,
    openPriceModal,
    openAddNewProductModal,
    openAddSystemProductModal,

    // Router
    router,
  } = useStockTable({
    branchId,
    products,
    stockDataPromise,
  });

  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  const { dropdownPosition, handleButtonClick, handleClose } =
    useStockDropdownPortal(openDropdownId, () => setOpenDropdownId(null));

  const selectedProduct =
    openDropdownId != null
      ? products.find((p) => p.details._id === openDropdownId) ?? null
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  // Empty State
  // ─────────────────────────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <StockEmptyState
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        isAddDropdownOpen={isAddDropdownOpen}
        setIsAddDropdownOpen={setIsAddDropdownOpen}
        openAddNewProductModal={openAddNewProductModal}
        openAddSystemProductModal={openAddSystemProductModal}
        handleExportToExcel={handleExportToExcel}
        isNewProductModalOpen={isNewProductModalOpen}
        setIsNewProductModalOpen={setIsNewProductModalOpen}
        isSystemProductModalOpen={isSystemProductModalOpen}
        setIsSystemProductModalOpen={setIsSystemProductModalOpen}
        allSystemProducts={allSystemProducts}
        products={products}
        onSuccess={() => router.refresh()}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────────────────────────────────
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
        productTypes={productTypes}
        selectedTypes={selectedTypes}
        onToggleType={handleToggleType}
        onClearTypes={handleClearTypes}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        onExportToExcel={handleExportToExcel}
        stockCounts={stockCounts}
      />

      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  Low Stock Threshold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Base
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Wholesale
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Retail
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                  Credit
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {filteredProducts.map((product) => {
                const stockItem = stockMap.get(product.details._id);
                const stock = stockItem?.stock ?? 0;
                const basePrice = stockItem?.basePrice ? formatCurrency(stockItem.basePrice) : 0;
                const wholesale = stockItem?.wholesalePrice ? formatCurrency(stockItem.wholesalePrice) : 0;
                const retail = stockItem?.retailPrice ? formatCurrency(stockItem.retailPrice) : 0;
                const credit = stockItem?.creditPrice ? formatCurrency(stockItem.creditPrice) : 0;

                return (
                  <tr
                    key={product.details._id}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    {/* Product Details Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            {product.details.manufacturer && (
                              <p className="text-xs font-medium capitalize">
                                {product.details.manufacturer}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate mt-1 mb-1">
                                {product.details.name}
                              </p>
                              {product.details.type && (
                                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 capitalize">
                                  {product.details.type}
                                </span>
                              )}
                              {product.details.size && (
                                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 ml-1">
                                  {product.details.size}
                                </span>
                              )}
                            </div>
                            {product.details.nickname && (
                              <p className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 capitalize">
                                {product.details.nickname}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stock Column */}
                    <td
                      className={`px-4 py-3 text-sm text-right rounded transition-colors ${isStockLoading ? "" : "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
                        }`}
                      onClick={() => !isStockLoading && setStockModalProduct({
                        ...product,
                        stock
                      })}
                    >
                      {isStockLoading ? (
                        <div className="h-4 w-10 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse ml-auto" />
                      ) : (
                        <span
                          className={`inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded-full text-xs font-semibold ${stock <= 0
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : stock <= (product.lowStockThreshold ?? 5)
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              : stock <= 10
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                        >
                          {stock}
                        </span>
                      )}
                    </td>

                    {/* Threshold Column */}
                    <td
                      className={`px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 rounded transition-colors ${isStockLoading ? "" : "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
                        }`}
                      onClick={() => !isStockLoading && setThresholdModalProduct(product)}
                    >
                      {isStockLoading ? (
                        <div className="h-4 w-8 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse ml-auto" />
                      ) : (
                        product.lowStockThreshold ?? 5
                      )}
                    </td>

                    {/* Base Price Column */}
                    <td
                      className={`px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300 rounded transition-colors ${isStockLoading ? "" : "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
                        }`}
                      onClick={() =>
                        !isStockLoading &&
                        openPriceModal(
                          {
                            ...product,
                            basePrice: stockItem?.basePrice ?? product.basePrice ?? 0,
                            wholesalePrice: stockItem?.wholesalePrice ?? product.wholesalePrice ?? 0,
                            retailPrice: stockItem?.retailPrice ?? product.retailPrice ?? 0,
                          },
                          "basePrice"
                        )
                      }
                    >
                      {isStockLoading ? (
                        <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse ml-auto" />
                      ) : (
                        basePrice
                      )}
                    </td>

                    {/* Wholesale Column */}
                    <td
                      className={`px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300 rounded transition-colors ${isStockLoading ? "" : "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
                        }`}
                      onClick={() =>
                        !isStockLoading &&
                        openPriceModal(
                          {
                            ...product,
                            basePrice: stockItem?.basePrice ?? product.basePrice ?? 0,
                            wholesalePrice: stockItem?.wholesalePrice ?? product.wholesalePrice ?? 0,
                            retailPrice: stockItem?.retailPrice ?? product.retailPrice ?? 0,
                          },
                          "wholesalePrice"
                        )
                      }
                    >
                      {isStockLoading ? (
                        <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse ml-auto" />
                      ) : (
                        wholesale
                      )}
                    </td>

                    {/* Retail Column */}
                    <td
                      className={`px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 rounded transition-colors ${isStockLoading ? "" : "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
                        }`}
                      onClick={() =>
                        !isStockLoading &&
                        openPriceModal(
                          {
                            ...product,
                            basePrice: stockItem?.basePrice ?? product.basePrice ?? 0,
                            wholesalePrice: stockItem?.wholesalePrice ?? product.wholesalePrice ?? 0,
                            retailPrice: stockItem?.retailPrice ?? product.retailPrice ?? 0,
                            creditPrice: stockItem?.creditPrice ?? product.creditPrice ?? 0,
                          },
                          "retailPrice"
                        )
                      }
                    >
                      {isStockLoading ? (
                        <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse ml-auto" />
                      ) : (
                        retail
                      )}
                    </td>

                    {/* Credit Column */}
                    <td
                      className={`px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300 rounded transition-colors ${isStockLoading ? "" : "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20"
                        }`}
                      onClick={() =>
                        !isStockLoading &&
                        openPriceModal(
                          {
                            ...product,
                            basePrice: stockItem?.basePrice ?? product.basePrice ?? 0,
                            wholesalePrice: stockItem?.wholesalePrice ?? product.wholesalePrice ?? 0,
                            retailPrice: stockItem?.retailPrice ?? product.retailPrice ?? 0,
                            creditPrice: stockItem?.creditPrice ?? product.creditPrice ?? 0,
                          },
                          "creditPrice"
                        )
                      }
                    >
                      {isStockLoading ? (
                        <div className="h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse ml-auto" />
                      ) : (
                        credit
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          const id = product.details._id;
                          handleButtonClick(e, id);
                          setOpenDropdownId(openDropdownId === id ? null : id);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                        aria-label="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && searchQuery.trim() !== "" && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="font-medium">No products match &quot;{searchQuery}&quot;</p>
          </div>
        )}

        <StockActionDropdown
          openDropdownId={openDropdownId}
          dropdownPosition={dropdownPosition}
          product={selectedProduct}
          onEditDetails={setDetailsModalProduct}
          onRemove={setRemoveModalProduct}
          onClose={handleClose}
        />

        <EditStockValueModal
          isOpen={stockModalProduct != null}
          onClose={() => setStockModalProduct(null)}
          product={stockModalProduct}
          onSave={async (value) => {
            if (stockModalProduct) await handleSaveStock(stockModalProduct, value);
          }}
          saving={saving}
        />
        <EditThresholdModal
          isOpen={thresholdModalProduct != null}
          onClose={() => setThresholdModalProduct(null)}
          product={thresholdModalProduct}
          onSave={async (value) => {
            if (thresholdModalProduct) await handleSaveThreshold(thresholdModalProduct, value);
          }}
          saving={saving}
        />
        <EditPriceModal
          isOpen={priceModalProduct != null}
          onClose={() => setPriceModalProduct(null)}
          product={priceModalProduct}
          field={priceModalField}
          onSave={async (value) => {
            if (priceModalProduct) await handleSavePrice(priceModalProduct, priceModalField, value);
          }}
          saving={saving}
        />
        <EditProductDetailsModal
          isOpen={detailsModalProduct != null}
          onClose={() => setDetailsModalProduct(null)}
          product={detailsModalProduct}
          onSave={async (payload) => {
            if (detailsModalProduct) await handleSaveDetails(detailsModalProduct, payload);
          }}
          saving={saving}
        />
        <RemoveProductModal
          isOpen={removeModalProduct != null}
          onClose={() => setRemoveModalProduct(null)}
          product={removeModalProduct}
          onConfirm={async () => {
            if (removeModalProduct) await handleRemoveProduct(removeModalProduct);
          }}
          removing={removing}
        />

        <AddNewProductModal
          isOpen={isNewProductModalOpen}
          onClose={() => setIsNewProductModalOpen(false)}
        />
        <AddSystemProductModal
          isOpen={isSystemProductModalOpen}
          onClose={() => setIsSystemProductModalOpen(false)}
          systemProducts={allSystemProducts ?? []}
          branchProducts={products}
          onSuccess={() => router.refresh()}
        />
      </div>
    </section>
  );
};

export default StockTable;
