import { redirect } from "next/navigation";
import { getAccount } from "@/lib/auth-actions";
import {
  ACTIONS,
  canAccessMenuRoute,
  canPerform,
} from "@/lib/permission-gates";

/** Soft-guard a menu deep-link: redirect to menu if the user lacks access. */
export async function requireMenuAccess(branchId: string, route: string) {
  const account = await getAccount();
  if (!canAccessMenuRoute(account, route, branchId)) {
    redirect(`/${branchId}/menu`);
  }
  return account;
}

/** Soft-guard by a named action from ACTIONS. */
export async function requireAction(
  branchId: string,
  action: keyof typeof ACTIONS
) {
  const account = await getAccount();
  if (!canPerform(account, action, branchId)) {
    redirect(`/${branchId}/menu`);
  }
  return account;
}
