"use client";

import React, { useEffect, useState, useCallback } from "react";
import { InventoryHistoryType } from "@/types";
import { getTodayInventory } from "@/lib/inventory-actions";
import { formatCurrency } from "@/lib/utils";
import { X, Eye, Edit, Loader2, RotateCcw } from "lucide-react";
import { useParams } from "next/navigation";
import ViewInventoryModal from "./ViewInventoryModal";

type RecentStockHistorySidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditInventory: (inventoryId: string) => void;
};

const RecentStockHistorySidebar = ({
  isOpen,
  onClose,
  onEditInventory,
}: RecentStockHistorySidebarProps) => {
  const params = useParams();
  const branchId = params.branchId as string;
  const [inventories, setInventories] = useState<InventoryHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingInventory, setViewingInventory] =
    useState<InventoryHistoryType | null>(null);

  const fetchTodayInventory = useCallback(async () => {
    if (!isOpen || !branchId) return;

    setLoading(true);
    try {
      const data = await getTodayInventory(branchId);
      setInventories(data ?? []);
    } catch (error) {
      console.error("Failed to fetch today's stock receipts:", error);
      setInventories([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, branchId]);

  useEffect(() => {
    fetchTodayInventory();
  }, [fetchTodayInventory]);

  const handleEdit = (inventory: InventoryHistoryType) => {
    onEditInventory(inventory._id);
    onClose();
  };

  const formatTime = (dateString: string | Date | undefined): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-neutral-900 
          border-l border-gray-200 dark:border-neutral-800 
          shadow-xl z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Today&apos;s Stock Receipts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : inventories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No stock receipts found for today
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-neutral-800">
              {inventories.map((inventory) => (
                <div
                  key={inventory._id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors ${inventory.reversed ? "opacity-60" : ""
                    }`}
                >
                  {/* Receipt Header */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {inventory.supplier?.name || "No supplier"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(inventory.invoiceDate)}
                      </span>
                    </div>
                  </div>

                  {/* Receipt Details */}
                  <div className="space-y-1 mb-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>Received by: </span>
                      <span className="font-medium">
                        {inventory.receivedBy?.name || "—"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>Items: </span>
                      <span className="font-medium">
                        {inventory.products.length}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Status: </span>
                      {inventory.reversed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          <RotateCcw className="w-3 h-3" />
                          Reversed
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(inventory.totalCost)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingInventory(inventory)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center gap-1"
                      title="View Receipt"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(inventory)}
                      disabled={inventory.reversed}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit Receipt"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Inventory Modal */}
      <ViewInventoryModal
        inventory={viewingInventory}
        isOpen={viewingInventory !== null}
        onClose={() => setViewingInventory(null)}
      />
    </>
  );
};

export default RecentStockHistorySidebar;
