import type { AccountType, CompanyType } from "@/types";
import {
  ALL_PERMISSIONS,
  P,
  type Permission,
} from "@/lib/generated/permissions";

/** Branch-scoped grant as returned by GET /accounts/read */
export type BranchPermissionGrant = {
  _id?: string;
  branch: string | { _id: string };
  permissions?: readonly string[] | null;
};

export type PermissionSource =
  | Pick<AccountType, "permissions">
  | {
      permissions?:
        | readonly string[]
        | readonly BranchPermissionGrant[]
        | null;
    }
  | null
  | undefined;

function grantBranchId(grant: BranchPermissionGrant): string {
  const branch = grant.branch;
  if (typeof branch === "string") return branch;
  if (branch && typeof branch === "object" && "_id" in branch) {
    return String(branch._id);
  }
  return "";
}

/**
 * Resolve the effective permission strings for an account.
 *
 * Handles both API shapes:
 * - flat: `permissions: ["sale:create", ...]`
 * - branch-scoped: `permissions: [{ branch, permissions: [...] }, ...]`
 *
 * With a `branchId`, only that branch's grant is used. Without one
 * (select-branch, /general), the union of all branches is used — good
 * enough for nav-level checks, never used for till actions.
 *
 * Accounts with no permissions data at all (pre-RBAC) fail open: the UI
 * shows everything and the API remains the enforcement point.
 */
export function getAccountPermissions(
  source: PermissionSource,
  branchId?: string
): readonly string[] {
  if (!source) return ALL_PERMISSIONS;

  const raw = source.permissions;
  if (raw == null) return ALL_PERMISSIONS;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  if (typeof raw[0] === "string") {
    return raw as readonly string[];
  }

  const grants = raw as readonly BranchPermissionGrant[];
  if (branchId) {
    const grant = grants.find((g) => grantBranchId(g) === branchId);
    return grant?.permissions ?? [];
  }
  return [...new Set(grants.flatMap((g) => g.permissions ?? []))];
}

export function hasPermission(
  source: PermissionSource,
  permission: Permission,
  branchId?: string
): boolean {
  return getAccountPermissions(source, branchId).includes(permission);
}

export function hasAnyPermission(
  source: PermissionSource,
  permissions: readonly Permission[],
  branchId?: string
): boolean {
  if (permissions.length === 0) return true;
  const granted = getAccountPermissions(source, branchId);
  return permissions.some((permission) => granted.includes(permission));
}

export function hasAllPermissions(
  source: PermissionSource,
  permissions: readonly Permission[],
  branchId?: string
): boolean {
  if (permissions.length === 0) return true;
  const granted = getAccountPermissions(source, branchId);
  return permissions.every((permission) => granted.includes(permission));
}

function memberAccountId(member: {
  account?: string | { _id: string };
  userId?: string;
}): string | undefined {
  if (member.userId) return member.userId;
  const account = member.account;
  if (typeof account === "string") return account;
  if (account && typeof account === "object") return account._id;
  return undefined;
}

/**
 * Who may open /general and manage the company team.
 * Company owner is always admin; otherwise checks account-admin
 * permissions on any branch, then the member's company role.
 */
export function canAccessGeneral(
  account: AccountType | null | undefined,
  company: CompanyType | null | undefined
): boolean {
  if (!account) return false;

  if (company?.owner && company.owner === account._id) return true;

  if (
    hasAnyPermission(account, [
      P.ACCOUNT_CREATE,
      P.ACCOUNT_UPDATE,
      P.ACCOUNT_DELETE,
    ])
  ) {
    return true;
  }

  const member = company?.members?.find(
    (m) => memberAccountId(m) === account._id
  );
  return (member?.role ?? "").toLowerCase() === "admin";
}

export function canManageTeam(
  account: AccountType | null | undefined,
  company: CompanyType | null | undefined
): boolean {
  return canAccessGeneral(account, company);
}
