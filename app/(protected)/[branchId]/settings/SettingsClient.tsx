"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Settings2, Loader2 } from "lucide-react";
import { useToast } from "@/context/toastContext";
import { updateBranch } from "@/lib/branch-actions";
import { updateAccount } from "@/lib/auth-actions";
import type { AccountType, BranchType } from "@/types";

type TabId = "branch" | "account";

type SettingsClientProps = {
  branchId: string;
  branch: BranchType | null;
  account: AccountType | null;
};

const defaultBranchSettings = () => ({
  currency: "",
  retailPricePercentage: 0,
  wholesalePricePercentage: 0,
  dailySalesTarget: 0,
  retailEnabled: true,
  wholesaleEnabled: true,
  creditEnabled: false,
  roundRetailPrices: false,
  roundWholesalePrices: false,
  isWarehouse: false,
  suspended: false,
});

const SettingsClient = ({ branchId, branch, account }: SettingsClientProps) => {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("branch");

  // Branch form state
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchSettings, setBranchSettings] = useState(defaultBranchSettings());
  const [savingBranch, setSavingBranch] = useState(false);

  // Account form state
  const [accountName, setAccountName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // Sync form state from props
  useEffect(() => {
    if (branch) {
      Promise.resolve().then(() => {
        setBranchName(String(branch.name ?? ""));
        setBranchAddress(String(branch.address ?? ""));
        setBranchPhone(String(branch.phoneNumber ?? ""));
        const s = branch.settings;
        if (s) {
          // API stores 0-1; we store 0-100 in state so inputs show whole numbers (e.g. 25)
          setBranchSettings({
            currency: String(s.currency ?? ""),
            retailPricePercentage: ((Number(s.retailPricePercentage) ?? 0) * 100),
            wholesalePricePercentage: ((Number(s.wholesalePricePercentage) ?? 0) * 100),
            dailySalesTarget: Number(s.dailySalesTarget) ?? 0,
            retailEnabled: s.retailEnabled ?? true,
            wholesaleEnabled: s.wholesaleEnabled ?? true,
            creditEnabled: s.creditEnabled ?? false,
            roundRetailPrices: s.roundRetailPrices ?? false,
            roundWholesalePrices: s.roundWholesalePrices ?? false,
            isWarehouse: s.isWarehouse ?? false,
            suspended: s.suspended ?? false,
          });
        }

      });
    }
  }, [branch]);

  useEffect(() => {
    if (account) {
      Promise.resolve().then(() => {
        setAccountName(String(account.name ?? ""));
        setAccountPhone(String(account.phoneNumber ?? ""));
      });
    }
  }, [account]);

  const handleSaveBranch = async () => {
    if (!branch) return;
    setSavingBranch(true);
    const result = await updateBranch(branchId, {
      name: String(branchName ?? "").trim() || undefined,
      address: String(branchAddress ?? "").trim() || undefined,
      phoneNumber: String(branchPhone ?? "").trim() || undefined,
      settings: {
        currency: String(branchSettings.currency ?? "").trim() || (branch.settings?.currency ?? ""),
        // State holds 0-100; send as-is, backend converts to 0-1
        retailPricePercentage: branchSettings.retailPricePercentage >= 0
          ? branchSettings.retailPricePercentage
          : ((branch.settings?.retailPricePercentage ?? 0) * 100),
        wholesalePricePercentage: branchSettings.wholesalePricePercentage >= 0
          ? branchSettings.wholesalePricePercentage
          : ((branch.settings?.wholesalePricePercentage ?? 0) * 100),
        dailySalesTarget:
          branchSettings.dailySalesTarget >= 0
            ? branchSettings.dailySalesTarget
            : (branch.settings?.dailySalesTarget ?? 0),
        retailEnabled: branchSettings.retailEnabled,
        wholesaleEnabled: branchSettings.wholesaleEnabled,
        creditEnabled: branchSettings.creditEnabled,
        roundRetailPrices: branchSettings.roundRetailPrices,
        roundWholesalePrices: branchSettings.roundWholesalePrices,
        isWarehouse: branchSettings.isWarehouse,
        suspended: branchSettings.suspended,
      },
    });
    setSavingBranch(false);
    if (result.success) {
      toastSuccess("Branch settings saved");
      router.refresh();
    } else {
      toastError(result.error ?? "Failed to save branch settings");
    }
  };

  const handleSaveAccount = async () => {
    if (!account) return;
    setSavingAccount(true);
    const result = await updateAccount({
      name: String(accountName ?? "").trim() || undefined,
      phoneNumber: String(accountPhone ?? "").trim() || undefined,
    });
    setSavingAccount(false);
    if (result.success) {
      toastSuccess("Account settings saved");
      router.refresh();
    } else {
      toastError(result.error ?? "Failed to save account settings");
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "branch", label: "Branch settings", icon: <Building2 className="w-4 h-4" /> },
    { id: "account", label: "Account settings", icon: <User className="w-4 h-4" /> },
  ];

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const helpClass =
    "block text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2";

  return (
    <main className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings2 className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage branch and account preferences
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-neutral-800 mb-6 border border-gray-200 dark:border-neutral-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${activeTab === tab.id
              ? "bg-white dark:bg-neutral-700 text-primary shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "branch" && (
        <div className="space-y-6">
          {branch ? (
            <>
              {/* Branch info */}
              <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Branch information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Basic details about this location. Shown on receipts and can be used when customers look up your branch.
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className={labelClass}>Branch name</label>
                    <p className={helpClass}>The name of this outlet or location (e.g. &quot;Main Store&quot;, &quot;Accra Branch&quot;).</p>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Main Store"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <p className={helpClass}>Full address where this branch is located.</p>
                    <input
                      type="text"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                      className={inputClass}
                      placeholder="Street, city, region"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone number</label>
                    <p className={helpClass}>Contact number for this branch.</p>
                    <input
                      type="text"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. 0244 123 456"
                    />
                  </div>
                </div>
              </section>

              {/* Currency & daily target */}
              <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Currency and daily target
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    How amounts are displayed and what sales goal you aim for each day.
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className={labelClass}>Currency symbol</label>
                    <p className={helpClass}>The symbol shown next to prices (e.g. ₵ for Cedis, $ for Dollars, GH₵).</p>
                    <input
                      type="text"
                      value={branchSettings.currency}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, currency: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="e.g. ₵ or GH₵"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Daily sales target</label>
                    <p className={helpClass}>The amount of sales you aim to reach each day. Used for reports and tracking—enter 0 if you don’t use targets.</p>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={
                        branchSettings.dailySalesTarget > 0
                          ? branchSettings.dailySalesTarget
                          : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        setBranchSettings((s) => ({
                          ...s,
                          dailySalesTarget: v === "" ? 0 : Number(v),
                        }));
                      }}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                </div>
              </section>

              {/* Sale types */}
              <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Types of sales allowed
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Turn on or off the ways you sell. When a type is off, staff cannot use it at the till.
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <input
                      type="checkbox"
                      checked={branchSettings.retailEnabled}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, retailEnabled: e.target.checked }))
                      }
                      className="mt-1 rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sell at retail prices</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Allow sales at normal (retail) prices, e.g. to walk-in customers buying a few items.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <input
                      type="checkbox"
                      checked={branchSettings.wholesaleEnabled}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, wholesaleEnabled: e.target.checked }))
                      }
                      className="mt-1 rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sell at wholesale prices</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Allow sales at lower (wholesale) prices, e.g. for bulk or trade customers.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <input
                      type="checkbox"
                      checked={branchSettings.creditEnabled}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, creditEnabled: e.target.checked }))
                      }
                      className="mt-1 rounded border-gray-300 dark:border-neutral-600 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sell on credit</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Allow customers to buy now and pay later. You can set credit prices and track what they owe.</p>
                    </div>
                  </label>
                </div>
              </section>

              {/* Price margins */}
              <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Price margins (mark-up)
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Extra percentage added on top of cost when working out retail or wholesale prices. For example, 20% means the selling price is cost plus 20%.
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <label className={labelClass}>Retail margin (%)</label>
                    <p className={helpClass}>Mark-up used for retail (normal) prices. Enter a number from 0 to 100 (e.g. 25 for 25%).</p>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={branchSettings.retailPricePercentage > 0 ? branchSettings.retailPricePercentage : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBranchSettings((s) => ({
                          ...s,
                          retailPricePercentage: v === "" ? 0 : Number(v),
                        }));
                      }}
                      className={inputClass}
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Wholesale margin (%)</label>
                    <p className={helpClass}>Mark-up used for wholesale prices. Usually lower than retail (e.g. 10 or 15).</p>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={branchSettings.wholesalePricePercentage > 0 ? branchSettings.wholesalePricePercentage : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBranchSettings((s) => ({
                          ...s,
                          wholesalePricePercentage: v === "" ? 0 : Number(v),
                        }));
                      }}
                      className={inputClass}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>
              </section>

              {/* Rounding & branch type */}
              <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Rounding and branch type
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Optional: round prices to whole numbers, and mark this location as a warehouse or suspended.
                  </p>
                </div>
                <div className="p-4 sm:p-6 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <input
                      type="checkbox"
                      checked={branchSettings.roundRetailPrices}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, roundRetailPrices: e.target.checked }))
                      }
                      className="mt-1 rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Round retail prices to whole numbers</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">e.g. 19.99 becomes 20. Makes cash handling easier.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <input
                      type="checkbox"
                      checked={branchSettings.roundWholesalePrices}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, roundWholesalePrices: e.target.checked }))
                      }
                      className="mt-1 rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Round wholesale prices to whole numbers</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Same as above, but for wholesale prices.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <input
                      type="checkbox"
                      checked={branchSettings.isWarehouse}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, isWarehouse: e.target.checked }))
                      }
                      className="mt-1 rounded border-gray-300 dark:border-neutral-600 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">This location is a warehouse</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Use for storage or stock-only locations that don’t sell directly to customers.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-900/10">
                    <input
                      type="checkbox"
                      checked={branchSettings.suspended}
                      onChange={(e) =>
                        setBranchSettings((s) => ({ ...s, suspended: e.target.checked }))
                      }
                      className="mt-1 rounded border-gray-300 dark:border-neutral-600 text-red-500 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Branch is suspended</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Temporarily disable sales at this branch (e.g. closed for renovation or no longer operating).</p>
                    </div>
                  </label>
                </div>
              </section>

              {/* Save button */}
              <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Changes apply only after you click Save. You can edit several sections and save once.
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveBranch}
                    disabled={savingBranch}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingBranch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save branch settings"
                    )}
                  </button>
                </div>
              </section>
            </>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Could not load branch settings
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "account" && (
        <div className="space-y-6">
          {account ? (
            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Account information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Your profile details
                </p>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone number</label>
                  <input
                    type="text"
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                    className={inputClass}
                    placeholder="Phone number"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAccount}
                    disabled={savingAccount}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save account settings"
                    )}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-8 text-center">
              <User className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Could not load account settings
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default SettingsClient;
