"use server";

import { DailySalesReport, DailySalesSummary } from "@/types";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { handleError } from "@/utils/errorHandlers";
import { revalidatePath } from "next/cache";

export const getDailySalesSummary = async (
    branchId: string,
    startDate: string,
    endDate: string
): Promise<DailySalesSummary> => {
    const token = await extractToken();
    const response = await api.get(
        `/sales-shift/read/daily-sales-summary/${branchId}?startDate=${startDate}&endDate=${endDate}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

export const getDailySalesReport = async (
    branchId: string,
    date: string
): Promise<DailySalesReport> => {
    const token = await extractToken();
    const response = await api.get(
        `/sales-shift/read/daily-sales-report/${branchId}?date=${date}`,
        { headers: { "x-auth-token": token } }
    );
    return response.data;
};

export type CloseShiftPayload = {
    total: number;
    date: string; // YYYY-MM-DD
};

export const closeShift = async (
    branchId: string,
    payload: CloseShiftPayload
): Promise<{ success: boolean; error: string | null }> => {
    try {
        const token = await extractToken();
        await api.post(`/sales-shift/create/close/${branchId}`, payload, {
            headers: { "x-auth-token": token },
        });

        revalidatePath(`/${branchId}/menu/end-of-day`);
        return { success: true, error: null };
    } catch (error: unknown) {
        return { success: false, error: handleError(error) };
    }
};
