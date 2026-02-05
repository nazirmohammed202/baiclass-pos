"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";

type SupplierDropdownMenuProps = {
  onRemoveSupplier: () => void;
};

const SupplierDropdownMenu = ({ onRemoveSupplier }: SupplierDropdownMenuProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Supplier options"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-1 z-50"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className="px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer outline-none focus:bg-red-50 dark:focus:bg-red-900/20 flex items-center gap-2"
            onSelect={onRemoveSupplier}
          >
            <Trash2 className="w-4 h-4" />
            Remove Supplier
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SupplierDropdownMenu;
