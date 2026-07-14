"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useCompany } from "@/context/companyContext";
import type { Permission } from "@/lib/generated/permissions";
import {
  getAccountPermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/permissions";
import {
  ACTIONS,
  canAccessHeaderChip,
  canAccessMenuRoute,
  canAccessSearchNavItem,
  canPerform,
} from "@/lib/permission-gates";

export function usePermissions() {
  const { account } = useCompany();
  const params = useParams();
  const branchId =
    typeof params?.branchId === "string" ? params.branchId : undefined;

  return useMemo(() => {
    const can = (permission: Permission) =>
      hasPermission(account, permission, branchId);
    const canAny = (permissions: readonly Permission[]) =>
      hasAnyPermission(account, permissions, branchId);
    const canAll = (permissions: readonly Permission[]) =>
      hasAllPermissions(account, permissions, branchId);

    return {
      account,
      branchId,
      permissions: getAccountPermissions(account, branchId),
      role: account?.role,
      can,
      canAny,
      canAll,
      canPerform: (action: keyof typeof ACTIONS) =>
        canPerform(account, action, branchId),
      canAccessHeaderChip: (chip: string) =>
        canAccessHeaderChip(account, chip, branchId),
      canAccessMenuRoute: (route: string) =>
        canAccessMenuRoute(account, route, branchId),
      canAccessSearchNavItem: (itemId: string) =>
        canAccessSearchNavItem(account, itemId, branchId),
    };
  }, [account, branchId]);
}
