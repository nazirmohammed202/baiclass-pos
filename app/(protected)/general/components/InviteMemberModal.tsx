"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { inviteTeamMember } from "@/lib/company-actions";
import {
  ASSIGNABLE_ROLES,
  roleLabel,
} from "@/lib/role-utils";
import { useToast } from "@/context/toastContext";
import type { CompanyType } from "@/types";
import RolePermissionPreview from "./RolePermissionPreview";

type BranchRow = {
  branchId: string;
  role: string;
};

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyType;
  onSuccess: () => void;
};

export default function InviteMemberModal({
  isOpen,
  onClose,
  company,
  onSuccess,
}: InviteMemberModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [rows, setRows] = useState<BranchRow[]>([
    { branchId: company.branches?.[0]?._id ?? "", role: "cashier" },
  ]);
  const [previewRole, setPreviewRole] = useState("cashier");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const branches = company.branches ?? [];

  const reset = () => {
    setPhoneNumber("");
    setName("");
    setRows([{ branchId: branches[0]?._id ?? "", role: "cashier" }]);
    setPreviewRole("cashier");
    setFormError(null);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const phone = phoneNumber.trim();
    if (!phone) {
      setFormError("Phone number is required.");
      return;
    }
    if (rows.length === 0 || rows.some((r) => !r.branchId || !r.role)) {
      setFormError("Add at least one branch with a role.");
      return;
    }
    const branchIds = rows.map((r) => r.branchId);
    if (new Set(branchIds).size !== branchIds.length) {
      setFormError("Each branch can only be listed once.");
      return;
    }

    setSaving(true);
    const result = await inviteTeamMember(company._id, {
      phoneNumber: phone,
      name: name.trim() || undefined,
      branchAccess: rows,
    });
    setSaving(false);

    if (!result.success) {
      toastError(result.error ?? "Could not invite member.");
      setFormError(result.error);
      return;
    }

    toastSuccess("Team member invited.");
    reset();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 bg-black/50"
        aria-label="Close"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-neutral-800">
          <h2
            id="invite-member-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Invite team member
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
              {formError}
            </p>
          ) : null}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Phone number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="b-input"
              placeholder="e.g. 0244123456"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Name <span className="normal-case opacity-70">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="b-input"
              placeholder="Used if creating a new account"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Branch access
              </label>
              <button
                type="button"
                onClick={() =>
                  setRows((prev) => [
                    ...prev,
                    {
                      branchId:
                        branches.find(
                          (b) => !prev.some((r) => r.branchId === b._id)
                        )?._id ?? "",
                      role: "cashier",
                    },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                disabled={rows.length >= branches.length}
              >
                <Plus className="w-3.5 h-3.5" />
                Add branch
              </button>
            </div>

            <div className="space-y-2">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-800/30"
                >
                  <select
                    value={row.branchId}
                    onChange={(e) => {
                      const branchId = e.target.value;
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, branchId } : r
                        )
                      );
                    }}
                    className="b-input flex-1 py-2"
                  >
                    <option value="" disabled>
                      Select branch
                    </option>
                    {branches.map((b) => (
                      <option
                        key={b._id}
                        value={b._id}
                        disabled={rows.some(
                          (r, i) => i !== index && r.branchId === b._id
                        )}
                      >
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={row.role}
                    onChange={(e) => {
                      const role = e.target.value;
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, role } : r
                        )
                      );
                      setPreviewRole(role);
                    }}
                    className="b-input sm:w-40 py-2"
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setRows((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 self-start"
                      aria-label="Remove branch row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <RolePermissionPreview role={previewRole} />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
