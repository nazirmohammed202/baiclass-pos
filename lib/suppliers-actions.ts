"use server";

import { handleError } from "@/utils/errorHandlers";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { SupplierType } from "@/types";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────────────────────

export type CreateSupplierPayload = {
  name: string;
  address?: string;
  phoneNumbers?: string[];
  email?: string;
};

export const createSupplier = async (
  payload: CreateSupplierPayload,
  branchId: string
): Promise<{ success: boolean; error: string | null; supplier: SupplierType | null }> => {
  try {
    const token = await extractToken();
    const response = await api.post(`/suppliers/create/${branchId}`, payload, {
      headers: { "x-auth-token": token },
    });

    revalidatePath(`/${branchId}/menu/receive-stock`);

    return {
      success: true,
      error: null,
      supplier: response.data,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      success: false,
      error: errorMessage,
      supplier: null,
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────────────────────────────────

export const getSuppliers = async (
  branchId: string
): Promise<SupplierType[]> => {
  try {
    const token = await extractToken();
    const response = await api.get(`/suppliers/read/${branchId}`, {
      headers: { "x-auth-token": token },
    });

    return response.data as SupplierType[];
  } catch (error: unknown) {
    console.error("Error fetching suppliers:", handleError(error));
    return [];
  }
};

export const getSupplierById = async (
  supplierId: string
): Promise<{ success: boolean; error: string | null; supplier: SupplierType | null }> => {
  try {
    const token = await extractToken();
    const response = await api.get(`/suppliers/read/single/${supplierId}`, {
      headers: { "x-auth-token": token },
    });

    return {
      success: true,
      error: null,
      supplier: response.data,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      success: false,
      error: errorMessage,
      supplier: null,
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────────────────────

export type UpdateSupplierPayload = {
  name?: string;
  address?: string;
  phoneNumbers?: string[];
  email?: string;
};

export const updateSupplier = async (
  supplierId: string,
  payload: UpdateSupplierPayload,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.put(`/suppliers/update/${supplierId}`, payload, {
      headers: { "x-auth-token": token },
    });

    revalidatePath(`/${branchId}/menu/receive-stock`);

    return {
      success: true,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────────────────────

export const deleteSupplier = async (
  supplierId: string,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.delete(`/suppliers/delete/${supplierId}`, {
      headers: { "x-auth-token": token },
    });

    revalidatePath(`/${branchId}/menu/receive-stock`);

    return {
      success: true,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
};
