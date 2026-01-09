"use server";

import { handleError } from "@/utils/errorHandlers";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { SalePopulatedType, SaleType } from "@/types";
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
  endDate: string,
  keyword: string
): Promise<SalePopulatedType[]> => {
  const token = await extractToken();

  const response = await api.get(
    `/sales/read/${branchId}?startDate=${startDate}&endDate=${endDate}&keyword=${keyword}`,
    {
      headers: { "x-auth-token": token },
    }
  );
  return response.data;
};

export const updateSale = async (
  saleId: string,
  sale: SaleType,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.put(`/sales/update/${branchId}/${saleId}`, sale, {
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

export const deleteSale = async (
  saleId: string,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.delete(`/sales/delete/${branchId}/${saleId}`, {
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
