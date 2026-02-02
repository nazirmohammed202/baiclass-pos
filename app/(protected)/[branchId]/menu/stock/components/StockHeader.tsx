"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, X, Download, AlertTriangle, PackageX, Package, Filter } from "lucide-react";

export type StockFilterType = "all" | "out_of_stock" | "low_stock" | "in_stock";

type StockHeaderProps = {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onAddClick: () => void;
  onAddNewProduct: () => void;
  onAddSystemProduct: () => void;
  isAddDropdownOpen: boolean;
  setIsAddDropdownOpen: (v: boolean) => void;
  productTypes: string[];
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  onClearTypes: () => void;
  stockFilter: StockFilterType;
  onStockFilterChange: (filter: StockFilterType) => void;
  onExportToExcel: () => void;
  stockCounts: {
    all: number;
    outOfStock: number;
    lowStock: number;
    inStock: number;
  };
};

const STOCK_FILTERS: {
  id: StockFilterType;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
}[] = [
    {
      id: "all",
      label: "All",
      icon: <Package className="w-3.5 h-3.5" />,
      colorClass: "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300",
    },
    {
      id: "out_of_stock",
      label: "Out of Stock",
      icon: <PackageX className="w-3.5 h-3.5" />,
      colorClass: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    },
    {
      id: "low_stock",
      label: "Low Stock",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      colorClass: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    },
    {
      id: "in_stock",
      label: "In Stock",
      icon: <Package className="w-3.5 h-3.5" />,
      colorClass: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    },
  ];

const StockHeader = ({
  searchQuery,
  onSearchChange,
  onAddClick,
  onAddNewProduct,
  onAddSystemProduct,
  isAddDropdownOpen,
  setIsAddDropdownOpen,
  productTypes,
  selectedTypes,
  onToggleType,
  onClearTypes,
  stockFilter,
  onStockFilterChange,
  onExportToExcel,
  stockCounts,
}: StockHeaderProps) => {
  const getFilterCount = (filterId: StockFilterType) => {
    switch (filterId) {
      case "all":
        return stockCounts.all;
      case "out_of_stock":
        return stockCounts.outOfStock;
      case "low_stock":
        return stockCounts.lowStock;
      case "in_stock":
        return stockCounts.inStock;
      default:
        return 0;
    }
  };

  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold mb-2">Products & Stock Management</h1>
      <div className="flex-1 min-w-0 flex gap-2">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
            type="text"
            placeholder="Search products, nicknames, manufacturers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-lg bg-white pl-10 pr-4 py-2 border border-gray-200
            dark:bg-neutral-900 dark:border-neutral-800 rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="button"
          onClick={onExportToExcel}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          title="Export to Excel"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        <DropdownMenu.Root open={isAddDropdownOpen} onOpenChange={setIsAddDropdownOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              onClick={onAddClick}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add products
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-1 z-50"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none"
                onSelect={onAddNewProduct}
              >
                Add New Product
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none"
                onSelect={onAddSystemProduct}
              >
                Add System Product
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Stock Status Filter */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 inline-flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Stock status:
        </span>
        {STOCK_FILTERS.map((filter) => {
          const isSelected = stockFilter === filter.id;
          const count = getFilterCount(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => onStockFilterChange(filter.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${isSelected
                ? `${filter.colorClass} ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500`
                : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 cursor-pointer"
                }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isSelected
                ? "bg-white/30 dark:bg-black/20"
                : "bg-gray-200 dark:bg-neutral-700"
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Type Filter Chips */}
      {productTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Filter by type:</span>
          {productTypes.map((type) => {
            const isSelected = selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => onToggleType(type)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${isSelected
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                  }`}
              >
                <span className="capitalize">{type}</span>
              </button>
            );
          })}
          {selectedTypes.length > 0 && (
            <button
              onClick={onClearTypes}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StockHeader;
