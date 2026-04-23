"use client";

import { Calendar, ChevronDown, Download, GitCompareArrows } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { AnalyticsComparePeriod, AnalyticsPeriod } from "@/types";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

const COMPARE_PERIOD_OPTIONS: { value: AnalyticsComparePeriod; label: string }[] = [
  { value: "previous", label: "Previous period" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last5", label: "Last 5 Days" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

type AnalyticsHeaderProps = {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
  compareEnabled: boolean;
  onCompareToggle: () => void;
  comparePeriod: AnalyticsComparePeriod;
  onComparePeriodChange: (p: AnalyticsComparePeriod) => void;
  compareCustomStart: string;
  compareCustomEnd: string;
  onCompareCustomStartChange: (v: string) => void;
  onCompareCustomEndChange: (v: string) => void;
  onExport: () => void;
  periodLabel: string;
  currentDatesLabel: string;
  compareDatesLabel: string;
};

export default function AnalyticsHeader({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  compareEnabled,
  onCompareToggle,
  comparePeriod,
  onComparePeriodChange,
  compareCustomStart,
  compareCustomEnd,
  onCompareCustomStartChange,
  onCompareCustomEndChange,
  onExport,
  periodLabel,
  currentDatesLabel,
  compareDatesLabel,
}: AnalyticsHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [compareDropdownOpen, setCompareDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const compareDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (compareDropdownRef.current && !compareDropdownRef.current.contains(e.target as Node)) {
        setCompareDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pillGroupClass =
    "flex items-center gap-1 rounded-full p-1 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900";
  const pillBaseClass =
    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer min-w-0";
  const pillInactiveClass =
    "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200";
  const periodDropdownClass =
    "absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 py-1 overflow-hidden";

  return (
    <section className=" p-4 sm:p-5 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          {!compareEnabled && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
              {periodLabel} — {currentDatesLabel}
            </p>
          )}
        </div>

        <div className={`${pillGroupClass} flex-wrap justify-end sm:justify-start`}>
          {!compareEnabled && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`${pillBaseClass} ${pillInactiveClass} min-w-40 sm:min-w-44 justify-between`}
              >
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{PERIOD_OPTIONS.find((o) => o.value === period)?.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>
              {dropdownOpen && (
                <div className={`${periodDropdownClass} right-0 left-auto`}>
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onPeriodChange(opt.value);
                        if (opt.value !== "custom") setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer rounded-lg ${period === opt.value
                        ? "bg-primary text-white font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onCompareToggle}
            className={`${pillBaseClass} ${compareEnabled ? "bg-primary text-white" : pillInactiveClass
              }`}
            title={compareEnabled ? "Comparing two date ranges" : "Compare two date ranges"}
          >
            <GitCompareArrows className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{compareEnabled ? "Comparing" : "Compare"}</span>
          </button>

          <button onClick={onExport} className={`${pillBaseClass} ${pillInactiveClass}`}>
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* When compare ON: both period pickers on one line (pill style like Overview) */}
      {compareEnabled && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">Period A</span>
            <div className={`${pillGroupClass}`}>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`${pillBaseClass} ${pillInactiveClass} min-w-40 sm:min-w-44 justify-between`}
                >
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{PERIOD_OPTIONS.find((o) => o.value === period)?.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
                {dropdownOpen && (
                  <div className={periodDropdownClass}>
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onPeriodChange(opt.value);
                          if (opt.value !== "custom") setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer rounded-lg ${period === opt.value
                          ? "bg-primary text-white font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium shrink-0">vs</span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">Period B</span>
            <div className={pillGroupClass}>
              <div className="relative" ref={compareDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCompareDropdownOpen(!compareDropdownOpen)}
                  className={`${pillBaseClass} ${pillInactiveClass} min-w-40 sm:min-w-44 justify-between`}
                >
                  <span className="truncate">{COMPARE_PERIOD_OPTIONS.find((o) => o.value === comparePeriod)?.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                </button>
                {compareDropdownOpen && (
                  <div className={periodDropdownClass}>
                    {COMPARE_PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onComparePeriodChange(opt.value);
                          if (opt.value !== "custom") setCompareDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer rounded-lg ${comparePeriod === opt.value
                          ? "bg-primary text-white font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0 ml-1">
              {currentDatesLabel} vs {compareDatesLabel || "—"}
            </span>
          </div>

          {(period === "custom" || comparePeriod === "custom") && (
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              {period === "custom" && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Period A:</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => onCustomStartChange(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none"
                  />
                  <span className="text-gray-400 font-medium">to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => onCustomEndChange(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none"
                  />
                </>
              )}
              {comparePeriod === "custom" && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 font-medium ml-0 sm:ml-2">Period B:</span>
                  <input
                    type="date"
                    value={compareCustomStart}
                    onChange={(e) => onCompareCustomStartChange(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none"
                  />
                  <span className="text-gray-400 font-medium">to</span>
                  <input
                    type="date"
                    value={compareCustomEnd}
                    onChange={(e) => onCompareCustomEndChange(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none"
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom date inputs */}
      {period === "custom" && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none"
          />
          <span className="text-sm text-gray-400 font-medium">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:border-primary focus:outline-none"
          />
        </div>
      )}
    </section>
  );
}
