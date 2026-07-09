import { Suspense } from "react";
import {
  getAnalyticsAlerts,
  getAnalyticsKPIs,
  getCustomerAnalytics,
  getInventoryHealth,
  getPaymentsBreakdown,
  getProductPerformance,
  getSalesTrend,
  getStaffPerformance,
  getTimeIntelligence,
} from "@/lib/analytics-action";
import AnalyticsShell from "./components/AnalyticsShell";
import {
  AlertsRiskSectionWrapper,
  CustomerAnalyticsSectionWrapper,
  InventoryHealthSectionWrapper,
  KPICardsSection,
  PaymentBreakdownSectionWrapper,
  ProductPerformanceSectionWrapper,
  SalesTrendSectionWrapper,
  StaffPerformanceSectionWrapper,
  TimeIntelligenceSectionWrapper,
} from "./components/AnalyticsSections";
import { AlertsRiskFallback } from "./components/AlertsRiskSection";
import { CustomerAnalyticsFallback } from "./components/CustomerAnalyticsSection";
import { InventoryHealthFallback } from "./components/InventoryHealthSection";
import { KPICardsFallback } from "./components/KPICards";
import { PaymentBreakdownFallback } from "./components/PaymentBreakdownSection";
import { ProductPerformanceFallback } from "./components/ProductPerformanceSection";
import { SalesTrendFallback } from "./components/SalesTrendSection";
import { StaffPerformanceFallback } from "./components/StaffPerformanceSection";
import { TimeIntelligenceFallback } from "./components/TimeIntelligenceSection";
import {
  parseAnalyticsSearchParams,
  resolveAnalyticsRanges,
} from "./lib/analytics-search-params";
import AnalyticsLoading from "./loading";

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ branchId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { branchId } = await params;
  const query = parseAnalyticsSearchParams(await searchParams);
  const ranges = resolveAnalyticsRanges(query);
  const { startDate, endDate, compareStartDate, compareEndDate } = ranges;

  const kpis = getAnalyticsKPIs(
    branchId,
    startDate,
    endDate,
    compareStartDate,
    compareEndDate
  ).catch(() => null);

  const salesTrend = getSalesTrend(
    branchId,
    startDate,
    endDate,
    compareStartDate,
    compareEndDate
  ).catch(() => null);

  const paymentsBreakdown = getPaymentsBreakdown(branchId, startDate, endDate).catch(
    () => null
  );

  const productPerformance = getProductPerformance(branchId, startDate, endDate).catch(
    () => null
  );

  const inventoryHealth = getInventoryHealth(branchId).catch(() => null);

  const customerAnalytics = getCustomerAnalytics(branchId, startDate, endDate).catch(
    () => null
  );

  const staffPerformance = getStaffPerformance(branchId, startDate, endDate).catch(
    () => null
  );

  const timeIntelligence = getTimeIntelligence(branchId, startDate, endDate).catch(
    () => null
  );

  const alertsRisks = getAnalyticsAlerts(branchId, startDate, endDate).catch(() => null);

  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsShell>
      <Suspense fallback={<KPICardsFallback />}>
        <KPICardsSection
          data={kpis}
          comparePeriodLabel={ranges.compareDatesLabel}
        />
      </Suspense>

      <Suspense fallback={<SalesTrendFallback />}>
        <SalesTrendSectionWrapper
          data={salesTrend}
          compareEnabled={query.compareEnabled}
          periodLabel={ranges.periodLabel}
          currentDatesLabel={ranges.currentDatesLabel}
          compareDatesLabel={ranges.compareDatesLabel}
        />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Suspense fallback={<PaymentBreakdownFallback />}>
          <PaymentBreakdownSectionWrapper
            data={paymentsBreakdown}
            periodLabel={ranges.periodLabel}
          />
        </Suspense>

        <Suspense fallback={<TimeIntelligenceFallback />}>
          <TimeIntelligenceSectionWrapper data={timeIntelligence} />
        </Suspense>
      </div>

      <Suspense fallback={<ProductPerformanceFallback />}>
        <ProductPerformanceSectionWrapper
          data={productPerformance}
          branchId={branchId}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>

      <Suspense fallback={<StaffPerformanceFallback />}>
        <StaffPerformanceSectionWrapper data={staffPerformance} />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Suspense fallback={<InventoryHealthFallback />}>
          <InventoryHealthSectionWrapper data={inventoryHealth} />
        </Suspense>

        <Suspense fallback={<CustomerAnalyticsFallback />}>
          <CustomerAnalyticsSectionWrapper data={customerAnalytics} />
        </Suspense>
      </div>

      <Suspense fallback={<AlertsRiskFallback />}>
        <AlertsRiskSectionWrapper data={alertsRisks} />
      </Suspense>
      </AnalyticsShell>
    </Suspense>
  );
}
