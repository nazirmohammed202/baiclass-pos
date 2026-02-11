"use server";

import { handleError } from "@/utils/errorHandlers";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { InventoryHistoryType, PaymentType, SupplierType } from "@/types";
import { revalidatePath, updateTag } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────────────────────

export type CreateSupplierPayload = {
  name: string;
  address?: string;
  phoneNumbers?: string[];
  email?: string;
  branch: string;
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

    updateTag("branch-suppliers:" + branchId);
    revalidatePath(`/${branchId}/menu/receive-stock`);
    revalidatePath(`/${branchId}/menu/suppliers`);

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
): Promise<SupplierType> => {
  const token = await extractToken();
  const response = await api.get(`/suppliers/read/single/${supplierId}`, {
    headers: { "x-auth-token": token },
  });
  return response.data as SupplierType;
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

    updateTag("branch-suppliers:" + branchId);
    updateTag("supplier:" + supplierId);
    revalidatePath(`/${branchId}/menu/receive-stock`);
    revalidatePath(`/${branchId}/menu/suppliers`);
    revalidatePath(`/${branchId}/menu/suppliers/${supplierId}`);

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

    updateTag("branch-suppliers:" + branchId);
    updateTag("supplier:" + supplierId);
    revalidatePath(`/${branchId}/menu/receive-stock`);
    revalidatePath(`/${branchId}/menu/suppliers`);

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
// Supplier procurements & payments (for profile)
// ─────────────────────────────────────────────────────────────────────────────

type GetSupplierProcurementsResponse = {
  procurements: InventoryHistoryType[];
  pagination: { total: number; page: number; limit: number; pages: number };
};

export const getSupplierProcurements = async (
  supplierId: string,
  branchId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetSupplierProcurementsResponse> => {
  const token = await extractToken();
  const response = await api.get(
    `/suppliers/read/${supplierId}/procurements/${branchId}?page=${page}&limit=${limit}`,
    { headers: { "x-auth-token": token } }
  );
  return { ...response.data } as GetSupplierProcurementsResponse;
};

type GetSupplierPaymentsResponse = {
  payments: PaymentType[];
  pagination: { total: number; page: number; limit: number; pages: number };
};

export const getSupplierPayments = async (
  supplierId: string,
  branchId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetSupplierPaymentsResponse> => {
  const token = await extractToken();
  const response = await api.get(
    `/payments/read/supplier/${supplierId}/${branchId}?page=${page}&limit=${limit}`,
    { headers: { "x-auth-token": token } }
  );
  return { ...response.data } as GetSupplierPaymentsResponse;
};

export type RecordSupplierPaymentPayload = {
  amount: number;
  paymentMethod: "cash" | "momo" | "cheque";
  note?: string;
  receiptNumber?: string;
  date?: string;
  momoName?: string;
  momoNumber?: string;
  transactionId?: string;
  cheque?: { bank: string; branch: string; number: string; date: string };
};

export const recordSupplierPayment = async (
  supplierId: string,
  branchId: string,
  payload: RecordSupplierPaymentPayload
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.post(`/payments/create/supplier/${supplierId}/${branchId}`, payload, {
      headers: { "x-auth-token": token },
    });
    updateTag("branch-suppliers:" + branchId);
    updateTag("supplier:" + supplierId);
    revalidatePath(`/${branchId}/menu/suppliers`);
    revalidatePath(`/${branchId}/menu/suppliers/${supplierId}`);
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleError(error),
    };
  }
};
