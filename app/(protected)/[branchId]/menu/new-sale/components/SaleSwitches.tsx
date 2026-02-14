"use client";

import React, { useEffect, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PriceType } from "@/types";

type SaleSwitchesProps = {
  priceType: PriceType;
  onPriceTypeChange: (priceType: PriceType) => void;
  salesType: "cash" | "credit";
  onSalesTypeChange: (salesType: "cash" | "credit") => void;
  showPriceTypeSwitch: boolean;
  showSalesTypeSwitch: boolean;
};

const SaleSwitches = ({
  priceType,
  onPriceTypeChange,
  salesType,
  onSalesTypeChange,
  showPriceTypeSwitch,
  showSalesTypeSwitch,
}: SaleSwitchesProps) => {
  // Prevent hydration mismatch by only rendering after mount
  const [isMounted, setIsMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });
  }, [startTransition]);

  // Only show credit price option when invoice type is credit
  const priceTypeOptions: { value: PriceType; label: string }[] =
    salesType === "credit"
      ? [
        { value: "retail", label: "Retail" },
        { value: "wholesale", label: "Wholesale" },
        { value: "credit", label: "Credit" },
      ]
      : [
        { value: "retail", label: "Retail" },
        { value: "wholesale", label: "Wholesale" },
      ];

  const salesTypeOptions: { value: "cash" | "credit"; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "credit", label: "Credit" },
  ];

  // Render placeholder during SSR to match initial client render
  if (!isMounted) {
    return (
      <div className="flex items-center gap-2">
        {showPriceTypeSwitch && (
          <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-neutral-800 p-1">
            <div className="px-3 py-1.5 text-sm rounded-md bg-white dark:bg-neutral-700 font-medium">
              Retail
            </div>
            <div className="px-3 py-1.5 text-sm rounded-md text-gray-500 dark:text-gray-400">
              Wholesale
            </div>
          </div>
        )}
        {showSalesTypeSwitch && (
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
            aria-label="Invoice type"
          >
            Cash
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Price Type Switch - always visible when enabled */}
      {showPriceTypeSwitch && (
        <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-neutral-800 p-1">
          {priceTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onPriceTypeChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${priceType === option.value
                  ? option.value === "credit"
                    ? "bg-amber-500 text-white font-medium shadow-sm"
                    : "bg-white dark:bg-neutral-700 font-medium shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              aria-pressed={priceType === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Sales Type - in dropdown */}
      {showSalesTypeSwitch && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${salesType === "credit"
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200"
                  : "bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                }`}
              aria-label="Invoice type"
            >
              <span className="font-medium">{salesType === "credit" ? "Credit" : "Cash"}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[120px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-1 z-50"
              sideOffset={6}
              align="end"
            >
              {salesTypeOptions.map((option) => (
                <DropdownMenu.Item
                  key={option.value}
                  onSelect={() => onSalesTypeChange(option.value)}
                  className={`flex items-center justify-center px-3 py-2 text-sm rounded-md cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 ${salesType === option.value
                      ? option.value === "credit"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-medium"
                        : "bg-gray-100 dark:bg-neutral-800 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {option.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
};

export default SaleSwitches;
