"use server";

import type {
    ActivityItem,
    AlertsTasksPanelProps,
    AnalyticsAlertsData,
    AnalyticsKPIs,
    CustomerAnalyticsData,
    InventoryHealthData,
    OverviewData,
    PaymentsBreakdown,
    Performer,
    ProductPerformanceItem,
    SalesTrendPoint,
    StaffPerformanceItem,
    TimeIntelligenceData,
} from "@/types";
import { extractToken } from "./auth-actions";
import api from "@/config/api";

export const getSalesOverview = async (
    branchId: string,
    startDate: string,
    endDate: string
): Promise<OverviewData> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/sales-overview/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );

    return response.data;
};

export const getPaymentsBreakdown = async (
    branchId: string,
    startDate: string,
    endDate: string
): Promise<PaymentsBreakdown[]> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/payment-breakdown/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};


export const getAlertsTasks = async (
    branchId: string,
): Promise<AlertsTasksPanelProps> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/alertsAndTasks/${branchId}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};


export const getTopPerformers = async (
    branchId: string,
): Promise<{
    products: Performer[];
    customers: Performer[];
    employees: Performer[];
}> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/tops/${branchId}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};


export const getRecentActivityFeed = async (
    branchId: string,
): Promise<{
    activities: { items: ActivityItem[], pagination: { total: number, page: number, limit: number, pages: number } };
}> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/recent-activity/${branchId}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

// ── Detailed Analytics Endpoints ──────────────────────────────────────

export const getAnalyticsKPIs = async (
    branchId: string,
    startDate: string,
    endDate: string,
    compareStartDate?: string,
    compareEndDate?: string,
): Promise<AnalyticsKPIs> => {
    const token = await extractToken();
    let url = `/analytics/read/kpis/${branchId}?startDate=${startDate}&endDate=${endDate}`;
    if (compareStartDate && compareEndDate) {
        url += `&compareStartDate=${compareStartDate}&compareEndDate=${compareEndDate}`;
    }
    const response = await api.get(url, { headers: { "x-auth-token": token } });
    return response.data;
};

export const getSalesTrend = async (
    branchId: string,
    startDate: string,
    endDate: string,
    compareStartDate?: string,
    compareEndDate?: string,
): Promise<SalesTrendPoint[]> => {
    const token = await extractToken();
    let url = `/analytics/read/sales-trend/${branchId}?startDate=${startDate}&endDate=${endDate}`;
    if (compareStartDate && compareEndDate) {
        url += `&compareStartDate=${compareStartDate}&compareEndDate=${compareEndDate}`;
    }
    const response = await api.get(url, { headers: { "x-auth-token": token } });
    return response.data;
};

export const getProductPerformance = async (
    branchId: string,
    startDate: string,
    endDate: string,
): Promise<{
    topSelling: ProductPerformanceItem[];
    mostProfitable: ProductPerformanceItem[];
    worstPerforming: ProductPerformanceItem[];
    deadStock: ProductPerformanceItem[];
}> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/product-performance/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

/** Single product analytics for the date range. See BACKEND_ROUTES.md in analytics folder. */
export const getProductSummary = async (
    branchId: string,
    productId: string,
    startDate: string,
    endDate: string,
): Promise<ProductPerformanceItem | null> => {
    const token = await extractToken();
    try {
        const response = await api.get(
            `/analytics/read/product-summary/${branchId}/${productId}?startDate=${startDate}&endDate=${endDate}`,
            { headers: { "x-auth-token": token } }
        );
        return response.data;
    } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "response" in err) {
            const res = (err as { response?: { status?: number } }).response;
            if (res?.status === 404) return null;
        }
        throw err;
    }
};

export const getInventoryHealth = async (
    branchId: string,
): Promise<InventoryHealthData> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/inventory-health/${branchId}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

export const getCustomerAnalytics = async (
    branchId: string,
    startDate: string,
    endDate: string,
): Promise<CustomerAnalyticsData> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/customer-analytics/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

export const getStaffPerformance = async (
    branchId: string,
    startDate: string,
    endDate: string,
): Promise<StaffPerformanceItem[]> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/staff-performance/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

export const getTimeIntelligence = async (
    branchId: string,
    startDate: string,
    endDate: string,
): Promise<TimeIntelligenceData> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/time-intelligence/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

export const getAnalyticsAlerts = async (
    branchId: string,
    startDate: string,
    endDate: string,
): Promise<AnalyticsAlertsData> => {
    const token = await extractToken();
    const response = await api.get(
        `/analytics/read/alerts-risks/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};
