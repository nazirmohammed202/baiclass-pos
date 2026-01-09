"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { SalePopulatedType } from "@/types";
import { Eye, Edit, Trash2 } from "lucide-react";

type DropdownPosition = {
  top: number;
  left: number;
  saleId: string;
};

type SalesActionDropdownProps = {
  openDropdownId: string | null;
  dropdownPosition: DropdownPosition | null;
  sale: SalePopulatedType | null;
  deletingId: string | null;
  onView: (sale: SalePopulatedType) => void;
  onEdit: (sale: SalePopulatedType) => void;
  onDelete: (sale: SalePopulatedType) => void;
  onClose: () => void;
};

const SalesActionDropdown = ({
  openDropdownId,
  dropdownPosition,
  sale,
  deletingId,
  onView,
  onEdit,
  onDelete,
  onClose,
}: SalesActionDropdownProps) => {
  if (
    typeof document === "undefined" ||
    !openDropdownId ||
    !dropdownPosition ||
    dropdownPosition.saleId !== openDropdownId ||
    !sale
  ) {
    return null;
  }

  return createPortal(
    <div
      data-dropdown-portal
      className="fixed w-40 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-gray-200 dark:border-neutral-700 z-9999"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onView(sale);
            onClose();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Sale
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(sale);
            onClose();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Sale
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(sale);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          disabled={deletingId === sale._id}
          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          {deletingId === sale._id ? "Deleting..." : "Delete Sale"}
        </button>
      </div>
    </div>,
    document.body
  );
};

type UseDropdownPortalReturn = {
  dropdownPosition: DropdownPosition | null;
  handleButtonClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    saleId: string
  ) => void;
  handleClose: () => void;
};

export const useDropdownPortal = (
  openDropdownId: string | null,
  onClose: () => void
): UseDropdownPortalReturn => {
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null);

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    saleId: string
  ) => {
    e.stopPropagation();
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPosition({
      top: buttonRect.bottom + 4,
      left: buttonRect.right - 160, // 160 = w-40 (160px)
      saleId,
    });
  };

  const handleClose = useCallback(() => {
    setDropdownPosition(null);
    onClose();
  }, [onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const target = event.target as HTMLElement;
        if (
          !target.closest("[data-dropdown-portal]") &&
          !target.closest('button[aria-label="Actions"]')
        ) {
          setDropdownPosition(null);
          onClose();
        }
      }
    };

    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId, onClose]);

  // Clear position when dropdown closes
  // Clear position synchronously on render if dropdown is closed, instead of using an effect
  if (!openDropdownId && dropdownPosition !== null) {
    setDropdownPosition(null);
  }

  return {
    dropdownPosition,
    handleButtonClick,
    handleClose,
  };
};

export default SalesActionDropdown;
