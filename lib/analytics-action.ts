"use server";

import type { OverviewData, PaymentsBreakdown } from "@/types";
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
