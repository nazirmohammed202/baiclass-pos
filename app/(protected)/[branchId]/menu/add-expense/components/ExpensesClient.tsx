"use client";

import React, { use, useMemo, useState } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DollarSign, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { formatTimestampToDisplay } from "@/lib/date-utils";
import { formatCurrencyToDisplay } from "@/lib/utils";
import AddExpenseModal from "./AddExpenseModal";
import { ExpenseType } from "@/types";

function getExpenseId(expense: ExpenseType): string {
  return expense.id ?? expense._id ?? "";
}

function getExpenseDateIso(expense: ExpenseType): string {
  return expense.date ?? expense.createdAt ?? "";
}

export default function ExpensesClient({
  branchId,
  initialExpensesPromise,
}: {
  branchId: string;
  initialExpensesPromise: Promise<ExpenseType[]>;
}) {
  const initialExpenses = use(initialExpensesPromise);
  const [expenses, setExpenses] = useState<ExpenseType[]>(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseType | null>(null);

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (expense: ExpenseType) => {
    setEditing(expense);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => getExpenseId(e) !== id));
  };

  return (
    <main className="p-3 sm:p-4 lg:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Expenses
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track expenses for the current shift/day.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href=".."
              className="px-3 py-2 rounded-md border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={openCreate}
              className="px-3 py-2 rounded-md bg-primary text-white hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add expense
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total expenses</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrencyToDisplay(total)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {expenses.length} item{expenses.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Actions</div>
            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={openCreate}
                className="w-full px-3 py-2 rounded-md bg-primary text-white hover:opacity-90"
              >
                Add new expense
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: use row menu for Edit/Delete.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Expense list
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Amount • Description • Account • Date
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="p-10 text-center">
              <DollarSign className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
              <div className="mt-3 font-medium text-gray-900 dark:text-gray-100">
                No expenses yet
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Add your first expense to start tracking.
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
              >
                Add expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-neutral-800/60">
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {expenses.map((e) => {
                    const expenseId = getExpenseId(e);
                    return (
                      <tr
                        key={expenseId || `${e.description}-${e.amount}`}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800/40"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatCurrencyToDisplay(e.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 min-w-[220px]">
                          {e.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {e.account.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {formatTimestampToDisplay(getExpenseDateIso(e))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                                aria-label="Expense actions"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="min-w-[180px] bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-1 z-50"
                                sideOffset={6}
                                align="end"
                              >
                                <DropdownMenu.Item
                                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-neutral-800 flex items-center gap-2"
                                  onSelect={() => openEdit(e)}
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer outline-none focus:bg-red-50 dark:focus:bg-red-900/20 flex items-center gap-2"
                                  onSelect={() => removeExpense(expenseId)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddExpenseModal
        branchId={branchId}
        isOpen={isModalOpen}
        mode={editing ? "edit" : "create"}
        expenseId={editing ? getExpenseId(editing) : undefined}
        initialValues={
          editing
            ? {
                amount: editing.amount,
                description: editing.description,
                date: getExpenseDateIso(editing),
              }
            : undefined
        }
        onClose={closeModal}
        onCreated={(expense) => {
          setExpenses((prev) => [expense, ...prev]);
        }}
        onUpdated={(expense) => {
          const updatedId = getExpenseId(expense);
          setExpenses((prev) =>
            prev.map((e) => (getExpenseId(e) === updatedId ? expense : e))
          );
        }}
      />
    </main>
  );
}
