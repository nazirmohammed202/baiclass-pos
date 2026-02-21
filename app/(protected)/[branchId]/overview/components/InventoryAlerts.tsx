"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, use } from "react";
import {
  ArrowRight,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Archive,
  Package,
} from "lucide-react";
import type { Product } from "@/types";

type AlertItem = { id: string; name: string; qty: number; capacity?: number };

type InventoryAlertsProps = {
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
};

const CATEGORIES = [
  {
    key: "outOfStock" as const,
    label: "Out of Stock",
    icon: XCircle,
    accent: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-100 dark:border-red-900/40",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    bar: "bg-red-500",
    emptyText: "Everything in stock",
  },
  {
    key: "lowStock" as const,
    label: "Low Stock",
    icon: AlertTriangle,
    accent: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-100 dark:border-amber-900/40",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    bar: "bg-amber-500",
    emptyText: "Stock levels healthy",
  },
  {
    key: "fastMoving" as const,
    label: "Fast Moving",
    icon: TrendingUp,
    accent: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/40",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    bar: "bg-emerald-500",
    emptyText: "No sales data yet",
  },
  {
    key: "deadStock" as const,
    label: "Dead Stock",
    icon: Archive,
    accent: "text-gray-400",
    bg: "bg-gray-50 dark:bg-neutral-800/50",
    border: "border-gray-100 dark:border-gray-900/40",
    badge: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-gray-300",
    bar: "bg-gray-400",
    emptyText: "No dead stock",
  },
];

function productDisplayName(p: Product): string {
  return p.details?.name || p.details?.manufacturer || "Product";
}

function deriveAlerts(
  products: Product[],
  stockMap: Map<string, Product>
): { outOfStock: AlertItem[]; lowStock: AlertItem[]; fastMoving: AlertItem[]; deadStock: AlertItem[] } {
  const getStock = (p: Product) => stockMap.get(p.details._id)?.stock ?? 0;
  const outOfStock: AlertItem[] = [];
  const lowStock: AlertItem[] = [];

  products.forEach((product) => {
    const stock = getStock(product);
    const threshold = product.lowStockThreshold ?? 5;
    const name = productDisplayName(product);
    const id = product.details._id;

    if (stock <= 0) {
      outOfStock.push({ id, name, qty: 0 });
    } else if (stock <= threshold) {
      lowStock.push({ id, name, qty: stock, capacity: threshold });
    }
  });

  return {
    outOfStock,
    lowStock,
    fastMoving: [], // No sales velocity data from branch products/stock
    deadStock: [], // No dead-stock data from branch products/stock
  };
}

export function InventoryAlertsFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-neutral-700" />
          <div className="space-y-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 rounded" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>
        <div className="h-8 w-28 bg-gray-200 dark:bg-neutral-700 rounded-full" />
      </div>
      <div className="flex gap-3 px-5 py-3 bg-gray-50/50 dark:bg-neutral-800/30 border-b border-gray-100 dark:border-neutral-800">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 w-24 bg-gray-200 dark:bg-neutral-700 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-neutral-800">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 p-4 space-y-2">
            <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 rounded" />
            <div className="h-3 w-full bg-gray-100 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-3/4 bg-gray-100 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InventoryAlerts({ products: productsPromise, stockData: stockDataPromise }: InventoryAlertsProps) {
  const { branchId } = useParams<{ branchId: string }>();
  const products = use(productsPromise);
  const stockData = use(stockDataPromise);

  const stockMap = useMemo(() => {
    const map = new Map<string, Product>();
    stockData.forEach((item) => map.set(item._id, item));
    return map;
  }, [stockData]);

  const data = useMemo(() => deriveAlerts(products, stockMap), [products, stockMap]);

  const totalAlerts = data.outOfStock.length + data.lowStock.length;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Inventory Alerts
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalAlerts > 0
                ? `${totalAlerts} item${totalAlerts > 1 ? "s" : ""} need attention`
                : "All clear"}
            </p>
          </div>
        </div>
        <Link
          href={`/${branchId}/menu/stock`}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10"
        >
          Manage Stock <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-3 px-5 py-3 bg-gray-50/50 dark:bg-neutral-800/30 border-b border-gray-100 dark:border-neutral-800 overflow-x-auto">
        {CATEGORIES.map(({ key, label, badge, icon: Icon }) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${badge}`}
          >
            <Icon className="w-3 h-3" />
            {data[key].length} {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-neutral-800">
        {CATEGORIES.map(({ key, label, icon: Icon, accent, bg, bar, emptyText }) => {
          const items = data[key];
          const maxQty = Math.max(...items.map((i) => i.capacity ?? i.qty), 1);

          return (
            <div
              key={key}
              className="bg-white dark:bg-neutral-900 p-4 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${accent}`} />
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {label}
                </p>
              </div>

              {items.length === 0 ? (
                <div className={`flex-1 flex items-center justify-center rounded-lg ${bg} p-6`}>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    {emptyText}
                  </p>
                </div>
              ) : (
                <div className="flex-1 space-y-2.5">
                  {items.slice(0, 4).map((item) => {
                    const pct =
                      key === "fastMoving"
                        ? (item.qty / maxQty) * 100
                        : key === "outOfStock"
                          ? 100
                          : item.capacity
                            ? (item.qty / item.capacity) * 100
                            : 30;

                    return (
                      <div key={item.id} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate pr-2">
                            {item.name}
                          </p>
                          <span className="text-[11px] font-semibold tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                            {key === "fastMoving"
                              ? `${item.qty} sold`
                              : key === "outOfStock"
                                ? "0 left"
                                : `${item.qty} left`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${key === "outOfStock"
                              ? "bg-red-500 animate-pulse"
                              : bar
                              }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {items.length > 4 && (
                    <Link
                      href={`/${branchId}/menu/stock?category=${key}`}
                      className="inline-block text-[11px] font-medium text-primary hover:underline mt-1"
                    >
                      +{items.length - 4} more items
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
