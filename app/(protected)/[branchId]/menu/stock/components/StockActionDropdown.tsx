"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Product } from "@/types";
import { Edit, Trash2 } from "lucide-react";

type DropdownPosition = {
  top: number;
  left: number;
  productId: string;
};

type StockActionDropdownProps = {
  openDropdownId: string | null;
  dropdownPosition: DropdownPosition | null;
  product: Product | null;
  onEditDetails: (product: Product) => void;
  onRemove: (product: Product) => void;
  onClose: () => void;
};

const StockActionDropdown = ({
  openDropdownId,
  dropdownPosition,
  product,
  onEditDetails,
  onRemove,
  onClose,
}: StockActionDropdownProps) => {
  if (
    typeof document === "undefined" ||
    !openDropdownId ||
    !dropdownPosition ||
    dropdownPosition.productId !== openDropdownId ||
    !product
  ) {
    return null;
  }

  return createPortal(
    <div
      data-dropdown-portal
      className="fixed w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-gray-200 dark:border-neutral-700 z-9999"
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
            onEditDetails(product);
            onClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit product details
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(product);
            onClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Remove product
        </button>
      </div>
    </div>,
    document.body
  );
};

export type UseStockDropdownReturn = {
  dropdownPosition: DropdownPosition | null;
  handleButtonClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    productId: string
  ) => void;
  handleClose: () => void;
};

export const useStockDropdownPortal = (
  openDropdownId: string | null,
  onClose: () => void
): UseStockDropdownReturn => {
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null);

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    productId: string
  ) => {
    e.stopPropagation();
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPosition({
      top: buttonRect.bottom + 4,
      left: Math.min(buttonRect.right - 160, window.innerWidth - 168),
      productId,
    });
  };

  const handleClose = useCallback(() => {
    setDropdownPosition(null);
    onClose();
  }, [onClose]);

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

  useEffect(() => {
    if (!openDropdownId) {
      setDropdownPosition(null);
    }
  }, [openDropdownId]);

  return {
    dropdownPosition,
    handleButtonClick,
    handleClose,
  };
};

export default StockActionDropdown;
