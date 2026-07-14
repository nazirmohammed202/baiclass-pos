import {
  COMPANY_MEMBER_ROLES,
  ROLE_PRESETS,
  type Permission,
  type RolePresetName,
} from "@/lib/generated/permissions";

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  salesperson: "Salesperson",
  salesPerson: "Salesperson",
  cashier: "Cashier",
  warehouse: "Warehouse",
};

/** Roles shown in invite / change-role dropdowns */
export const ASSIGNABLE_ROLES = [
  ...COMPANY_MEMBER_ROLES,
  // Present in ROLE_PRESETS but not yet in companyMemberRoles — keep invite-ready
  "warehouse",
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export function roleLabel(role: string | undefined | null): string {
  if (!role) return "Unknown";
  return ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Map API / member role string → ROLE_PRESETS key.
 * Backend uses both "salesperson" (companyMemberRoles) and "salesPerson" (presets).
 */
export function toPresetKey(role: string): RolePresetName | null {
  if (role === "salesperson") return "salesPerson";
  if (role in ROLE_PRESETS) return role as RolePresetName;
  return null;
}

export function permissionsForRole(role: string): readonly Permission[] {
  const key = toPresetKey(role);
  if (!key) return [];
  return ROLE_PRESETS[key];
}

export function roleBadgeClasses(role: string): string {
  const key = role.toLowerCase();
  if (key === "admin") {
    return "bg-primary/10 text-primary ring-primary/20";
  }
  if (key === "salesperson") {
    return "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900";
  }
  if (key === "cashier") {
    return "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900";
  }
  if (key === "warehouse") {
    return "bg-violet-50 text-violet-900 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-900";
  }
  return "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:ring-neutral-700";
}
