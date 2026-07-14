"use server";

import api from "@/config/api";
import { extractToken } from "@/lib/auth-actions";
import type { TeamMember } from "@/types";
import { handleError } from "@/utils/errorHandlers";
import { revalidatePath } from "next/cache";

export type InviteMemberPayload = {
  phoneNumber: string;
  name?: string;
  branchAccess: Array<{
    branchId: string;
    role: string;
  }>;
};

export type UpdateBranchRolePayload = {
  memberId: string;
  branchId: string;
  role: string;
};

export type AddBranchAccessPayload = {
  memberId: string;
  branchId: string;
  role: string;
};

type ActionResult<T = void> = {
  success: boolean;
  error: string | null;
  data?: T;
};

function revalidateGeneral() {
  revalidatePath("/general");
  revalidatePath("/select-branch");
}

/**
 * List enriched team members with per-branch role assignments.
 * Backend: GET /company/:companyId/members
 */
export async function getTeamMembers(
  companyId: string
): Promise<ActionResult<TeamMember[]>> {
  try {
    const token = await extractToken();
    const response = await api.get(`/company/${companyId}/members`, {
      headers: { "x-auth-token": token },
    });
    const raw = response.data;
    const members: TeamMember[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.members)
        ? raw.members
        : [];
    return { success: true, error: null, data: members };
  } catch (error: unknown) {
    return { success: false, error: handleError(error), data: [] };
  }
}

/**
 * Invite or attach a user to the company with one or more branch roles.
 * Backend: POST /company/:companyId/members
 */
export async function inviteTeamMember(
  companyId: string,
  payload: InviteMemberPayload
): Promise<ActionResult<TeamMember>> {
  try {
    const token = await extractToken();
    const response = await api.post(`/company/${companyId}/members`, payload, {
      headers: { "x-auth-token": token },
    });
    revalidateGeneral();
    return { success: true, error: null, data: response.data };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
}

/**
 * Change a member's role on a specific branch.
 * Backend: PATCH /company/:companyId/members/:memberId/branches/:branchId
 */
export async function updateMemberBranchRole(
  companyId: string,
  payload: UpdateBranchRolePayload
): Promise<ActionResult> {
  try {
    const token = await extractToken();
    await api.patch(
      `/company/${companyId}/members/${payload.memberId}/branches/${payload.branchId}`,
      { role: payload.role },
      { headers: { "x-auth-token": token } }
    );
    revalidateGeneral();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
}

/**
 * Grant access to an additional branch.
 * Backend: POST /company/:companyId/members/:memberId/branches
 */
export async function addMemberBranchAccess(
  companyId: string,
  payload: AddBranchAccessPayload
): Promise<ActionResult> {
  try {
    const token = await extractToken();
    await api.post(
      `/company/${companyId}/members/${payload.memberId}/branches`,
      { branchId: payload.branchId, role: payload.role },
      { headers: { "x-auth-token": token } }
    );
    revalidateGeneral();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
}

/**
 * Revoke access to one branch.
 * Backend: DELETE /company/:companyId/members/:memberId/branches/:branchId
 */
export async function removeMemberBranchAccess(
  companyId: string,
  memberId: string,
  branchId: string
): Promise<ActionResult> {
  try {
    const token = await extractToken();
    await api.delete(
      `/company/${companyId}/members/${memberId}/branches/${branchId}`,
      { headers: { "x-auth-token": token } }
    );
    revalidateGeneral();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
}

/**
 * Remove member from the company entirely.
 * Backend: DELETE /company/:companyId/members/:memberId
 */
export async function removeTeamMember(
  companyId: string,
  memberId: string
): Promise<ActionResult> {
  try {
    const token = await extractToken();
    await api.delete(`/company/${companyId}/members/${memberId}`, {
      headers: { "x-auth-token": token },
    });
    revalidateGeneral();
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: handleError(error) };
  }
}
