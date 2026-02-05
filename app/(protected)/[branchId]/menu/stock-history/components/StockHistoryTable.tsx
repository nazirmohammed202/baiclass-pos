"use client";

import React, { useState, useRef } from "react";
import { InventoryHistoryType } from "@/types";
import { formatDateToDisplay } from "@/lib/date-utils";
import { MoreVertical, RotateCcw } from "lucide-react";
import { useStockHistory } from "@/context/stockHistoryContext";
import { useParams } from "next/navigation";
import StockHistoryTableSkeleton from "./StockHistoryTableSkeleton";
import ViewInventoryModal from "./ViewInventoryModal";
import { useStockHistoryActions } from "../hooks/useStockHistoryActions";
import { formatCurrency } from "@/lib/utils";
import StockHistoryActionDropdown, {
  useDropdownPortal,
} from "./StockHistoryActionDropdown";
import Pagination from "./Pagination";
import DeleteInventoryModal from "./DeleteInventoryModal";
import { useToast } from "@/context/toastContext";

const StockHistoryTable = () => {
  const branchId = useParams().branchId;
  const { stockHistory, loading, pagination, limit, setLimit } =
    useStockHistory();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingInventory, setViewingInventory] =
    useState<InventoryHistoryType | null>(null);
  const [deleteInventoryModal, setDeleteInventoryModal] =
    useState<InventoryHistoryType | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const {
    handleEditInventory,
    handleDeleteInventory,
    confirmDeleteInventory,
    loadPage,
  } = useStockHistoryActions({
    branchId: branchId as string,
    setDeletingId,
    setOpenDropdownId,
    onDeleteRequest: (inventory) => {
      setDeleteInventoryModal(inventory);
      setOpenDropdownId(null);
    },
  });
  const { error: toastError, success: toastSuccess } = useToast();

  const { dropdownPosition, handleButtonClick, handleClose } =
    useDropdownPortal(openDropdownId, () => setOpenDropdownId(null));

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.pages &&
      newPage !== pagination.page
    ) {
      loadPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    loadPage(1);
  };

  const selectedInventory = stockHistory.find((s) => s._id === openDropdownId);

  if (loading) {
    return <StockHistoryTableSkeleton />;
  }

  if (stockHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No stock receipts found</p>
          <p className="text-sm mt-2">
            Try adjusting your filters or date range
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Received By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {stockHistory.map((inventory) => (
              <tr
                key={inventory._id}
                className={`hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${inventory.reversed ? "opacity-60" : ""
                  }`}
                onClick={() => setViewingInventory(inventory)}
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(inventory.invoiceDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {inventory.supplier?.name || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {inventory.receivedBy?.name || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {inventory.products.length} item
                  {inventory.products.length !== 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(inventory.totalCost)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${inventory.paymentMethod === "momo"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                  >
                    {inventory.paymentMethod === "momo"
                      ? "Mobile Money"
                      : inventory.paymentMethod || "Cash"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${inventory.paymentType === "credit"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                  >
                    {inventory.paymentType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {inventory.reversed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <RotateCcw className="w-3 h-3" />
                      Reversed
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div
                    className="relative inline-block"
                    ref={(el) => {
                      if (inventory._id) {
                        dropdownRefs.current[inventory._id] = el;
                      }
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (inventory._id) {
                          handleButtonClick(e, inventory._id);
                          setOpenDropdownId(
                            openDropdownId === inventory._id
                              ? null
                              : inventory._id || null
                          );
                        }
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      aria-label="Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown Portal */}
      <StockHistoryActionDropdown
        openDropdownId={openDropdownId}
        dropdownPosition={dropdownPosition}
        inventory={selectedInventory || null}
        deletingId={deletingId}
        onView={(inventory) => setViewingInventory(inventory)}
        onEdit={handleEditInventory}
        onDelete={handleDeleteInventory}
        onClose={handleClose}
      />

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700">
        {stockHistory.map((inventory) => (
          <div
            key={inventory._id}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${inventory.reversed ? "opacity-60" : ""
              }`}
            onClick={() => setViewingInventory(inventory)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {inventory.supplier?.name || "Unknown Supplier"}
                  </span>
                  {inventory.reversed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <RotateCcw className="w-3 h-3" />
                      Reversed
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateToDisplay(inventory.invoiceDate)}
                </span>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Received by:{" "}
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {inventory.receivedBy?.name || "—"}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="relative"
                ref={(el) => {
                  if (inventory._id) {
                    dropdownRefs.current[inventory._id] = el;
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (inventory._id) {
                      handleButtonClick(e, inventory._id);
                      setOpenDropdownId(
                        openDropdownId === inventory._id
                          ? null
                          : inventory._id || null
                      );
                    }
                  }}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                  aria-label="Actions"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Items
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {inventory.products.length} item
                  {inventory.products.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total Cost
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(inventory.totalCost)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${inventory.paymentMethod === "momo"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
              >
                {inventory.paymentMethod === "momo"
                  ? "Mobile Money"
                  : inventory.paymentMethod || "Cash"}
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${inventory.paymentType === "credit"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
              >
                {inventory.paymentType}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View Inventory Modal */}
      <ViewInventoryModal
        inventory={viewingInventory}
        isOpen={viewingInventory !== null}
        onClose={() => setViewingInventory(null)}
      />

      {/* Delete Inventory Modal */}
      <DeleteInventoryModal
        inventory={deleteInventoryModal}
        isOpen={deleteInventoryModal !== null}
        isDeleting={deletingId === deleteInventoryModal?._id}
        onClose={() => setDeleteInventoryModal(null)}
        onConfirm={() => {
          if (deleteInventoryModal) {
            confirmDeleteInventory(
              deleteInventoryModal,
              () => {
                setDeleteInventoryModal(null);
                toastSuccess("Stock receipt deleted successfully");
              },
              () => {
                toastError("Failed to delete stock receipt");
              }
            );
          }
        }}
      />

      {/* Pagination Controls */}
      <Pagination
        pagination={pagination}
        currentItemsCount={stockHistory.length}
        loading={loading}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
};

export default StockHistoryTable;
