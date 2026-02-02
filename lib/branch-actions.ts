"use server";

import api from "@/config/api";
import { Product } from "@/types";
import { cacheLife, cacheTag, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { handleError } from "@/utils/errorHandlers";

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

export type UpdateBranchProductPayload = {
  productId: string;
  stock?: number;
  basePrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  lowStockThreshold?: number;
};

export const updateBranchProductStock = async (
  branchId: string,
  payload: UpdateBranchProductPayload
): Promise<{ success: boolean; error: string | null }> => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    await api.patch(
      `/branch/update/product-stock/${branchId}`,
      payload,
      { headers: { "x-auth-token": token } }
    );
    revalidatePath(`/${branchId}/menu/stock`);
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
};

export const removeProductFromBranch = async (
  branchId: string,
  productId: string
): Promise<{ success: boolean; error: string | null }> => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    await api.delete(
      `/branch/delete/product/${branchId}/${productId}`,
      { headers: { "x-auth-token": token } }
    );
    revalidatePath(`/${branchId}/menu/stock`);
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
};
