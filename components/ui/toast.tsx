"use client";

import React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast, Toast as ToastType } from "@/context/toastContext";

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToast();

  const variantStyles = {
    success: {
      bg: "bg-green-100 dark:bg-green-900",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: CheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
      bg: "bg-red-100 dark:bg-red-900",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600 dark:text-red-400",
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-900",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    warning: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: AlertTriangle,
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  };

  const styles = variantStyles[toast.variant];
  const Icon = styles.icon;

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[500px]
        flex items-start gap-3
        transition-all duration-300 ease-in-out
        transform translate-y-0 opacity-100
      `}
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <Icon className={`w-5 h-5 ${styles.iconColor} shrink-0 mt-0.5`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};
