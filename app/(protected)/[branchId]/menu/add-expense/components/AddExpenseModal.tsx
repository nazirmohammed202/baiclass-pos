"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createExpense, updateExpense } from "@/lib/expense-actions";
import { ExpenseType } from "@/types";

export type ExpenseFormPayload = {
  amount: number;
  description: string;
  date: string;
};

type AddExpenseModalProps = {
  branchId: string;
  isOpen: boolean;
  mode: "create" | "edit";
  initialValues?: {
    amount?: number;
    description?: string;
    date?: string;
  };
  expenseId?: string;
  onClose: () => void;
  onCreated?: (expense: ExpenseType) => void;
  onUpdated?: (expense: ExpenseType) => void;
};

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isoToDateInput(iso?: string) {
  if (!iso) return todayInputValue();
  const trimmed = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return todayInputValue();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AddExpenseModal({
  branchId,
  isOpen,
  mode,
  initialValues,
  expenseId,
  onClose,
  onCreated,
  onUpdated,
}: AddExpenseModalProps) {
  const [amountStr, setAmountStr] = useState("");
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState(todayInputValue());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAmountStr(
      typeof initialValues?.amount === "number" ? String(initialValues.amount) : ""
    );
    setDescription(initialValues?.description ?? "");
    setDateStr(isoToDateInput(initialValues?.date));
    setError(null);
  }, [isOpen, initialValues?.amount, initialValues?.description, initialValues?.date]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const amount = Number(amountStr);
    if (!amountStr || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    const desc = description.trim();
    if (!desc) {
      setError("Description is required");
      return;
    }
    const date = dateStr || todayInputValue();

    const payload: ExpenseFormPayload = {
      amount,
      description: desc,
      date,
    };

    if (mode === "create") {
      setSaving(true);
      setError(null);
      const result = await createExpense(branchId, payload);
      setSaving(false);
      if (result.success && result.expense) {
        onCreated?.(result.expense);
        onClose();
      } else {
        setError(result.error ?? "Failed to add expense");
      }
      return;
    }

    if (!expenseId) {
      setError("Expense ID is missing");
      return;
    }

    setSaving(true);
    setError(null);
    const result = await updateExpense(branchId, expenseId, payload);
    setSaving(false);
    if (result.success && result.expense) {
      onUpdated?.(result.expense);
      onClose();
    } else {
      setError(result.error ?? "Failed to update expense");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "edit" ? "Edit expense" : "Add expense"}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {mode === "edit" ? "Edit Expense" : "Add Expense"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          className="p-4 space-y-4"
        >
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
              {error}
            </p>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Amount *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError(null);
                }}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary disabled:opacity-60"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Date *
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  setError(null);
                }}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(null);
              }}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary disabled:opacity-60"
              placeholder="e.g. Transport, Utilities, Repairs…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {mode === "edit" ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
