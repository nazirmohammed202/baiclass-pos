"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleDollarSign } from "lucide-react";
import { closeShift } from "@/lib/saleShift-actions";
import { formatCurrencyToDisplay } from "@/lib/utils";
import { useToast } from "@/context/toastContext";
import CloseShiftModal from "./CloseShiftModal";

function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export default function EndOfDayClient({ branchId }: { branchId: string }) {
  const [amountStr, setAmountStr] = useState("");
  const [closing, setClosing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  const date = useMemo(() => todayIsoDate(), []);
  const amount = Number(amountStr);
  const amountValid = amountStr.length > 0 && Number.isFinite(amount) && amount >= 0;

  const openConfirm = () => {
    if (!amountValid) {
      toastError("Enter a valid amount received");
      return;
    }
    setConfirmOpen(true);
  };

  const handleCloseShift = async () => {
    if (!amountValid) {
      toastError("Enter a valid amount received");
      return;
    }
    setClosing(true);
    const result = await closeShift(branchId, { total: amount, date });
    setClosing(false);

    if (result.success) {
      setConfirmOpen(false);
      toastSuccess("Shift closed successfully");
    } else {
      toastError(result.error ?? "Failed to close shift");
    }
  };

  return (
    <main className="p-3 sm:p-4 lg:p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              End of Day
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the total cash received today, then close the shift.
            </p>
          </div>
          <Link
            href=".."
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            Back
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">Shift date</div>
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {date}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Total amount received
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={closing}
                className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary disabled:opacity-60"
                placeholder="0.00"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Preview: {formatCurrencyToDisplay(amountValid ? amount : 0)}
              </p>
            </div>

            <button
              type="button"
              onClick={openConfirm}
              disabled={closing || !amountValid}
              className="sm:col-span-2 px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-60"
            >
              Close shift
            </button>
          </div>
        </div>
      </div>

      <CloseShiftModal
        isOpen={confirmOpen}
        isClosing={closing}
        totalReceived={amountValid ? amount : 0}
        date={date}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleCloseShift()}
      />
    </main>
  );
}

