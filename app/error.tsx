"use client";

import React from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow p-8 w-full max-w-md">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold mb-2 ">Something went wrong!</h2>
          {/* Error Message */}
          <p className="mb-6 text-foreground opacity-80">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg text-left">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                <span className="font-semibold">Error ID:</span> {error.digest}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className=" flex flex-col gap-3 ">
            <button onClick={reset} className="btn">
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-outline "
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Error;
