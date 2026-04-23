"use client";

import { useState } from "react";
import { Clock, Info, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TimeIntelligenceData, PeakHourData, PeakDayData } from "@/types";
import InfoTooltip from "@/components/ui/tooltip";

type TimeIntelligenceSectionProps = {
  data: TimeIntelligenceData | null;
  loading?: boolean;
};

type TimeTab = "hours" | "days";

export function TimeIntelligenceFallback() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-neutral-700" />
          <div className="h-5 w-36 bg-gray-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square min-h-[32px] rounded-sm bg-gray-200 dark:bg-neutral-700" />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatmapView({ hours }: { hours: PeakHourData[] }) {
  const maxSales = Math.max(...hours.map((h) => h.revenue), 1);

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Sales by hour (darker = higher revenue)
      </p>
      <div className="grid grid-cols-12 sm:grid-cols-24 gap-0.5 sm:gap-1">
        {hours.map((hour) => {
          const intensity = maxSales > 0 ? hour.revenue / maxSales : 0;
          const opacity = 0.12 + 0.88 * intensity;

          return (
            <div
              key={hour.hour}
              title={`${hour.hourLabel}: ${formatCurrency(hour.revenue)} (${hour.transactions} txns)`}
              className={`aspect-square min-h-[28px] sm:min-h-[36px] rounded-sm cursor-default transition-colors ${
                intensity === 0 ? "bg-gray-200 dark:bg-neutral-700" : ""
              }`}
              style={
                intensity > 0
                  ? { backgroundColor: `rgba(0, 128, 128, ${opacity})` }
                  : undefined
              }
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-2 px-0.5">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
}

function DayTableView({ days }: { days: PeakDayData[] }) {
  const sorted = [...days].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Day</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transactions</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {sorted.map((day, i) => {
            const totalRev = days.reduce((s, d) => s + d.revenue, 0);
            const share = totalRev > 0 ? ((day.revenue / totalRev) * 100).toFixed(1) : "0";

            return (
              <tr key={day.dayOfWeek} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {i === 0 && <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />}
                  {i === sorted.length - 1 && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />}
                  {day.dayLabel}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatCurrency(day.revenue)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                  {day.transactions}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400 tabular-nums">
                  {share}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TimeIntelligenceSection({
  data,
  loading,
}: TimeIntelligenceSectionProps) {
  const [tab, setTab] = useState<TimeTab>("hours");

  if (loading && !data) return <TimeIntelligenceFallback />;

  if (!data) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Time Intelligence
            </h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Time intelligence data unavailable — backend endpoint needed.
          </p>
        </div>
      </div>
    );
  }

  const peakHours = data.peakHours ?? [];
  const peakDays = data.peakDays ?? [];

  const peakHour = peakHours.reduce((best, h) => (h.revenue > (best?.revenue ?? 0) ? h : best), peakHours[0]);
  const slowestHour = peakHours.filter((h) => h.revenue > 0).reduce(
    (worst, h) => (h.revenue < (worst?.revenue ?? Infinity) ? h : worst),
    peakHours.find((h) => h.revenue > 0) ?? peakHours[0]
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Time Intelligence
          </h3>
          <InfoTooltip content="Identify your busiest and slowest times">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </InfoTooltip>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
          )}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5">
          <button
            onClick={() => setTab("hours")}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "hours"
                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Hourly Heatmap
          </button>
          <button
            onClick={() => setTab("days")}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              tab === "days"
                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            By Day of Week
          </button>
        </div>
        </div>
      </div>

      {/* Peak / Slowest callouts */}
      {tab === "hours" && peakHour && slowestHour && (
        <div className="px-5 pt-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900/50">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-700 dark:text-green-400 font-medium">
              Peak: {peakHour.hourLabel} ({formatCurrency(peakHour.revenue)})
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">
              Slowest: {slowestHour.hourLabel} ({formatCurrency(slowestHour.revenue)})
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {tab === "hours" ? (
          <HeatmapView hours={peakHours} />
        ) : (
          <DayTableView days={peakDays} />
        )}
      </div>
    </div>
  );
}
