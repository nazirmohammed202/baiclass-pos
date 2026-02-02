"use server";

import api from "@/config/api";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ProductDetailsType } from "@/types";
import { extractToken } from "./auth-actions";
import { handleError } from "@/utils/errorHandlers";

export type UpdateProductDetailsPayload = {
  name?: string;
  manufacturer?: string;
  nickname?: string;
  size?: string;
  type?: string;
};

export const getAllProducts = async (companyId: string) => {
  const token = (await cookies()).get("__baiclass")?.value;
  if (!token) throw new Error("No token found");

  const getAllProductsCached = async (companyId: string) => {
    "use cache";
    cacheLife("max");
    cacheTag("all-products:" + companyId);

    const response = await api.get(`/products/read/company/${companyId}`, {
      headers: { "x-auth-token": token },
    });
    return response.data as ProductDetailsType[];
  };

  return getAllProductsCached(companyId);
};

export const addSystemProductsToBranch = async (
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const branchId = formData.get("branchId") as string;
  let productIds = formData.get("productIds") as unknown as string[];
  productIds = productIds?.toString().split(",") || [];

  if (!branchId || !productIds) {
    return {
      error: "Branch ID and product IDs are required",
      success: false,
    };
  }

  try {
    const token = await extractToken();
    await api.post(
      `/products/create/system-products/${branchId}`,
      { products: productIds },
      {
        headers: { "x-auth-token": token },
      }
    );
    updateTag("branch-products-metadata:" + branchId);
    revalidatePath(`/${branchId}/menu/stock`);
    return {
      success: true,
      error: null,
    };
  } catch (ex) {
    throw ex;
  }
};

export const createNewProduct = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const manufacturer = formData.get("manufacturer") as string;
  const nickname = formData.get("nickname") as string;
  const type = formData.get("type") as string;
  const size = formData.get("size") as string;
  const factoryPrice = formData.get("factoryPrice") as string;
  const branchId = formData.get("branchId") as string;

  if (!name || !manufacturer || !type || !branchId) {
    throw new Error("Name, manufacturer, type, and branch ID are required");
  }

  try {
    const token = await extractToken();
    const productData: Record<string, unknown> = {
      name: name.trim(),
      manufacturer: manufacturer.trim(),
      type: type.toLowerCase(),
      branches: [branchId],
    };

    if (nickname) productData.nickname = nickname.trim();
    if (size) productData.size = size.trim();
    if (factoryPrice) productData.factoryPrice = Number(factoryPrice);

    await api.post("/products/create", productData, {
      headers: { "x-auth-token": token },
    });

    // Invalidate branch products cache
    updateTag("branch-products-metadata:" + branchId);
    revalidatePath(`/${branchId}/menu/stock`);
  } catch (error: unknown) {
    const errorMessage = handleError(error);
    throw new Error(errorMessage);
  }
};

export const updateProductDetails = async (
  productId: string,
  branchId: string,
  payload: UpdateProductDetailsPayload
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const token = await extractToken();
    await api.patch(`/products/update/details/${productId}`, payload, {
      headers: { "x-auth-token": token },
    });
    updateTag("branch-products-metadata:" + branchId);
    revalidatePath(`/${branchId}/menu/stock`);
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
};
