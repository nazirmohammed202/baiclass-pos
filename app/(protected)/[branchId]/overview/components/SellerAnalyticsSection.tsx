import { User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { SalePopulatedType } from "@/types";
import RecentSalesList from "./RecentSalesList";

type SellerAnalyticsSectionProps = {
  accountName: string;
  accountPhone: string;
  productsSold: number;
  averageSale: number;
  ePay: number;
  totalPaymentsReceived: number;
  recentSales: SalePopulatedType[];
};

export default function SellerAnalyticsSection({
  accountName,
  accountPhone,
  productsSold,
  averageSale,
  ePay,
  totalPaymentsReceived,
  recentSales,
}: SellerAnalyticsSectionProps) {
  return (
    <div className="lg:w-1/4 bg-white dark:bg-neutral-900 rounded-lg p-5 flex flex-col">
      {/* Account header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {accountName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {accountPhone}
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="py-4 space-y-3 border-b border-gray-100 dark:border-neutral-800">
        <MetricRow label="Products Sold" value={productsSold.toLocaleString()} />
        <MetricRow label="Avg. Sale" value={formatCurrency(averageSale)} />
        <MetricRow label="E-Payments" value={formatCurrency(ePay)} />
        <MetricRow label="Debt Payments Received" value={formatCurrency(totalPaymentsReceived)} />
      </div>



      <RecentSalesList sales={recentSales.slice(0, 1)} />
    </div>
  );
}

function MetricRow({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-sm font-bold ${colorClass ?? "text-gray-900 dark:text-gray-100"}`}
      >
        {value}
      </p>
    </div>
  );
}
