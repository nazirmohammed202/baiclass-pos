"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import {
  addMemberBranchAccess,
  removeMemberBranchAccess,
  removeTeamMember,
  updateMemberBranchRole,
} from "@/lib/company-actions";
import {
  ASSIGNABLE_ROLES,
  roleBadgeClasses,
  roleLabel,
} from "@/lib/role-utils";
import { useToast } from "@/context/toastContext";
import type { CompanyType, TeamMember } from "@/types";
import RolePermissionPreview from "./RolePermissionPreview";

type MemberDetailDrawerProps = {
  member: TeamMember | null;
  company: CompanyType;
  currentAccountId: string;
  onClose: () => void;
  onChanged: () => void;
};

export default function MemberDetailDrawer({
  member,
  company,
  currentAccountId,
  onClose,
  onChanged,
}: MemberDetailDrawerProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [addBranchId, setAddBranchId] = useState("");
  const [addRole, setAddRole] = useState("cashier");

  const availableBranches = useMemo(() => {
    if (!member) return [];
    const taken = new Set(member.branchAccess.map((b) => b.branchId));
    return (company.branches ?? []).filter((b) => !taken.has(b._id));
  }, [member, company.branches]);

  if (!member) return null;

  const branchName = (branchId: string, fallback?: string) =>
    fallback ||
    company.branches?.find((b) => b._id === branchId)?.name ||
    branchId;

  const run = async (key: string, fn: () => Promise<{ success: boolean; error: string | null }>) => {
    setBusyKey(key);
    const result = await fn();
    setBusyKey(null);
    if (!result.success) {
      toastError(result.error ?? "Request failed.");
      return;
    }
    toastSuccess("Updated.");
    onChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative w-full max-w-md h-full bg-white dark:bg-neutral-900 shadow-2xl border-l border-gray-200 dark:border-neutral-800 flex flex-col animate-in slide-in-from-right">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {member.name || "Team member"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {member.phoneNumber}
            </p>
            {member.legacyRole ? (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Legacy company role: {roleLabel(member.legacyRole)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Branch access
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Permissions are assigned per branch. Change the role to update what
              they can do at that location.
            </p>

            {member.branchAccess.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                No branch assignments yet. Add access below once the members API
                is connected.
              </div>
            ) : (
              <ul className="space-y-3">
                {member.branchAccess.map((access) => {
                  const perms =
                    access.permissions && access.permissions.length > 0
                      ? access.permissions
                      : null;
                  return (
                    <li
                      key={access.branchId}
                      className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {branchName(access.branchId, access.branchName)}
                          </p>
                          <span
                            className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${roleBadgeClasses(access.role)}`}
                          >
                            {roleLabel(access.role)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={busyKey === `rm-${access.branchId}`}
                          onClick={() =>
                            run(`rm-${access.branchId}`, () =>
                              removeMemberBranchAccess(
                                company._id,
                                member._id,
                                access.branchId
                              )
                            )
                          }
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                          title="Remove branch access"
                        >
                          {busyKey === `rm-${access.branchId}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <label className="block text-xs text-gray-500 dark:text-gray-400">
                        Change role
                        <select
                          value={access.role}
                          disabled={busyKey === `role-${access.branchId}`}
                          onChange={(e) => {
                            const role = e.target.value;
                            void run(`role-${access.branchId}`, () =>
                              updateMemberBranchRole(company._id, {
                                memberId: member._id,
                                branchId: access.branchId,
                                role,
                              })
                            );
                          }}
                          className="b-input mt-1 py-2 text-sm"
                        >
                          {ASSIGNABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {roleLabel(role)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {perms ? (
                        <ul className="max-h-28 overflow-y-auto text-xs font-mono text-gray-500 dark:text-gray-400 space-y-0.5 pt-1">
                          {perms.map((p) => (
                            <li key={String(p)}>{String(p)}</li>
                          ))}
                        </ul>
                      ) : (
                        <RolePermissionPreview
                          role={access.role}
                          className="pt-1"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {availableBranches.length > 0 ? (
            <section className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                Add branch access
              </h3>
              <select
                value={addBranchId}
                onChange={(e) => setAddBranchId(e.target.value)}
                className="b-input py-2"
              >
                <option value="">Select branch</option>
                {availableBranches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                className="b-input py-2"
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
              <RolePermissionPreview role={addRole} />
              <button
                type="button"
                disabled={!addBranchId || busyKey === "add-branch"}
                onClick={() =>
                  run("add-branch", async () => {
                    const result = await addMemberBranchAccess(company._id, {
                      memberId: member._id,
                      branchId: addBranchId,
                      role: addRole,
                    });
                    if (result.success) setAddBranchId("");
                    return result;
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {busyKey === "add-branch" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Grant access
              </button>
            </section>
          ) : null}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-neutral-800">
          <button
            type="button"
            disabled={
              member._id === currentAccountId || busyKey === "remove-member"
            }
            onClick={() => {
              if (
                !window.confirm(
                  `Remove ${member.name || "this member"} from the company?`
                )
              ) {
                return;
              }
              void (async () => {
                setBusyKey("remove-member");
                const result = await removeTeamMember(company._id, member._id);
                setBusyKey(null);
                if (!result.success) {
                  toastError(result.error ?? "Request failed.");
                  return;
                }
                toastSuccess("Member removed.");
                onChanged();
                onClose();
              })();
            }}
            className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40"
          >
            {member._id === currentAccountId
              ? "You can’t remove yourself here"
              : "Remove from company"}
          </button>
        </div>
      </aside>
    </div>
  );
}
