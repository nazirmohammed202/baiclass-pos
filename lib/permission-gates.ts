import { P, type Permission } from "@/lib/generated/permissions";
import {
  hasAnyPermission,
  hasPermission,
  type PermissionSource,
} from "@/lib/permissions";

/** Required permission(s) to show a header chip. Null = always visible. */
export const HEADER_CHIP_PERMISSIONS: Record<
  string,
  Permission | readonly Permission[] | null
> = {
  overview: null,
  menu: null,
  analytics: P.ANALYTICS_READ,
  settings: null,
};

/** Menu card route → required permission(s). */
export const MENU_ITEM_PERMISSIONS: Record<
  string,
  Permission | readonly Permission[]
> = {
  "/new-sale": P.SALE_CREATE,
  "/new-sale?customDate=true": P.SALE_CREATE,
  "/sales-history": P.SALE_READ,
  "/sales-report": P.SALES_SHIFT_READ,
  "/sales-history?mode=returns": [P.SALE_UPDATE, P.SALE_VOID],
  "/add-expense": P.SALES_SHIFT_ADD_EXPENSE,
  "/stock": [P.PRODUCT_READ, P.BRANCH_READ_PRODUCT_STOCK],
  "/receive-stock": P.INVENTORY_RECEIPT_CREATE,
  "/stock-history": P.INVENTORY_RECEIPT_READ,
  "/stock-report": [P.BRANCH_READ_PRODUCT_STOCK, P.PRODUCT_READ],
  "/customers": P.CUSTOMER_READ,
  "/suppliers": P.SUPPLIER_READ,
  "/end-of-day": P.SALES_SHIFT_END_DAY,
};

/** Global search nav item id → required permission(s). Null = always visible. */
export const SEARCH_NAV_PERMISSIONS: Record<
  string,
  Permission | readonly Permission[] | null
> = {
  "nav-overview": null,
  "nav-menu": null,
  "nav-analytics": P.ANALYTICS_READ,
  "nav-settings": null,
  "sales-new": P.SALE_CREATE,
  "sales-custom-date": P.SALE_CREATE,
  "sales-history": P.SALE_READ,
  "sales-report": P.SALES_SHIFT_READ,
  "sales-returns": [P.SALE_UPDATE, P.SALE_VOID],
  "sales-expense": P.SALES_SHIFT_ADD_EXPENSE,
  "inv-catalog": [P.PRODUCT_READ, P.BRANCH_READ_PRODUCT_STOCK],
  "inv-stock": [P.PRODUCT_READ, P.BRANCH_READ_PRODUCT_STOCK],
  "inv-receive": P.INVENTORY_RECEIPT_CREATE,
  "inv-history": P.INVENTORY_RECEIPT_READ,
  "inv-report": [P.BRANCH_READ_PRODUCT_STOCK, P.PRODUCT_READ],
  "cs-customers": P.CUSTOMER_READ,
  "cs-suppliers": P.SUPPLIER_READ,
  "reg-eod": P.SALES_SHIFT_END_DAY,
  "analytics-kpi": P.ANALYTICS_READ,
  "analytics-trend": P.ANALYTICS_READ,
  "analytics-inventory": P.ANALYTICS_READ,
  "settings-branch": P.BRANCH_UPDATE,
  "settings-account": P.ACCOUNT_UPDATE,
};

export const ACTIONS = {
  saleView: P.SALE_READ,
  saleEdit: P.SALE_UPDATE,
  saleVoid: P.SALE_VOID,
  saleCreate: P.SALE_CREATE,
  stockAdjust: P.BRANCH_UPDATE_PRODUCT_STOCK,
  stockEditThreshold: P.BRANCH_UPDATE_PRODUCT_STOCK,
  stockEditPrice: P.PRODUCT_UPDATE,
  stockEditDetails: P.PRODUCT_UPDATE,
  stockRemove: P.PRODUCT_DELETE,
  stockAddProduct: P.PRODUCT_CREATE,
  receiveStock: P.INVENTORY_RECEIPT_CREATE,
  inventoryReceiptUpdate: P.INVENTORY_RECEIPT_UPDATE,
  inventoryReceiptVoid: P.INVENTORY_RECEIPT_VOID,
  customerCreate: P.CUSTOMER_CREATE,
  customerUpdate: P.CUSTOMER_UPDATE,
  customerDelete: P.CUSTOMER_DELETE,
  supplierCreate: P.SUPPLIER_CREATE,
  supplierUpdate: P.SUPPLIER_UPDATE,
  supplierDelete: P.SUPPLIER_DELETE,
  paymentCreate: P.PAYMENT_CREATE,
  expenseAdd: P.SALES_SHIFT_ADD_EXPENSE,
  expenseRemove: P.SALES_SHIFT_REMOVE_EXPENSE,
  branchSettings: P.BRANCH_UPDATE,
  accountSettings: P.ACCOUNT_UPDATE,
  analytics: P.ANALYTICS_READ,
} as const;

function matchesRequirement(
  source: PermissionSource,
  requirement: Permission | readonly Permission[] | null | undefined,
  branchId?: string
): boolean {
  if (requirement == null) return true;
  if (typeof requirement === "string") {
    return hasPermission(source, requirement, branchId);
  }
  return hasAnyPermission(source, requirement, branchId);
}

export function canAccessHeaderChip(
  source: PermissionSource,
  chip: string,
  branchId?: string
): boolean {
  return matchesRequirement(
    source,
    HEADER_CHIP_PERMISSIONS[chip] ?? null,
    branchId
  );
}

export function canAccessMenuRoute(
  source: PermissionSource,
  route: string,
  branchId?: string
): boolean {
  const requirement = MENU_ITEM_PERMISSIONS[route];
  if (!requirement) return true;
  return matchesRequirement(source, requirement, branchId);
}

export function canAccessSearchNavItem(
  source: PermissionSource,
  itemId: string,
  branchId?: string
): boolean {
  return matchesRequirement(
    source,
    SEARCH_NAV_PERMISSIONS[itemId] ?? null,
    branchId
  );
}

export function canPerform(
  source: PermissionSource,
  action: keyof typeof ACTIONS,
  branchId?: string
): boolean {
  return hasPermission(source, ACTIONS[action], branchId);
}
