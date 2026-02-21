"use client";
import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type CustomerDropdownMenuProps = {
  onRemoveCustomer?: () => void;
  onAddNewCustomer?: () => void;
};

const CustomerDropdownMenu = ({
  onRemoveCustomer,
  onAddNewCustomer,
}: CustomerDropdownMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Customer options"
        >
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-1 z-50"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800"
            onSelect={() => {
              if (onAddNewCustomer) {
                onAddNewCustomer();
              }
              setOpen(false);
            }}
          >
            Add New Customer
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800"
            onSelect={() => {
              if (onRemoveCustomer) {
                onRemoveCustomer();
              }
              setOpen(false);
            }}
          >
            Remove Customer
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CustomerDropdownMenu;
