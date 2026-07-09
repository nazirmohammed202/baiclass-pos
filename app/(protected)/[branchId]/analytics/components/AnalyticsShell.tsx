"use client";

import { useCallback, useMemo, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AnalyticsHeader from "./AnalyticsHeader";
import {
  buildAnalyticsSearchParams,
  parseAnalyticsSearchParams,
  resolveAnalyticsRanges,
  type AnalyticsSearchParams,
} from "../lib/analytics-search-params";

type AnalyticsShellProps = {
  children: ReactNode;
};

export default function AnalyticsShell({ children }: AnalyticsShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = useMemo(
    () => parseAnalyticsSearchParams(Object.fromEntries(searchParams.entries())),
    [searchParams]
  );

  const ranges = useMemo(() => resolveAnalyticsRanges(query), [query]);

  const updateQuery = useCallback(
    (patch: Partial<AnalyticsSearchParams>) => {
      const next = { ...query, ...patch };
      const params = buildAnalyticsSearchParams(next);
      const qs = params.toString();

      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, query, router]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AnalyticsHeader
        period={query.period}
        onPeriodChange={(period) => updateQuery({ period })}
        customStart={query.customStart}
        customEnd={query.customEnd}
        onCustomStartChange={(customStart) =>
          updateQuery({ period: "custom", customStart })
        }
        onCustomEndChange={(customEnd) =>
          updateQuery({ period: "custom", customEnd })
        }
        compareEnabled={query.compareEnabled}
        onCompareToggle={() =>
          updateQuery({ compareEnabled: !query.compareEnabled })
        }
        comparePeriod={query.comparePeriod}
        onComparePeriodChange={(comparePeriod) => updateQuery({ comparePeriod })}
        compareCustomStart={query.compareCustomStart}
        compareCustomEnd={query.compareCustomEnd}
        onCompareCustomStartChange={(compareCustomStart) =>
          updateQuery({ comparePeriod: "custom", compareCustomStart })
        }
        onCompareCustomEndChange={(compareCustomEnd) =>
          updateQuery({ comparePeriod: "custom", compareCustomEnd })
        }
        onExport={() => window.print()}
        periodLabel={ranges.periodLabel}
        currentDatesLabel={ranges.currentDatesLabel}
        compareDatesLabel={ranges.compareDatesLabel}
        isRefreshing={isPending}
      />

      <div className="relative flex-1 overflow-hidden">
        {isPending && (
          <div
            className="absolute inset-0 z-10 flex items-start justify-center pt-20 sm:pt-24 pointer-events-none"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 shadow-md backdrop-blur-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Loading analytics…
              </span>
            </div>
          </div>
        )}

        <div
          className={`space-y-4 p-2 sm:p-4 overflow-y-auto h-full transition-opacity duration-200 ${
            isPending ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
