"use server";

import { handleError } from "@/utils/errorHandlers";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { revalidatePath, cacheLife, cacheTag, updateTag } from "next/cache";
import { InventoryHistoryType } from "@/types";
import { getTodayDate } from "./date-utils";

export type CreateReceiveStockPayload = {
  products: Array<{
    product: string;
    quantity: number;
    basePrice: number;
    wholesalePrice?: number;
    retailPrice?: number;
    discount?: number; // item-level discount percentage
    total: number; // item total after discount applied
  }>;
  branch: string;
  supplier?: string;
  totalCost: number;
  invoiceDate: string;
  paymentType?: "cash" | "credit";
  paymentMethod?: "cash" | "momo";
  note?: string;
  discountType?: "percentage" | "fixed" | null;
  discountValue?: number; // invoice-level discount
};

export const createReceiveStock = async (
  payload: CreateReceiveStockPayload,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.post(`/inventory/create/${branchId}`, payload, {
      headers: { "x-auth-token": token },
    });

    const today = getTodayDate();
    updateTag(`inventory:today:${branchId}:${today}`);
    revalidatePath(`/${branchId}/menu/stock`);
    revalidatePath(`/${branchId}/menu/receive-stock`);

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

export type GetInventoryHistoryParams = {
  branchId: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type GetInventoryHistoryResponse = {
  receipts: InventoryHistoryType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  error: string | null;
};

export const getInventoryHistory = async ({
  branchId,
  startDate,
  endDate,
  search,
  page = 1,
  limit = 10,
}: GetInventoryHistoryParams): Promise<GetInventoryHistoryResponse> => {
  try {
    const token = await extractToken();
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/inventory/read/history/${branchId}?${params.toString()}`, {
      headers: { "x-auth-token": token },
    });

    const receipts = response.data.receipts || response.data.data || response.data.inventories || [];

    return {
      receipts,
      pagination: response.data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
      error: null,
    };

  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      receipts: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
      error: errorMessage,
    };
  }
};

export const getTodayInventory = async (
  branchId: string
): Promise<InventoryHistoryType[]> => {
  const token = await extractToken();
  const today = getTodayDate();

  const getTodayInventoryCached = async (branchId: string, today: string) => {
    "use cache";
    cacheLife("days");
    cacheTag(`inventory:today:${branchId}:${today}`);

    const response = await api.get(
      `/inventory/read/today/${branchId}?today=${today}`,
      {
        headers: { "x-auth-token": token },
      }
    );

    const receipts = response.data || [];

    return receipts as InventoryHistoryType[];
  };

  const todayInventory = await getTodayInventoryCached(branchId, today);
  return todayInventory;
};

export type GetInventoryByIdResponse = {
  success: boolean;
  inventory: InventoryHistoryType | null;
  error: string | null;
};

export const getInventoryById = async (
  inventoryId: string
): Promise<GetInventoryByIdResponse> => {
  try {
    const token = await extractToken();
    const response = await api.get(`/inventory/read/${inventoryId}`, {
      headers: { "x-auth-token": token },
    });

    return {
      success: true,
      inventory: response.data.inventory || response.data,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      success: false,
      inventory: null,
      error: errorMessage,
    };
  }
};

export type UpdateInventoryPayload = CreateReceiveStockPayload;

export const updateInventory = async (
  inventoryId: string,
  payload: UpdateInventoryPayload,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.put(`/inventory/update/${inventoryId}`, payload, {
      headers: { "x-auth-token": token },
    });

    const today = getTodayDate();
    updateTag(`inventory:today:${branchId}:${today}`);
    revalidatePath(`/${branchId}/menu/stock`);
    revalidatePath(`/${branchId}/menu/receive-stock`);
    revalidatePath(`/${branchId}/menu/stock-history`);

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

export const deleteInventory = async (
  inventoryId: string,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.delete(`/inventory/${inventoryId}`, {
      headers: { "x-auth-token": token },
    });

    const today = getTodayDate();
    updateTag(`inventory:today:${branchId}:${today}`);
    revalidatePath(`/${branchId}/menu/stock`);
    revalidatePath(`/${branchId}/menu/stock-history`);

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
