"use client";
import React, { useState, useRef, useMemo, use, useEffect } from "react";
import { Plus } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Product } from "@/types";
import UnitSkeleton from "../../../../../../components/skeletons/unitSkeleton";
import { useStock } from "@/context/stockContext";
import AddNewProductModal from "../../../../../../components/AddNewProductModal";
import AddSystemProductModal from "../../../../../../components/AddSystemProductModal";
import { useCompany } from "@/context/companyContext";

type SearchProductsProps = {
  onSelectProduct?: (product: Product, stockItem: Product | undefined) => void;
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
};

// Component for individual product item that uses stock data
const ProductItem = ({
  product,
  onSelect,
  stockItem,
  isHighlighted,
  onMouseEnter,
  isStockLoading,
}: {
  product: Product;
  onSelect: (product: Product) => void;
  stockMap: Map<string, Product>;
  stockItem: Product | undefined;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  isStockLoading?: boolean;
}) => {
  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={onMouseEnter}
      className={`p-2.5 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer border border-gray-200 dark:border-neutral-800 transition-colors uppercase last:border-b-0 flex items-start justify-between gap-4 ${isHighlighted ? "bg-gray-100 dark:bg-neutral-800" : ""
        }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
          {product.details.manufacturer}
        </p>
        <p className="">
          {product.details.name}
          {product.details.nickname && (
            <span className="text-gray-500 ml-2">
              ({product.details.nickname})
            </span>
          )}
        </p>
        {product.details.size && (
          <p className="text-sm text-gray-500 mt-1">• {product.details.size}</p>
        )}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 shrink-0 ">
        {isStockLoading ||
          (stockItem?.wholesalePrice === undefined &&
            stockItem?.retailPrice === undefined) ? (
          <UnitSkeleton />
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start gap-1">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Wholesale:{" "}
              </p>
              <p className="font-medium">
                ₵{stockItem?.wholesalePrice?.toFixed(2) ?? "—"}
              </p>
            </div>

            <div className="flex flex-col items-start gap-1">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Retail:{" "}
              </p>
              <p className="font-medium">
                ₵{stockItem?.retailPrice?.toFixed(2) ?? "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchProducts = ({
  onSelectProduct,
  products: productsPromise,
  stockData: stockDataPromise,
}: SearchProductsProps) => {
  const productsData = use(productsPromise);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isSystemProductModalOpen, setIsSystemProductModalOpen] =
    useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const {
    stockMap,
    setStockMap,
    setIsStockLoading: setGlobalStockLoading,
  } = useStock();

  // Load stock data asynchronously without blocking
  useEffect(() => {
    stockDataPromise.then((stock) => {
      const map = new Map<string, Product>();
      stock.forEach((item) => map.set(item._id, item));
      setStockMap(map);
      setIsStockLoading(false);
      setGlobalStockLoading(false);
    });
  }, [setStockMap, stockDataPromise, setGlobalStockLoading]);

  // Auto-focus input when component mounts
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() === "") {
      return productsData || [];
    }
    const query = searchQuery.toLowerCase();
    return (productsData || []).filter(
      (product) =>
        product.details.name.toLowerCase().includes(query) ||
        product.details.nickname?.toLowerCase().includes(query) ||
        product.details.manufacturer?.toLowerCase().includes(query)
    );
  }, [searchQuery, productsData]);

  const handleFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking inside the dropdown
    if (
      dropdownRef.current &&
      dropdownRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectProduct = (product: Product) => {
    setSearchQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onSelectProduct) {
      const stockItem = stockMap.get(product.details._id);
      onSelectProduct(product, stockItem);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredProducts.length === 0) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredProducts.length - 1 ? prev + 1 : 0;
          // Scroll into view
          setTimeout(() => {
            itemRefs.current[next]?.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          }, 0);
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredProducts.length - 1;
          // Scroll into view
          setTimeout(() => {
            itemRefs.current[next]?.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          }, 0);
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredProducts.length
        ) {
          handleSelectProduct(filteredProducts[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative w-full">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="text"
        placeholder="Search products, items..."
        value={searchQuery}
        onChange={(e) => {
          const newQuery = e.target.value;
          setSearchQuery(newQuery);
          setHighlightedIndex(-1);
          itemRefs.current = [];
          // Open dropdown when user types or when there are products to show
          setIsOpen(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full pl-12 pr-12 py-2 rounded-full bg-background"
      />

      <DropdownMenu.Root
        open={isAddDropdownOpen}
        onOpenChange={setIsAddDropdownOpen}
      >
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors z-10"
            aria-label="Add product"
          >
            <Plus className="w-4 h-4" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[200px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-1 z-50"
            sideOffset={5}
            align="end"
          >
            <DropdownMenu.Item
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800"
              onSelect={() => {
                setIsNewProductModalOpen(true);
                setIsAddDropdownOpen(false);
              }}
            >
              Add New Product
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800"
              onSelect={() => {
                setIsSystemProductModalOpen(true);
                setIsAddDropdownOpen(false);
              }}
            >
              Add System Product
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {isOpen && filteredProducts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 max-h-96 overflow-y-auto z-50 p-3"
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur
        >
          {filteredProducts.map((product, index) => (
            <div
              key={product.details._id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
            >
              <ProductItem
                product={product}
                onSelect={handleSelectProduct}
                stockMap={stockMap}
                stockItem={stockMap.get(product.details._id)}
                isHighlighted={highlightedIndex === index}
                onMouseEnter={() => setHighlightedIndex(index)}
                isStockLoading={isStockLoading}
              />
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredProducts.length === 0 && searchQuery.trim() !== "" && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-4 z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No products found
          </div>
        </div>
      )}

      <AddNewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />

      <AddSystemProductModal
        isOpen={isSystemProductModalOpen}
        onClose={() => {
          setIsSystemProductModalOpen(false);
        }}
        systemProducts={useCompany().allSystemProducts || []}
        branchProducts={productsData}
      />
    </div>
  );
};

export default SearchProducts;
