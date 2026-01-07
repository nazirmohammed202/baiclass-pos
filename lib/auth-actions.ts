"use server";

import api from "@/config/api";
import { cacheLife } from "next/cache";
import { cookies } from "next/headers";

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
