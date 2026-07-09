"use client";

import { use } from "react";
import type {
  AnalyticsAlertsData,
  AnalyticsKPIs,
  CustomerAnalyticsData,
  InventoryHealthData,
  PaymentsBreakdown,
  ProductPerformanceItem,
  SalesTrendPoint,
  StaffPerformanceItem,
  TimeIntelligenceData,
} from "@/types";
import KPICards from "./KPICards";
import SalesTrendSection from "./SalesTrendSection";
import PaymentBreakdownSection from "./PaymentBreakdownSection";
import ProductPerformanceSection from "./ProductPerformanceSection";
import InventoryHealthSection from "./InventoryHealthSection";
import CustomerAnalyticsSection from "./CustomerAnalyticsSection";
import StaffPerformanceSection from "./StaffPerformanceSection";
import TimeIntelligenceSection from "./TimeIntelligenceSection";
import AlertsRiskSection from "./AlertsRiskSection";

type ProductPerformanceData = {
  topSelling: ProductPerformanceItem[];
  mostProfitable: ProductPerformanceItem[];
  worstPerforming: ProductPerformanceItem[];
  deadStock: ProductPerformanceItem[];
};

export function KPICardsSection({
  data,
  comparePeriodLabel,
}: {
  data: Promise<AnalyticsKPIs | null>;
  comparePeriodLabel: string;
}) {
  const resolved = use(data);
  return <KPICards data={resolved} comparePeriodLabel={comparePeriodLabel} />;
}

export function SalesTrendSectionWrapper({
  data,
  compareEnabled,
  periodLabel,
  currentDatesLabel,
  compareDatesLabel,
}: {
  data: Promise<SalesTrendPoint[] | null>;
  compareEnabled: boolean;
  periodLabel: string;
  currentDatesLabel: string;
  compareDatesLabel: string;
}) {
  const resolved = use(data);
  return (
    <SalesTrendSection
      data={resolved}
      compareEnabled={compareEnabled}
      periodLabel={periodLabel}
      currentDatesLabel={currentDatesLabel}
      compareDatesLabel={compareDatesLabel}
    />
  );
}

export function PaymentBreakdownSectionWrapper({
  data,
  periodLabel,
}: {
  data: Promise<PaymentsBreakdown[] | null>;
  periodLabel: string;
}) {
  const resolved = use(data);
  return <PaymentBreakdownSection data={resolved} periodLabel={periodLabel} />;
}

export function ProductPerformanceSectionWrapper({
  data,
  branchId,
  startDate,
  endDate,
}: {
  data: Promise<ProductPerformanceData | null>;
  branchId: string;
  startDate: string;
  endDate: string;
}) {
  const resolved = use(data);
  return (
    <ProductPerformanceSection
      data={resolved}
      branchId={branchId}
      startDate={startDate}
      endDate={endDate}
    />
  );
}

export function StaffPerformanceSectionWrapper({
  data,
}: {
  data: Promise<StaffPerformanceItem[] | null>;
}) {
  const resolved = use(data);
  return <StaffPerformanceSection data={resolved} />;
}

export function InventoryHealthSectionWrapper({
  data,
}: {
  data: Promise<InventoryHealthData | null>;
}) {
  const resolved = use(data);
  return <InventoryHealthSection data={resolved} />;
}

export function CustomerAnalyticsSectionWrapper({
  data,
}: {
  data: Promise<CustomerAnalyticsData | null>;
}) {
  const resolved = use(data);
  return <CustomerAnalyticsSection data={resolved} />;
}

export function TimeIntelligenceSectionWrapper({
  data,
}: {
  data: Promise<TimeIntelligenceData | null>;
}) {
  const resolved = use(data);
  return <TimeIntelligenceSection data={resolved} />;
}

export function AlertsRiskSectionWrapper({
  data,
}: {
  data: Promise<AnalyticsAlertsData | null>;
}) {
  const resolved = use(data);
  return <AlertsRiskSection data={resolved} />;
}
