"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { createBranch, updateBranch } from "@/lib/branch-actions";
import { useToast } from "@/context/toastContext";
import type { BranchType } from "@/types";

type BranchFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  /** Provided when editing; omit/null to create a new branch. */
  branch?: BranchType | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  address: string;
  phoneNumber: string;
  currency: string;
  dailySalesTarget: string;
  retailPricePercentage: string;
  wholesalePricePercentage: string;
  retailEnabled: boolean;
  wholesaleEnabled: boolean;
  creditEnabled: boolean;
  roundRetailPrices: boolean;
  roundWholesalePrices: boolean;
  isWarehouse: boolean;
  suspended: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  address: "",
  phoneNumber: "",
  currency: "",
  dailySalesTarget: "",
  retailPricePercentage: "",
  wholesalePricePercentage: "",
  retailEnabled: true,
  wholesaleEnabled: true,
  creditEnabled: false,
  roundRetailPrices: false,
  roundWholesalePrices: false,
  isWarehouse: false,
  suspended: false,
});

const fromBranch = (branch: BranchType): FormState => {
  const s = branch.settings;
  const pct = (v: number | undefined) =>
    typeof v === "number" && v > 0 ? String(Math.round(v * 100)) : "";
  return {
    name: branch.name ?? "",
    address: branch.address ?? "",
    phoneNumber: branch.phoneNumber ?? "",
    currency: s?.currency ?? "",
    dailySalesTarget:
      s?.dailySalesTarget && s.dailySalesTarget > 0
        ? String(s.dailySalesTarget)
        : "",
    retailPricePercentage: pct(s?.retailPricePercentage),
    wholesalePricePercentage: pct(s?.wholesalePricePercentage),
    retailEnabled: s?.retailEnabled ?? true,
    wholesaleEnabled: s?.wholesaleEnabled ?? true,
    creditEnabled: s?.creditEnabled ?? false,
    roundRetailPrices: s?.roundRetailPrices ?? false,
    roundWholesalePrices: s?.roundWholesalePrices ?? false,
    isWarehouse: s?.isWarehouse ?? false,
    suspended: s?.suspended ?? false,
  };
};

export default function BranchFormModal({
  isOpen,
  onClose,
  companyId,
  branch,
  onSuccess,
}: BranchFormModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const isEdit = Boolean(branch);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    Promise.resolve().then(() => {
      setForm(branch ? fromBranch(branch) : emptyForm());
      setFormError(null);
    });
  }, [isOpen, branch]);

  if (!isOpen) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const buildSettings = () => {
    const num = (v: string) => {
      const n = Number(v);
      return v.trim() !== "" && !Number.isNaN(n) && n >= 0 ? n : undefined;
    };
    return {
      currency: form.currency.trim() || undefined,
      dailySalesTarget: num(form.dailySalesTarget),
      retailPricePercentage: num(form.retailPricePercentage),
      wholesalePricePercentage: num(form.wholesalePricePercentage),
      retailEnabled: form.retailEnabled,
      wholesaleEnabled: form.wholesaleEnabled,
      creditEnabled: form.creditEnabled,
      roundRetailPrices: form.roundRetailPrices,
      roundWholesalePrices: form.roundWholesalePrices,
      isWarehouse: form.isWarehouse,
      suspended: form.suspended,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    if (!name) {
      setFormError("Branch name is required.");
      return;
    }

    setSaving(true);
    const payload = {
      name,
      address: form.address.trim() || undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
      settings: buildSettings(),
    };

    const result = isEdit
      ? await updateBranch(branch!._id, payload)
      : await createBranch(companyId, payload);
    setSaving(false);

    if (!result.success) {
      const message =
        result.error ??
        (isEdit ? "Could not update branch." : "Could not create branch.");
      toastError(message);
      setFormError(message);
      return;
    }

    toastSuccess(isEdit ? "Branch updated." : "Branch created.");
    onSuccess();
    onClose();
  };

  const checkbox = (
    key: keyof FormState,
    title: string,
    help: string,
    danger = false
  ) => (
    <label
      className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border ${
        danger
          ? "border-red-200 dark:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-900/10"
          : "border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50"
      }`}
    >
      <input
        type="checkbox"
        checked={form[key] as boolean}
        onChange={(e) => set(key, e.target.checked as FormState[typeof key])}
        className={`mt-1 rounded border-gray-300 dark:border-neutral-600 focus:ring-primary ${
          danger ? "text-red-500 focus:ring-red-500" : "text-primary"
        }`}
      />
      <div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{help}</p>
      </div>
    </label>
  );

  const fieldLabel =
    "block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1";

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
        aria-labelledby="branch-form-title"
        className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2
            id="branch-form-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {isEdit ? "Edit branch" : "Add branch"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
              {formError}
            </p>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className={fieldLabel}>Branch name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="b-input"
                placeholder="e.g. Main Store"
                autoFocus
              />
            </div>
            <div>
              <label className={fieldLabel}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="b-input"
                placeholder="Street, city, region"
              />
            </div>
            <div>
              <label className={fieldLabel}>Phone number</label>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => set("phoneNumber", e.target.value)}
                className="b-input"
                placeholder="e.g. 0244 123 456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={fieldLabel}>Currency symbol</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className="b-input"
                placeholder="e.g. ₵ or GH₵"
              />
            </div>
            <div>
              <label className={fieldLabel}>Daily sales target</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.dailySalesTarget}
                onChange={(e) => set("dailySalesTarget", e.target.value)}
                className="b-input"
                placeholder="0"
              />
            </div>
            <div>
              <label className={fieldLabel}>Retail margin (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.retailPricePercentage}
                onChange={(e) => set("retailPricePercentage", e.target.value)}
                className="b-input"
                placeholder="e.g. 25"
              />
            </div>
            <div>
              <label className={fieldLabel}>Wholesale margin (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.wholesalePricePercentage}
                onChange={(e) =>
                  set("wholesalePricePercentage", e.target.value)
                }
                className="b-input"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Types of sales allowed
            </p>
            {checkbox(
              "retailEnabled",
              "Sell at retail prices",
              "Normal (retail) prices for walk-in customers."
            )}
            {checkbox(
              "wholesaleEnabled",
              "Sell at wholesale prices",
              "Lower prices for bulk or trade customers."
            )}
            {checkbox(
              "creditEnabled",
              "Sell on credit",
              "Allow customers to buy now and pay later."
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Rounding and branch type
            </p>
            {checkbox(
              "roundRetailPrices",
              "Round retail prices",
              "e.g. 19.99 becomes 20."
            )}
            {checkbox(
              "roundWholesalePrices",
              "Round wholesale prices",
              "Same as above, for wholesale prices."
            )}
            {checkbox(
              "isWarehouse",
              "This location is a warehouse",
              "Storage or stock-only location that doesn't sell directly."
            )}
            {checkbox(
              "suspended",
              "Branch is suspended",
              "Temporarily disable sales at this branch.",
              true
            )}
          </div>

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
              {isEdit ? "Save changes" : "Create branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
