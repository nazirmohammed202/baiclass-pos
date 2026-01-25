"use server";
import { DailySalesSummary } from "@/types";
import { extractToken } from "./auth-actions";
import api from "@/config/api";


export const getDailySalesSummary = async (
    branchId: string,
    startDate: string,
    endDate: string
): Promise<DailySalesSummary> => {
    const token = await extractToken();

    const response = await api.get(
        `/sales-shift/read/daily-sales-summary/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        {
            headers: { "x-auth-token": token },
        }
    );
    return response.data;

}; 