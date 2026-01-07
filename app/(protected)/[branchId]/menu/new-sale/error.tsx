"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="p-4 h-full">
      <main className="bg-white dark:bg-neutral-900 p-4 rounded-tr-lg rounded-br-lg rounded-bl-lg h-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              An error occurred while loading the new sale page. Please try
              again.
            </p>
          </div>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="w-full p-3 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                {error.message}
              </p>
            </div>
          )}

          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </main>
    </div>
  );
}
