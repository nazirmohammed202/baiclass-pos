"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { SupplierType } from "@/types";

type SupplierActionDropdownProps = {
  openDropdownId: string | null;
  dropdownPosition: { top: number; left: number } | null;
  supplier: SupplierType | null;
  deletingId: string | null;
  onView: (supplier: SupplierType) => void;
  onEdit: (supplier: SupplierType) => void;
  onDelete: (supplier: SupplierType) => void;
  onClose: () => void;
};

export function useDropdownPortal(
  openDropdownId: string | null,
  onClose: () => void
) {
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent, supplierId: string) => {
      e.stopPropagation();
      if (openDropdownId === supplierId) {
        onClose();
        return;
      }
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      
      // Dropdown dimensions (approximate)
      const dropdownHeight = 130; // ~3 menu items
      const dropdownWidth = 160;
      
      // Check if there's enough space below
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let top: number;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Position above the button
        top = rect.top + window.scrollY - dropdownHeight - 4;
      } else {
        // Position below the button (default)
        top = rect.bottom + window.scrollY + 4;
      }
      
      // Ensure dropdown doesn't go off the left edge
      let left = rect.right - dropdownWidth;
      if (left < 8) {
        left = 8;
      }
      
      setDropdownPosition({ top, left });
    },
    [openDropdownId, onClose]
  );

  const handleClose = useCallback(() => {
    onClose();
    setDropdownPosition(null);
  }, [onClose]);

  return { dropdownPosition, handleButtonClick, handleClose };
}

export default function SupplierActionDropdown({
  openDropdownId,
  dropdownPosition,
  supplier,
  deletingId,
  onView,
  onEdit,
  onDelete,
  onClose,
}: SupplierActionDropdownProps) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-portal]")) onClose();
    };
    if (openDropdownId) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdownId, onClose]);

  if (!openDropdownId || !dropdownPosition || !supplier) return null;

  const isDeleting = deletingId === supplier._id;

  return createPortal(
    <div
      data-dropdown-portal
      className="fixed z-50 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1"
      style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
    >
      <button
        onClick={() => { onView(supplier); onClose(); }}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
      >
        <Eye className="w-4 h-4" />
        View Profile
      </button>
      <button
        onClick={() => { onEdit(supplier); onClose(); }}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
      <button
        onClick={() => onDelete(supplier)}
        disabled={isDeleting}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete
          </>
        )}
      </button>
    </div>,
    document.body
  );
}
