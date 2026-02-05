"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Calendar } from "lucide-react";
import { getTodayDate } from "@/lib/date-utils";

type DatePickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  initialDate?: string;
};

const DatePickerModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialDate,
}: DatePickerModalProps) => {
  const todayDate = getTodayDate();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayDate);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (dateInputRef.current) {
        dateInputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialDate) {
      setSelectedDate(initialDate);
    }
  }, [isOpen, initialDate]);

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(selectedDate);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              Select Receive Date
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="receiveDate"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Choose a date for this stock receipt
            </label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                id="receiveDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayDate()}
                className="w-full px-4 py-3 border border-gray-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Select the date when you received this stock
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedDate}
              className="flex-1 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Confirm Date
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
