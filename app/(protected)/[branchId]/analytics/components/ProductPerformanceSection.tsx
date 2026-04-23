"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Package, TrendingUp, TrendingDown, Archive, Info, Loader2, Search, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductPerformanceItem } from "@/types";
import type { Product } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";
import { getBranchProductsMetadata } from "@/lib/branch-actions";
import { getProductSummary } from "@/lib/analytics-action";

type ProductPerformanceSectionProps = {
  data: {
    topSelling: ProductPerformanceItem[];
    mostProfitable: ProductPerformanceItem[];
    worstPerforming: ProductPerformanceItem[];
    deadStock: ProductPerformanceItem[];
  } | null;
  loading?: boolean;
  branchId: string;
  startDate: string;
  endDate: string;
};

type ProductTab = "topSelling" | "mostProfitable" | "worstPerforming" | "deadStock";

const TABS: { key: ProductTab; label: string; icon: typeof TrendingUp; tooltip: string }[] = [
  { key: "topSelling", label: "Top Selling", icon: TrendingUp, tooltip: "Products ranked by total revenue" },
  { key: "mostProfitable", label: "Most Profitable", icon: TrendingUp, tooltip: "Products ranked by profit margin contribution" },
  { key: "worstPerforming", label: "Worst Performing", icon: TrendingDown, tooltip: "Low sales products with high stock" },
  { key: "deadStock", label: "Dead Stock", icon: Archive, tooltip: "No sales in selected period but has stock" },
];

export function ProductPerformanceFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-40 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-neutral-800 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ProductPerformanceSection({
  data,
  loading,
  branchId,
  startDate,
  endDate,
}: ProductPerformanceSectionProps) {
  const [tab, setTab] = useState<ProductTab>("topSelling");
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ProductPerformanceItem | null | "loading">(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getBranchProductsMetadata(branchId).then(setProducts).catch(() => setProducts([]));
  }, [branchId]);

  useEffect(() => {
    if (!selectedProductId || !branchId || !startDate || !endDate) {
      const t = setTimeout(() => setSummary(null), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSummary("loading"), 0);
    getProductSummary(branchId, selectedProductId, startDate, endDate)
      .then((s) => setSummary(s ?? null))
      .catch(() => setSummary(null));
    return () => clearTimeout(t);
  }, [branchId, selectedProductId, startDate, endDate]);

  const productOptions = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products.filter((p) => p.details?.name?.toLowerCase().includes(q)).slice(0, 50);
  }, [products, productSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProduct = selectedProductId
    ? products.find((p) => p.details?._id === selectedProductId)
    : null;

  if (loading && !data) return <ProductPerformanceFallback />;

  if (!data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Product Performance
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Product performance data unavailable — backend endpoint needed.
          </p>
        </div>
      </div>
    );
  }

  const items = data[tab] ?? [];
  const activeTabDef = TABS.find((t) => t.key === tab)!;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Product Performance
          </h3>
          <InfoTooltip content={activeTabDef.tooltip}>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        )}
      </div>

      {/* Product search & summary */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 space-y-3">
        <div className="relative" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search product for summary..."
            value={selectedProduct ? selectedProduct.details?.name ?? "" : productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setSearchOpen(true);
              setSelectedProductId(null);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {selectedProductId && (
            <button
              type="button"
              onClick={() => {
                setSelectedProductId(null);
                setProductSearch("");
                setSummary(null);
                setSearchOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {searchOpen && productOptions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg">
              {productOptions.map((p) => (
                <button
                  key={p.details._id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedProductId(p.details._id);
                    setProductSearch("");
                    setSearchOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-700 truncate"
                >
                  {p.details?.name ?? "Unnamed"}
                </button>
              ))}
            </div>
          )}
        </div>
        {summary === "loading" && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading summary...
          </div>
        )}
        {summary && summary !== "loading" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty sold</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">{summary.quantitySold.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(summary.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(summary.profit)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">{summary.margin.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</p>
              <p className={`text-sm font-medium tabular-nums ${summary.stock <= 0 ? "text-red-500" : "text-gray-900 dark:text-gray-100"}`}>{summary.stock}</p>
            </div>
            {summary.daysOfStockLeft != null && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days of stock</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">{summary.daysOfStockLeft}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-neutral-700 overflow-x-auto bg-gray-50 dark:bg-neutral-800/50">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer relative ${tab === key
              ? "text-primary bg-white dark:bg-neutral-900"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span
              className={`ml-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${tab === key
                ? "bg-primary/10 text-primary"
                : "bg-gray-200 dark:bg-neutral-700 text-gray-400"
                }`}
            >
              {(data[key] ?? []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">No products in this category</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty Sold</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {items.slice(0, 15).map((product, i) => (
                <tr
                  key={product.productId}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{i + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {product.name}
                    {product.category && (
                      <span className="ml-2 text-[11px] text-gray-400 dark:text-gray-500">{product.category}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {product.quantitySold.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatCurrency(product.profit)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                    {product.margin.toFixed(1)}%
                  </td>
                  <td className={`px-4 py-3 text-sm text-right tabular-nums ${product.stock <= 0 ? "text-red-500 font-medium" : "text-gray-600 dark:text-gray-400"
                    }`}>
                    {product.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
