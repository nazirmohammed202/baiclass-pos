import { Suspense } from "react";
import { getAccount, getCompany } from "@/lib/auth-actions";
import { getTeamMembers } from "@/lib/company-actions";
import {
  getCompanyAnalyticsAlerts,
  getCompanyAnalyticsSummary,
  getCompanyAnalyticsTops,
  getCompanyBranchPerformance,
  getCompanyPaymentBreakdown,
  getCompanySalesTrend,
} from "@/lib/company-analytics-actions";
import { computeDateRange, formatDateRangeLabel } from "@/app/(protected)/[branchId]/analytics/hooks/analytics-date-utils";
import { getTodayDate } from "@/lib/date-utils";
import type {
  AccountType,
  AnalyticsPeriod,
  CompanyAnalyticsBundle,
  CompanyType,
  TeamMember,
} from "@/types";
import GeneralClient from "./components/GeneralClient";

function provisionalMembers(
  company: CompanyType,
  account: AccountType
): TeamMember[] {
  return (company.members ?? []).map((m) => {
    const populated =
      typeof m.account === "object" && m.account !== null ? m.account : null;
    const memberId =
      m.userId ??
      populated?._id ??
      (typeof m.account === "string" ? m.account : m._id ?? "");
    const isSelf = memberId === account._id;
    return {
      _id: memberId,
      name: isSelf ? account.name : populated?.name ?? "Team member",
      phoneNumber: isSelf
        ? account.phoneNumber
        : populated?.phoneNumber ?? "—",
      branchAccess: [],
      legacyRole: m.role,
      status: "active" as const,
    };
  });
}

function readParam(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePeriod(
  value: string | string[] | undefined
): AnalyticsPeriod {
  const raw = readParam(value);
  const allowed: AnalyticsPeriod[] = [
    "today",
    "yesterday",
    "last7",
    "last30",
    "thisMonth",
    "lastMonth",
    "custom",
  ];
  if (raw && allowed.includes(raw as AnalyticsPeriod)) {
    return raw as AnalyticsPeriod;
  }
  return "last7";
}

function normalizeRange(start: string, end: string): { start: string; end: string } {
  if (start <= end) return { start, end };
  return { start: end, end: start };
}

async function loadCompanyAnalytics(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<CompanyAnalyticsBundle> {
  const [
    summary,
    branchPerformance,
    salesTrend,
    paymentBreakdown,
    alerts,
    tops,
  ] = await Promise.all([
    getCompanyAnalyticsSummary(companyId, startDate, endDate),
    getCompanyBranchPerformance(companyId, startDate, endDate),
    getCompanySalesTrend(companyId, startDate, endDate),
    getCompanyPaymentBreakdown(companyId, startDate, endDate),
    getCompanyAnalyticsAlerts(companyId),
    getCompanyAnalyticsTops(companyId, startDate, endDate),
  ]);

  const errors: CompanyAnalyticsBundle["errors"] = {};
  if (!summary.success && summary.error) errors.summary = summary.error;
  if (!branchPerformance.success && branchPerformance.error) {
    errors.branchPerformance = branchPerformance.error;
  }
  if (!salesTrend.success && salesTrend.error) {
    errors.salesTrend = salesTrend.error;
  }
  if (!paymentBreakdown.success && paymentBreakdown.error) {
    errors.paymentBreakdown = paymentBreakdown.error;
  }
  if (!alerts.success && alerts.error) errors.alerts = alerts.error;
  if (!tops.success && tops.error) errors.tops = tops.error;

  const anyLoaded =
    summary.success ||
    branchPerformance.success ||
    salesTrend.success ||
    paymentBreakdown.success ||
    alerts.success ||
    tops.success;

  return {
    summary: summary.data,
    branchPerformance: branchPerformance.data,
    salesTrend: salesTrend.data,
    paymentBreakdown: paymentBreakdown.data,
    alerts: alerts.data,
    tops: tops.data,
    anyLoaded,
    errors,
  };
}

export default async function GeneralPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const account = await getAccount();
  const companyId = account.company?._id;
  if (!companyId) {
    return null;
  }

  const query = await searchParams;
  const period = parsePeriod(query.period);
  const today = getTodayDate();
  const rawStart = readParam(query.start) || today;
  const rawEnd = readParam(query.end) || today;
  const custom = normalizeRange(rawStart, rawEnd);
  const range = computeDateRange(period, custom.start, custom.end);
  const periodLabel =
    period === "custom"
      ? formatDateRangeLabel(range.startDate, range.endDate)
      : range.label;

  const company = await getCompany(companyId);
  const [membersResult, analytics] = await Promise.all([
    getTeamMembers(companyId),
    loadCompanyAnalytics(companyId, range.startDate, range.endDate),
  ]);

  const membersFromApi = membersResult.success;
  const members: TeamMember[] = membersFromApi
    ? (membersResult.data ?? [])
    : provisionalMembers(company, account);

  return (
    <Suspense
      fallback={
        <main className="p-6 max-w-6xl mx-auto animate-pulse space-y-4">
          <div className="h-10 w-48 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
        </main>
      }
    >
      <GeneralClient
        account={account}
        company={company}
        members={members}
        membersFromApi={membersFromApi}
        membersError={membersFromApi ? null : membersResult.error}
        periodLabel={periodLabel}
        analytics={analytics}
      />
    </Suspense>
  );
}
