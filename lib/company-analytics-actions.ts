"use server";

import api from "@/config/api";
import { extractToken } from "@/lib/auth-actions";
import type {
  CompanyAlertItem,
  CompanyAnalyticsSummary,
  CompanyAnalyticsTops,
  CompanyBranchPerformance,
  CompanySalesTrendPoint,
  PaymentsBreakdown,
} from "@/types";
import { handleError } from "@/utils/errorHandlers";

type Result<T> = {
  success: boolean;
  error: string | null;
  data: T | null;
};

async function getJson<T>(path: string): Promise<Result<T>> {
  try {
    const token = await extractToken();
    const response = await api.get(path, {
      headers: { "x-auth-token": token },
    });
    return { success: true, error: null, data: response.data as T };
  } catch (error: unknown) {
    return { success: false, error: handleError(error), data: null };
  }
}

/**
 * Company-wide KPI summary for the date range.
 * Backend: GET /company/:companyId/analytics/summary?startDate&endDate
 */
export async function getCompanyAnalyticsSummary(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<Result<CompanyAnalyticsSummary>> {
  return getJson(
    `/company/${companyId}/analytics/summary?startDate=${startDate}&endDate=${endDate}`
  );
}

/**
 * Per-branch performance for comparison table.
 * Backend: GET /company/:companyId/analytics/branch-performance?startDate&endDate
 */
export async function getCompanyBranchPerformance(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<Result<CompanyBranchPerformance[]>> {
  const result = await getJson<
    CompanyBranchPerformance[] | { branches: CompanyBranchPerformance[] }
  >(
    `/company/${companyId}/analytics/branch-performance?startDate=${startDate}&endDate=${endDate}`
  );
  if (!result.success || !result.data) return { ...result, data: null };
  const data = Array.isArray(result.data)
    ? result.data
    : result.data.branches ?? [];
  return { success: true, error: null, data };
}

/**
 * Company sales trend series.
 * Backend: GET /company/:companyId/analytics/sales-trend?startDate&endDate
 */
export async function getCompanySalesTrend(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<Result<CompanySalesTrendPoint[]>> {
  const result = await getJson<
    CompanySalesTrendPoint[] | { points: CompanySalesTrendPoint[] }
  >(
    `/company/${companyId}/analytics/sales-trend?startDate=${startDate}&endDate=${endDate}`
  );
  if (!result.success || !result.data) return { ...result, data: null };
  const data = Array.isArray(result.data)
    ? result.data
    : result.data.points ?? [];
  return { success: true, error: null, data };
}

/**
 * Aggregated payment mix across all branches.
 * Backend: GET /company/:companyId/analytics/payment-breakdown?startDate&endDate
 */
export async function getCompanyPaymentBreakdown(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<Result<PaymentsBreakdown[]>> {
  const result = await getJson<
    PaymentsBreakdown[] | { methods: PaymentsBreakdown[] }
  >(
    `/company/${companyId}/analytics/payment-breakdown?startDate=${startDate}&endDate=${endDate}`
  );
  if (!result.success || !result.data) return { ...result, data: null };
  const data = Array.isArray(result.data)
    ? result.data
    : result.data.methods ?? [];
  return { success: true, error: null, data };
}

/**
 * Cross-branch alerts & risks (stock, credit, ops).
 * Backend: GET /company/:companyId/analytics/alerts
 */
export async function getCompanyAnalyticsAlerts(
  companyId: string
): Promise<Result<CompanyAlertItem[]>> {
  const result = await getJson<
    CompanyAlertItem[] | { alerts: CompanyAlertItem[] }
  >(`/company/${companyId}/analytics/alerts`);
  if (!result.success || !result.data) return { ...result, data: null };
  const data = Array.isArray(result.data)
    ? result.data
    : result.data.alerts ?? [];
  return { success: true, error: null, data };
}

/**
 * Top products and employees across the company.
 * Backend: GET /company/:companyId/analytics/tops?startDate&endDate
 */
export async function getCompanyAnalyticsTops(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<Result<CompanyAnalyticsTops>> {
  const result = await getJson<CompanyAnalyticsTops>(
    `/company/${companyId}/analytics/tops?startDate=${startDate}&endDate=${endDate}`
  );
  if (!result.success || !result.data) {
    return { success: result.success, error: result.error, data: null };
  }
  return {
    success: true,
    error: null,
    data: {
      products: result.data.products ?? [],
      employees: result.data.employees ?? [],
    },
  };
}
