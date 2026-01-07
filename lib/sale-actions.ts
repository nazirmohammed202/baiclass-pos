"use server";

import { handleError } from "@/utils/errorHandlers";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { SaleType } from "@/types";
import { cacheLife, cacheTag } from "next/cache";

export const createNewSale = async (
  sale: SaleType,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.post(`/sales/create/${branchId}`, sale, {
      headers: { "x-auth-token": token },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      error: errorMessage,
      success: false,
    };
  }
};

export const getSalesHistory = async (
  branchId: string
): Promise<{
  success: boolean;
  error: string | null;
  salesHistory: SaleType[];
}> => {
  const token = await extractToken();
  const response = await api.get(`/sales/history/${branchId}`, {
    headers: { "x-auth-token": token },
  });

  return response.data;
};

export const getSalesHistoryCached = async (
  branchId: string,
  startDate: string,
  endDate: string
) => {
  const token = await extractToken();

  const getHistoryCached = async (
    branchId: string,
    startDate: string,
    endDate: string
  ) => {
    // "use cache";
    // cacheLife("hours");
    // cacheTag("sales-history:" + branchId + ":" + startDate + ":" + endDate);
    const response = await api.get(
      `/sales/read/${branchId}?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { "x-auth-token": token },
      }
    );
    return response.data;
  };

  return getHistoryCached(branchId, startDate, endDate);
};
