import { formatCurrency, fmt } from "@/lib/utils";

type SalesOverviewSectionProps = {
  totalSales: number;
  cashSales: number;
  creditSales: number;
  cashPct: number;
  creditPct: number;
  targetVal: number;
  targetPct: number;
  dailySalesTarget: string | undefined;
};

export default function SalesOverviewSection({
  totalSales,
  cashSales,
  creditSales,
  cashPct,
  creditPct,
  targetVal,
  targetPct,
  dailySalesTarget,
}: SalesOverviewSectionProps) {
  return (
    <div className="lg:w-1/4 flex flex-col justify-end p-5"
    >
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        Sales Overview
      </p>
      <div>
        <p className="text-6xl font-bold text-primary dark:text-gray-100 tracking-tight mt-2">
          {formatCurrency(totalSales)}
        </p>
        <p className="text-sm  dark:text-gray-400 mt-1 font-bold ">
          Total Sales Made So Far
        </p>
      </div>

      <div className="mt-auto pt-6 space-y-4">
        {/* Combined cash / credit (one stacked bar) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Cash vs Credit
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cash {cashPct.toFixed(0)}% · Credit {creditPct.toFixed(0)}%
            </p>
          </div>
          <div className="w-full h-2.5 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-primary rounded-l-full transition-all"
              style={{ width: `${cashPct}%` }}
            />
            <div
              className="h-full bg-amber-600 dark:bg-amber-500 rounded-r-full transition-all"
              style={{ width: `${creditPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(cashSales)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(creditSales)}</span>
          </div>
        </div>

        {/* Target completion progress */}
        {targetVal > 0 && (
          <div>
            <div className="flex items-end justify-between gap-2 mb-1">
              <div>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Daily Target
                </p>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {fmt(dailySalesTarget)}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {targetPct.toFixed(0)}%
              </p>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 brightness-150"
                style={{ width: `${Math.min(targetPct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
