"use server";

import { handleError } from "@/utils/errorHandlers";
import { extractToken } from "./auth-actions";
import api from "@/config/api";
import { cacheLife, cacheTag, revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { CustomersBalanceDueType, CustomerType, PaymentType, SalePopulatedType } from "@/types";
import { getBranchCustomers } from "./branch-actions";

export type CreateCustomerPayload = {
  name: string;
  address?: string;
  city?: string;
  phoneNumber?: string;
};

export const createCustomer = async (
  payload: CreateCustomerPayload,
  branchId: string
): Promise<{ success: boolean; error: string | null; customer: CustomerType | null }> => {
  try {
    const token = await extractToken();
    const response = await api.post(`/customers/create/${branchId}`, payload, {
      headers: { "x-auth-token": token },
    });

    updateTag("branch-customers:" + branchId);
    revalidatePath(`/${branchId}/menu/customers`);

    return {
      success: true,
      error: null,
      customer: response.data,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    return {
      success: false,
      error: errorMessage,
      customer: null,
    };
  }
};

export const getCustomers = async (
  branchId: string
): Promise<CustomerType[]> => {
  const data = await getBranchCustomers(branchId);
  return Array.isArray(data) ? data : (data?.customers ?? data?.data ?? []);
};


export const getCustomersBalanceDue = async (
  branchId: string
): Promise<CustomersBalanceDueType[]> => {
  const token = await extractToken();
  const response = await api.get(`/customers/read/balance-due/${branchId}`, {
    headers: { "x-auth-token": token },
  });
  return response.data as CustomersBalanceDueType[];
};

export const getCustomerById = async (
  customerId: string
): Promise<CustomerType> => {

  const token = await extractToken();

  const getCustomerByIdCached = async (customerId: string) => {

    const response = await api.get(`/customers/read/single/${customerId}`, {
      headers: { "x-auth-token": token },
    });
    return response.data as CustomerType;
  };

  const customer = await getCustomerByIdCached(customerId);
  return customer;
};

export type UpdateCustomerPayload = {
  name?: string;
  address?: string;
  phoneNumber?: string;
  creditLimit?: number;
};

export type RecordCustomerPaymentPayload = {
  amount: number;
  paymentMethod: "cash" | "momo" | "cheque";
  note?: string;
  receiptNumber?: string;
  date?: string; // ISO date string for date paid
  momoName?: string;
  momoNumber?: string;
  transactionId?: string;
  cheque?: {
    bank: string;
    branch: string;
    number: string;
    date: string;
  };
};

export const recordCustomerPayment = async (
  customerId: string,
  branchId: string,
  payload: RecordCustomerPaymentPayload
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.post(`/payments/create/customer/${customerId}/${branchId}`, payload, {
      headers: { "x-auth-token": token },
    });
    updateTag("branch-customers:" + branchId);
    revalidatePath(`/${branchId}/menu/customers`);
    revalidatePath(`/${branchId}/menu/customers/${customerId}`);
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleError(error),
    };
  }
};

export const updateCustomer = async (
  customerId: string,
  payload: UpdateCustomerPayload,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.put(`/customers/update/${customerId}`, payload, {
      headers: { "x-auth-token": token },
    });

    updateTag("branch-customers:" + branchId);
    revalidatePath(`/${branchId}/menu/customers`);

    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleError(error),
    };
  }
};

export const deleteCustomer = async (
  customerId: string,
  branchId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.delete(`/customers/delete/${customerId}/${branchId}`, {
      headers: { "x-auth-token": token },
    });

    updateTag("branch-customers:" + branchId);
    updateTag("customer:" + customerId);
    revalidatePath(`/${branchId}/menu/customers`);

    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleError(error),
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Customer sales & payments (for profile)
// ─────────────────────────────────────────────────────────────────────────────

type GetCustomerSalesResponse = {
  sales: SalePopulatedType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};
export const getCustomerSales = async (
  customerId: string,
  branchId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetCustomerSalesResponse> => {
  const token = await extractToken();
  const response = await api.get(
    `/sales/read/customer/${customerId}/${branchId}?page=${page}&limit=${limit}`,
    { headers: { "x-auth-token": token } }
  );
  return { ...response.data } as GetCustomerSalesResponse;
};

type GetCustomerPaymentsResponse = {
  payments: PaymentType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};



export const getCustomerPayments = async (
  customerId: string,
  branchId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetCustomerPaymentsResponse> => {
  const token = await extractToken();
  const response = await api.get(
    `/payments/read/customer/${customerId}/${branchId}?page=${page}&limit=${limit}`,
    { headers: { "x-auth-token": token } }
  );
  return { ...response.data } as GetCustomerPaymentsResponse;
};

