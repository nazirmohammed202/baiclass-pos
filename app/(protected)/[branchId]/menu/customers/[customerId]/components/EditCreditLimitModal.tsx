"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { updateCustomer } from "@/lib/customer-actions";
import { formatCurrency } from "@/lib/utils";

type EditCreditLimitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
  branchId: string;
  customerName: string;
  currentLimit: number;
};

export default function EditCreditLimitModal({
  isOpen,
  onClose,
  onSuccess,
  customerId,
  branchId,
  customerName,
  currentLimit,
}: EditCreditLimitModalProps) {
  const [limit, setLimit] = useState(currentLimit.toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        setLimit(currentLimit.toString());
      });
    }
  }, [isOpen, currentLimit]);

  if (!isOpen) return null;

  const numLimit = parseFloat(limit) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (numLimit < 0) {
      setError("Credit limit cannot be negative");
      return;
    }
    setSaving(true);
    const result = await updateCustomer(customerId, { creditLimit: numLimit }, branchId);
    setSaving(false);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error ?? "Failed to update credit limit");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Credit Limit</h2>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{customerName}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credit limit</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: {formatCurrency(currentLimit)}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
