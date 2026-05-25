"use server";

import api from "@/config/api";
import { extractToken } from "./auth-actions";
import { handleError } from "@/utils/errorHandlers";
import { ExpenseType } from "@/types";
import { revalidatePath } from "next/cache";

export type CreateExpensePayload = {
  amount: number;
  description: string;
  date: string;
};

export const getExpenses = async (branchId: string, date: string): Promise<ExpenseType[]> => {
  try {
    const token = await extractToken();

    const response = await api.get(`/sales-shift/read/expenses/${date}?branch=${branchId}`, {
      headers: { "x-auth-token": token },
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching expenses:", handleError(error));
    return [];
  }
};

export const createExpense = async (
  branchId: string,
  payload: CreateExpensePayload
): Promise<{ success: boolean; error: string | null; expense: ExpenseType | null }> => {
  try {
    const token = await extractToken();
    const response = await api.post(`/sales-shift/create/expense/${branchId}`, payload, {
      headers: { "x-auth-token": token },
    });

    revalidatePath(`/${branchId}/menu/add-expense`);

    return {
      success: true,
      error: null,
      expense: response.data as ExpenseType,
    };
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    return {
      success: false,
      error: errorMessage,
      expense: null,
    };
  }
};
