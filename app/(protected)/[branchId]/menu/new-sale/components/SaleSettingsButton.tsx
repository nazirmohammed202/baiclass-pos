"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type SaleSettingsButtonProps = {
  showEditOnClick: boolean;
  onShowEditOnClickChange: (value: boolean) => void;
  showPriceTypeSwitch: boolean;
  onShowPriceTypeSwitchChange: (value: boolean) => void;
  showSalesTypeSwitch: boolean;
  onShowSalesTypeSwitchChange: (value: boolean) => void;
};

const SaleSettingsButton = ({
  showEditOnClick,
  onShowEditOnClickChange,
  showPriceTypeSwitch,
  onShowPriceTypeSwitchChange,
  showSalesTypeSwitch,
  onShowSalesTypeSwitchChange,
}: SaleSettingsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Sale settings"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-2 z-50"
          sideOffset={5}
          align="end"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors gap-2">
              <label
                htmlFor="show-edit-on-click"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
              >
                Show Edit Cart Item On Click
              </label>
              <button
                id="show-edit-on-click"
                onClick={() => {
                  onShowEditOnClickChange(!showEditOnClick);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  showEditOnClick
                    ? "bg-primary"
                    : "bg-gray-200 dark:bg-neutral-700"
                }`}
                role="switch"
                aria-checked={showEditOnClick}
                aria-label="Show edit cart item on click"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    showEditOnClick ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors gap-2">
              <label
                htmlFor="show-price-type-switch"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
              >
                Show Retail/Wholesale Switch
              </label>
              <button
                id="show-price-type-switch"
                onClick={() => {
                  onShowPriceTypeSwitchChange(!showPriceTypeSwitch);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  showPriceTypeSwitch
                    ? "bg-primary"
                    : "bg-gray-200 dark:bg-neutral-700"
                }`}
                role="switch"
                aria-checked={showPriceTypeSwitch}
                aria-label="Show retail/wholesale switch"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    showPriceTypeSwitch ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors gap-2">
              <label
                htmlFor="show-sales-type-switch"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
              >
                Show Cash/Credit Switch
              </label>
              <button
                id="show-sales-type-switch"
                onClick={() => {
                  onShowSalesTypeSwitchChange(!showSalesTypeSwitch);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  showSalesTypeSwitch
                    ? "bg-primary"
                    : "bg-gray-200 dark:bg-neutral-700"
                }`}
                role="switch"
                aria-checked={showSalesTypeSwitch}
                aria-label="Show cash/credit switch"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    showSalesTypeSwitch ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SaleSettingsButton;
