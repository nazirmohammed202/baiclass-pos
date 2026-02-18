"use server";

import api from "@/config/api";
import { cacheLife, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { handleError } from "@/utils/errorHandlers";

export const extractToken = async () => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) throw new Error("No token found");
  return token;
};

export const getAccount = async () => {
  const token = await extractToken();
  const response = await api.get("/accounts/read", {
    headers: { "x-auth-token": token },
  });
  return response.data;
};

export type UpdateAccountPayload = {
  name?: string;
  phoneNumber?: string;
};

export const updateAccount = async (
  payload: UpdateAccountPayload
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.patch("/accounts/update", payload, {
      headers: { "x-auth-token": token },
    });
    revalidatePath("/", "layout");
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
};

export const getCompany = async (companyId: string) => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) throw new Error("No token found");

  const getCompanyCached = async (companyId: string) => {
    "use cache";
    cacheLife("hours");
    const response = await api.get(`/company/read/${companyId}`, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  };

  return getCompanyCached(companyId);
};
