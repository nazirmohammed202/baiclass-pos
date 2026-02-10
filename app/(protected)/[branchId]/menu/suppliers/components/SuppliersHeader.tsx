"use client";

import { Search, UserPlus, Printer, Download } from "lucide-react";
import { useState } from "react";
import AddSupplierModal from "./AddSupplierModal";

type SuppliersHeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddSupplier: () => void;
  branchId: string;
  showOnlyDebtors: boolean;
  onShowOnlyDebtorsChange: (value: boolean) => void;
  onPrint: () => void;
  onExport: () => void;
};

export default function SuppliersHeader({
  searchQuery,
  onSearchChange,
  onAddSupplier,
  branchId,
  showOnlyDebtors,
  onShowOnlyDebtorsChange,
  onPrint,
  onExport,
}: SuppliersHeaderProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200 dark:border-neutral-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Suppliers
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium"
            title="Print"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={showOnlyDebtors}
            onChange={(e) => onShowOnlyDebtorsChange(e.target.checked)}
            className="rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show only debtors</span>
        </label>
      </div>
      <AddSupplierModal
        branchId={branchId}
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          onAddSupplier();
        }}
      />
    </div>
  );
}
