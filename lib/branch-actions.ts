"use server";

import api from "@/config/api";
import { Product } from "@/types";
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";

export const getBranch = async (branchId: string) => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) throw new Error("No token found");

  const getBranchCached = async (branchId: string) => {
    "use cache";
    cacheLife("minutes");
    cacheTag("branch:" + branchId);
    const response = await api.get(`/branches/read/${branchId}`, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  };

  return getBranchCached(branchId);
};

export const getBranchCustomers = async (branchId: string) => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) throw new Error("No token found");

  const getBranchCustomersCached = async (branchId: string) => {
    "use cache";
    cacheLife("minutes");
    cacheTag("branch-customers:" + branchId);
    const response = await api.get(`/branch/read/customers/${branchId}`, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  };

  return getBranchCustomersCached(branchId);
};

export const getBranchProductsMetadata = async (branchId: string) => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) throw new Error("No token found");

  const getBranchProductsCached = async (branchId: string) => {
    "use cache";
    cacheLife("hours");
    cacheTag("branch-products-metadata:" + branchId);

    const response = await api.get(
      `/branch/read/products-metadata/${branchId}`,
      {
        headers: { "x-auth-token": token },
      }
    );
    return response.data as Product[];
  };

  return getBranchProductsCached(branchId);
};

export const getBranchProductsStockData = async (branchId: string) => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) throw new Error("No token found");

  await new Promise((resolve) => setTimeout(resolve, 10000));

  const getBranchProductsCached = async (branchId: string) => {
    const response = await api.get(
      `/branch/read/products-stock-data/${branchId}`,
      {
        headers: { "x-auth-token": token },
      }
    );
    return response.data as Product[];
  };

  return getBranchProductsCached(branchId);
};
