"use client";

import React, { useEffect, useState, useTransition } from "react";

type SaleSwitchesProps = {
  priceType: "retail" | "wholesale";
  onPriceTypeChange: (priceType: "retail" | "wholesale") => void;
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

  // Render placeholder during SSR to match initial client render
  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-start">
        {showPriceTypeSwitch && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Retail</span>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-neutral-700">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Wholesale
            </span>
          </div>
        )}
        {showSalesTypeSwitch && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Cash</span>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-neutral-700">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Credit
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-start">
      {/* Price Type Switch (Retail/Wholesale) */}
      {showPriceTypeSwitch && (
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              priceType === "wholesale"
                ? "text-gray-500 dark:text-gray-400"
                : "font-medium"
            }`}
          >
            Retail
          </span>
          <button
            onClick={() =>
              onPriceTypeChange(priceType === "retail" ? "wholesale" : "retail")
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              priceType === "wholesale"
                ? "bg-primary"
                : "bg-gray-200 dark:bg-neutral-700"
            }`}
            role="switch"
            aria-checked={priceType === "wholesale"}
            aria-label="Toggle price type"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                priceType === "wholesale" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm ${
              priceType === "retail"
                ? "text-gray-500 dark:text-gray-400"
                : "font-medium"
            }`}
          >
            Wholesale
          </span>
        </div>
      )}

      {/* Sales Type Switch (Cash/Credit) */}
      {showSalesTypeSwitch && (
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              salesType === "credit"
                ? "text-gray-500 dark:text-gray-400"
                : "font-medium"
            }`}
          >
            Cash
          </span>
          <button
            onClick={() =>
              onSalesTypeChange(salesType === "cash" ? "credit" : "cash")
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 ${
              salesType === "credit"
                ? "bg-amber-500"
                : "bg-gray-200 dark:bg-neutral-700"
            }`}
            role="switch"
            aria-checked={salesType === "credit"}
            aria-label="Toggle sales type"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                salesType === "credit" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm ${
              salesType === "cash"
                ? "text-gray-500 dark:text-gray-400"
                : "font-medium"
            }`}
          >
            Credit
          </span>
        </div>
      )}
    </div>
  );
};

export default SaleSwitches;
