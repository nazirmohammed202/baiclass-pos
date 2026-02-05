"use client";

import React, { useEffect, useState, useTransition } from "react";

type PaymentTypeSwitchProps = {
  paymentType: "cash" | "credit";
  onPaymentTypeChange: (paymentType: "cash" | "credit") => void;
  showPaymentTypeSwitch: boolean;
};

const PaymentTypeSwitch = ({
  paymentType,
  onPaymentTypeChange,
  showPaymentTypeSwitch,
}: PaymentTypeSwitchProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });
  }, [startTransition]);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-start">
        {showPaymentTypeSwitch && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Cash</span>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-neutral-700">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Credit</span>
          </div>
        )}
      </div>
    );
  }

  if (!showPaymentTypeSwitch) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm ${
          paymentType === "credit"
            ? "text-gray-500 dark:text-gray-400"
            : "font-medium"
        }`}
      >
        Cash
      </span>
      <button
        onClick={() =>
          onPaymentTypeChange(paymentType === "cash" ? "credit" : "cash")
        }
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 ${
          paymentType === "credit"
            ? "bg-amber-500"
            : "bg-gray-200 dark:bg-neutral-700"
        }`}
        role="switch"
        aria-checked={paymentType === "credit"}
        aria-label="Toggle payment type"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            paymentType === "credit" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-sm ${
          paymentType === "cash"
            ? "text-gray-500 dark:text-gray-400"
            : "font-medium"
        }`}
      >
        Credit
      </span>
    </div>
  );
};

export default PaymentTypeSwitch;
