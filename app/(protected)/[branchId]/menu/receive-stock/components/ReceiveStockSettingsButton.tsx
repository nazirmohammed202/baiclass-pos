"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Settings } from "lucide-react";
import { BranchType } from "@/types";

type ReceiveStockSettingsButtonProps = {
  showEditOnClick: boolean;
  onShowEditOnClickChange: (value: boolean) => void;
  showPaymentTypeSwitch: boolean;
  onShowPaymentTypeSwitchChange: (value: boolean) => void;
  autoCalcWholesale: boolean;
  onAutoCalcWholesaleChange: (value: boolean) => void;
  autoCalcRetail: boolean;
  onAutoCalcRetailChange: (value: boolean) => void;
  roundWholesale: boolean;
  onRoundWholesaleChange: (value: boolean) => void;
  roundRetail: boolean;
  onRoundRetailChange: (value: boolean) => void;
  branchSettings?: BranchType["settings"];
};

const CheckIcon = () => (
  <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </div>
);

const ReceiveStockSettingsButton = ({
  showEditOnClick,
  onShowEditOnClickChange,
  showPaymentTypeSwitch,
  onShowPaymentTypeSwitchChange,
  autoCalcWholesale,
  onAutoCalcWholesaleChange,
  autoCalcRetail,
  onAutoCalcRetailChange,
  roundWholesale,
  onRoundWholesaleChange,
  roundRetail,
  onRoundRetailChange,
  branchSettings,
}: ReceiveStockSettingsButtonProps) => {
  const showWholesaleSettings = branchSettings?.wholesaleEnabled;
  const showRetailSettings = branchSettings?.retailEnabled;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[260px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-2 z-50 max-h-[400px] overflow-y-auto"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            General
          </DropdownMenu.Label>

          <DropdownMenu.CheckboxItem
            className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 flex items-center justify-between"
            checked={showEditOnClick}
            onCheckedChange={onShowEditOnClickChange}
          >
            <span>Edit on Click</span>
            <DropdownMenu.ItemIndicator>
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.CheckboxItem
            className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 flex items-center justify-between"
            checked={showPaymentTypeSwitch}
            onCheckedChange={onShowPaymentTypeSwitchChange}
          >
            <span>Show Cash/Credit Switch</span>
            <DropdownMenu.ItemIndicator>
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
          </DropdownMenu.CheckboxItem>

          {/* Wholesale Price Settings */}
          {showWholesaleSettings && (
            <>
              <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-neutral-700 my-2" />
              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Wholesale Price
                {branchSettings?.wholesalePricePercentage !== undefined && (
                  <span className="ml-1 text-gray-400">
                    (+{(branchSettings.wholesalePricePercentage * 100).toFixed(0)}%)
                  </span>
                )}
              </DropdownMenu.Label>

              <DropdownMenu.CheckboxItem
                className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 flex items-center justify-between"
                checked={autoCalcWholesale}
                onCheckedChange={onAutoCalcWholesaleChange}
              >
                <span>Auto Calculate</span>
                <DropdownMenu.ItemIndicator>
                  <CheckIcon />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>

              <DropdownMenu.CheckboxItem
                className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 flex items-center justify-between"
                checked={roundWholesale}
                onCheckedChange={onRoundWholesaleChange}
              >
                <span>Round to Whole Number</span>
                <DropdownMenu.ItemIndicator>
                  <CheckIcon />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>
            </>
          )}

          {/* Retail Price Settings */}
          {showRetailSettings && (
            <>
              <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-neutral-700 my-2" />
              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Retail Price
                {branchSettings?.retailPricePercentage !== undefined && (
                  <span className="ml-1 text-gray-400">
                    (+{(branchSettings.retailPricePercentage * 100).toFixed(0)}%)
                  </span>
                )}
              </DropdownMenu.Label>

              <DropdownMenu.CheckboxItem
                className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 flex items-center justify-between"
                checked={autoCalcRetail}
                onCheckedChange={onAutoCalcRetailChange}
              >
                <span>Auto Calculate</span>
                <DropdownMenu.ItemIndicator>
                  <CheckIcon />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>

              <DropdownMenu.CheckboxItem
                className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 flex items-center justify-between"
                checked={roundRetail}
                onCheckedChange={onRoundRetailChange}
              >
                <span>Round to Whole Number</span>
                <DropdownMenu.ItemIndicator>
                  <CheckIcon />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ReceiveStockSettingsButton;
