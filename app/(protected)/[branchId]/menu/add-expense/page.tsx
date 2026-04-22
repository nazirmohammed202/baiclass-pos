import React from "react";
import Link from "next/link";
import { DollarSign } from "lucide-react";

export default async function AddExpensePage() {
  return (
    <main className="p-3 sm:p-4 lg:p-6">
      <div className="max-w-lg mx-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6 sm:p-8 text-center space-y-4">
        <DollarSign className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
        <h1 className="text-xl sm:text-2xl font-bold">Add Expense</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Expense recording will be available once the backend API is
          implemented. See{" "}
          <code className="text-sm bg-gray-100 dark:bg-neutral-800 px-1 rounded">
            docs/BACKEND_REQUIREMENTS.md
          </code>{" "}
          for requirements.
        </p>
        <Link
          href=".."
          className="inline-block text-primary hover:underline font-medium"
        >
          ← Back to menu
        </Link>
      </div>
    </main>
  );
}
