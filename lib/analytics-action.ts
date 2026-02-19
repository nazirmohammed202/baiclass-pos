"use server";

import type { OverviewData } from "@/types";
import { extractToken } from "./auth-actions";
import api from "@/config/api";

export const getSalesOverview = async (
    branchId: string,
    startDate: string,
    endDate: string
): Promise<OverviewData> => {
    const token = await extractToken();

    console.log(startDate, endDate);

    const response = await api.get(
        `/analytics/read/sales-overview/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );

    console.log(response.data);
    return response.data;
};
