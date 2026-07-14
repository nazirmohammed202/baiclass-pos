"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Edit, RotateCcw, Loader2 } from "lucide-react";
import { InventoryHistoryType } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";

type ProcurementActionDropdownProps = {
  openDropdownId: string | null;
  dropdownPosition: { top: number; left: number } | null;
  procurement: InventoryHistoryType | null;
  deletingId: string | null;
  onView: (procurement: InventoryHistoryType) => void;
  onEdit: (procurement: InventoryHistoryType) => void;
  onDelete: (procurement: InventoryHistoryType) => void;
  onClose: () => void;
};

export const useDropdownPortal = (
  openDropdownId: string | null,
  onClose: () => void
) => {
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (openDropdownId === id) {
        onClose();
        return;
      }
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const dropdownWidth = 176;
      let left = rect.right - dropdownWidth;
      if (left < 8) left = 8;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      setDropdownPosition({
        top: rect.bottom + 4,
        left,
      });
    },
    [openDropdownId, onClose]
  );

  const handleClose = useCallback(() => {
    onClose();
    setDropdownPosition(null);
  }, [onClose]);

  return { dropdownPosition, handleButtonClick, handleClose };
};

const ProcurementActionDropdown = ({
  openDropdownId,
  dropdownPosition,
  procurement,
  deletingId,
  onView,
  onEdit,
  onDelete,
  onClose,
}: ProcurementActionDropdownProps) => {
  const { canPerform } = usePermissions();
  const canUpdateReceipt = canPerform("inventoryReceiptUpdate");
  const canVoidReceipt = canPerform("inventoryReceiptVoid");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-portal]")) {
        onClose();
      }
    };

    if (openDropdownId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdownId, onClose]);

  if (!openDropdownId || !dropdownPosition || !procurement) {
    return null;
  }

  const isDeleting = deletingId === procurement._id;
  const isReversed = procurement.reversed === true;
  const canEdit = !isReversed && canUpdateReceipt;
  const canReverse = !isReversed && canVoidReceipt;

  const disabledClass =
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  return createPortal(
    <div
      data-dropdown-portal
      className="fixed z-50 w-44 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onView(procurement);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
      {canUpdateReceipt && (
        <button
          onClick={() => {
            if (!canEdit) return;
            onEdit(procurement);
            onClose();
          }}
          disabled={!canEdit}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors ${disabledClass}`}
        >
          <Edit className="w-4 h-4" />
          {isReversed ? "Already reversed" : "Edit Receipt"}
        </button>
      )}
      {canVoidReceipt && (
        <button
          onClick={() => {
            if (!canReverse || isDeleting) return;
            onDelete(procurement);
          }}
          disabled={isDeleting || !canReverse}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${disabledClass}`}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reversing...
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              {canReverse ? "Reverse Receipt" : "Already reversed"}
            </>
          )}
        </button>
      )}
    </div>,
    document.body
  );
};

export default ProcurementActionDropdown;
