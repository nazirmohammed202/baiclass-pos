"use client";

import AnalyticsHeader from "./AnalyticsHeader";
import KPICards from "./KPICards";
import SalesTrendSection from "./SalesTrendSection";
import PaymentBreakdownSection from "./PaymentBreakdownSection";
import ProductPerformanceSection from "./ProductPerformanceSection";
import InventoryHealthSection from "./InventoryHealthSection";
import CustomerAnalyticsSection from "./CustomerAnalyticsSection";
import StaffPerformanceSection from "./StaffPerformanceSection";
import TimeIntelligenceSection from "./TimeIntelligenceSection";
import AlertsRiskSection from "./AlertsRiskSection";
import { useAnalyticsData } from "../hooks";

type AnalyticsClientProps = {
  branchId: string;
};

export default function AnalyticsClient({ branchId }: AnalyticsClientProps) {
  const {
    data,
    period,
    setPeriod,
    customStart,
    customEnd,
    setCustomStart,
    setCustomEnd,
    compareEnabled,
    setCompareEnabled,
    comparePeriod,
    setComparePeriod,
    compareCustomStart,
    compareCustomEnd,
    setCompareCustomStart,
    setCompareCustomEnd,
    periodLabel,
    currentDatesLabel,
    compareDatesLabel,
    handleExport,
  } = useAnalyticsData({ branchId });

  return (
    <div className="space-y-4 p-2 sm:p-4 overflow-y-auto flex-1">
      <AnalyticsHeader
        period={period}
        onPeriodChange={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        compareEnabled={compareEnabled}
        onCompareToggle={setCompareEnabled}
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
        compareCustomStart={compareCustomStart}
        compareCustomEnd={compareCustomEnd}
        onCompareCustomStartChange={setCompareCustomStart}
        onCompareCustomEndChange={setCompareCustomEnd}
        onExport={handleExport}
        periodLabel={periodLabel}
        currentDatesLabel={currentDatesLabel}
        compareDatesLabel={compareDatesLabel}
      />

      <KPICards
        data={data.kpis}
        loading={data.kpis === null}
        comparePeriodLabel={compareDatesLabel}
      />

      <SalesTrendSection
        data={data.salesTrend}
        compareEnabled={compareEnabled}
        loading={data.salesTrend === null}
        periodLabel={periodLabel}
        currentDatesLabel={currentDatesLabel}
        compareDatesLabel={compareDatesLabel}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PaymentBreakdownSection
          data={data.paymentsBreakdown}
          loading={data.paymentsBreakdown === null}
          periodLabel={periodLabel}
        />
        <TimeIntelligenceSection data={data.timeIntelligence} loading={data.timeIntelligence === null} />
      </div>

      <ProductPerformanceSection data={data.productPerformance} loading={data.productPerformance === null} />

      <StaffPerformanceSection data={data.staffPerformance} loading={data.staffPerformance === null} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <InventoryHealthSection data={data.inventoryHealth} loading={data.inventoryHealth === null} />
        <CustomerAnalyticsSection data={data.customerAnalytics} loading={data.customerAnalytics === null} />
      </div>

      <AlertsRiskSection data={data.alertsRisks} loading={data.alertsRisks === null} />
    </div>
  );
}
