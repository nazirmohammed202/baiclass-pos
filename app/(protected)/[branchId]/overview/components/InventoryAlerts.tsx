"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Archive,
  Package,
} from "lucide-react";

type AlertItem = { name: string; qty: number; capacity?: number };

type InventoryAlertsProps = {
  lowStock: AlertItem[];
  outOfStock: AlertItem[];
  fastMoving: AlertItem[];
  deadStock: AlertItem[];
};

const FAKE_DATA: InventoryAlertsProps = {
  lowStock: [
    { name: "Dangote Cement 50kg", qty: 3, capacity: 50 },
    { name: "Binding Wire 1kg", qty: 5, capacity: 40 },
    { name: "POP Cement 40kg", qty: 2, capacity: 30 },
    { name: "Wood Glue 500ml", qty: 4, capacity: 25 },
  ],
  outOfStock: [
    { name: "Roofing Sheet 0.55mm", qty: 0 },
    { name: "4-inch Nails 1kg", qty: 0 },
    { name: "Aluminum Window 4ft", qty: 0 },
  ],
  fastMoving: [
    { name: "Dangote Cement 50kg", qty: 142, capacity: 200 },
    { name: "Iron Rod 12mm", qty: 98, capacity: 200 },
    { name: "Granite (1 Ton)", qty: 76, capacity: 200 },
    { name: "Sharp Sand (1 Ton)", qty: 63, capacity: 200 },
  ],
  deadStock: [
    { name: "Paint Roller 9-inch", qty: 24 },
    { name: "Tile Adhesive 20kg", qty: 18 },
  ],
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
    border: "border-gray-100 dark:border-neutral-700",
    badge: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-gray-300",
    bar: "bg-gray-400",
    emptyText: "No dead stock",
  },
];

export default function InventoryAlerts(props: Partial<InventoryAlertsProps>) {
  const { branchId } = useParams<{ branchId: string }>();
  const data = { ...FAKE_DATA, ...props };

  const totalAlerts = data.outOfStock.length + data.lowStock.length;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
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

      {/* Summary ribbon */}
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

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-neutral-800">
        {CATEGORIES.map(({ key, label, icon: Icon, accent, bg, bar, emptyText }) => {
          const items = data[key];
          const maxQty = Math.max(...items.map((i) => i.capacity ?? i.qty), 1);

          return (
            <div
              key={key}
              className="bg-white dark:bg-neutral-900 p-4 flex flex-col"
            >
              {/* Card header */}
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
                      <div key={item.name} className="group">
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
                            className={`h-full rounded-full transition-all duration-500 ${
                              key === "outOfStock"
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
                      href={`/${branchId}/menu/stock`}
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
