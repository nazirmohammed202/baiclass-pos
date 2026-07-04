"use server";

import { getBranchProductsMetadata } from "./branch-actions";
import { getCustomers } from "./customer-actions";
import { getSuppliers } from "./suppliers-actions";
import type { CustomerType, Product, SupplierType } from "@/types";

export type GlobalSearchEntityResult = {
  customers: CustomerType[];
  products: Product[];
  suppliers: SupplierType[];
};

export async function fetchGlobalSearchEntities(
  branchId: string
): Promise<GlobalSearchEntityResult> {
  const [customers, products, suppliers] = await Promise.all([
    getCustomers(branchId),
    getBranchProductsMetadata(branchId),
    getSuppliers(branchId),
  ]);

  return { customers, products, suppliers };
}
