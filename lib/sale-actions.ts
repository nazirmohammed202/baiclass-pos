"use server";

import { handleError } from "@/utils/errorHandlers";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { CustomDateSalePayload, SalePopulatedType, SaleType } from "@/types";
import { cacheLife, cacheTag, updateTag, } from "next/cache";
import { getTodayDate } from "./date-utils";

export const createNewSale = async (
  sale: SaleType,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.post(`/sales/create/${branchId}`, sale, {
      headers: { "x-auth-token": token },
    });
    const today = getTodayDate();
    updateTag(`sale:today:${branchId}:${today}`);

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

export const createCustomDateSale = async (
  sale: CustomDateSalePayload,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.post(`/sales/create/custom-date-sale/${branchId}`, sale, {
      headers: { "x-auth-token": token },
    });
    const today = getTodayDate();
    updateTag(`sale:today:${branchId}:${today}`);

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

export const getSalesHistoryCached = async (
  branchId: string,
  startDate: string,
  endDate: string,
  keyword: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  sales: SalePopulatedType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}> => {
  const token = await extractToken();

  const response = await api.get(
    `/sales/read/history/${branchId}?startDate=${startDate}&endDate=${endDate}&keyword=${keyword}&page=${page}&limit=${limit}`,
    {
      headers: { "x-auth-token": token },
    }
  );
  return response.data;
};




export const getTodaySales = async (
  branchId: string
): Promise<SalePopulatedType[]> => {

  const token = await extractToken();
  const today = getTodayDate()

  const getTodaySalesCached = async (branchId: string, today: string) => {
    "use cache";
    cacheLife("days");
    cacheTag(`sale:today:${branchId}:${today}`);

    const response = await api.get(
      `/sales/read/today/${branchId}?today=${today}`,
      {
        headers: { "x-auth-token": token },
      }
    );
    return response.data as SalePopulatedType[];
  };

  const todaySales = await getTodaySalesCached(branchId, today);
  return todaySales;
};

export const getSaleById = async (
  saleId: string
): Promise<{
  success: boolean;
  error: string | null;
  sale: SalePopulatedType | null;
}> => {
  try {
    const token = await extractToken();

    const getSaleByIdCached = async (saleId: string) => {
      "use cache";
      cacheLife("weeks");
      cacheTag("sale:" + saleId);

      const response = await api.get(`/sales/read/${saleId}`, {
        headers: { "x-auth-token": token },
      });

      return response.data as SalePopulatedType;
    };

    const sale = await getSaleByIdCached(saleId);

    return {
      success: true,
      error: null,
      sale,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      success: false,
      error: errorMessage,
      sale: null,
    };
  }
};

export const updateSale = async (
  saleId: string,
  sale: SaleType
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.put(`/sales/update/${saleId}`, sale, {
      headers: { "x-auth-token": token },
    });

    const today = getTodayDate();
    updateTag("sale:" + saleId);
    updateTag(`sale:today:${sale.branch}:${today}`);

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
    const today = getTodayDate();
    updateTag(`sale:today:${branchId}:${today}`);

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
