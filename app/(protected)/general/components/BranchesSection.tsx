"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Warehouse,
} from "lucide-react";
import type { BranchType, CompanyType } from "@/types";
import BranchFormModal from "./BranchFormModal";

type BranchesSectionProps = {
  company: CompanyType;
  branches: BranchType[];
  branchesFromApi: boolean;
};

function pct(v: number | undefined): string {
  if (typeof v !== "number" || v <= 0) return "—";
  return `${Math.round(v * 100)}%`;
}

export default function BranchesSection({
  company,
  branches,
  branchesFromApi,
}: BranchesSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<BranchType | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q) ||
        b.phoneNumber?.toLowerCase().includes(q)
    );
  }, [branches, query]);

  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Branches
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {branches.length} branch{branches.length === 1 ? "" : "es"} in{" "}
            {company.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 self-start"
        >
          <Plus className="w-4 h-4" />
          Add branch
        </button>
      </div>

      {!branchesFromApi ? (
        <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-lg px-3 py-2">
          Showing limited branch info. Full details couldn&apos;t be loaded from
          the server.
        </p>
      ) : null}

      {branches.length > 0 ? (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search branches..."
            className="b-input pl-9"
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-10 text-center">
          <Building2 className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {branches.length === 0
              ? "No branches yet. Add your first branch to get started."
              : "No branches match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((branch) => (
            <div
              key={branch._id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 sm:p-5 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {branch.name}
                    </h3>
                    <div className="mt-1 space-y-1">
                      {branch.address ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{branch.address}</span>
                        </p>
                      ) : null}
                      {branch.phoneNumber ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {branch.phoneNumber}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end shrink-0">
                    {branch.settings?.isWarehouse ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        <Warehouse className="w-3 h-3" />
                        Warehouse
                      </span>
                    ) : null}
                    {branch.settings?.suspended ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">
                      Currency
                    </dt>
                    <dd className="font-medium text-gray-800 dark:text-gray-200">
                      {branch.settings?.currency || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">
                      Daily target
                    </dt>
                    <dd className="font-medium text-gray-800 dark:text-gray-200">
                      {branch.settings?.dailySalesTarget
                        ? `${branch.settings.currency ?? ""}${branch.settings.dailySalesTarget}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">
                      Retail margin
                    </dt>
                    <dd className="font-medium text-gray-800 dark:text-gray-200">
                      {pct(branch.settings?.retailPricePercentage)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">
                      Wholesale margin
                    </dt>
                    <dd className="font-medium text-gray-800 dark:text-gray-200">
                      {pct(branch.settings?.wholesalePricePercentage)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {branch.settings?.retailEnabled ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                      Retail
                    </span>
                  ) : null}
                  {branch.settings?.wholesaleEnabled ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                      Wholesale
                    </span>
                  ) : null}
                  {branch.settings?.creditEnabled ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                      Credit
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/60 dark:bg-neutral-800/30">
                <button
                  type="button"
                  onClick={() => setEditBranch(branch)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-neutral-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <Link
                  href={`/${branch._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Open branch
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        companyId={company._id}
        onSuccess={refresh}
      />
      <BranchFormModal
        isOpen={editBranch !== null}
        onClose={() => setEditBranch(null)}
        companyId={company._id}
        branch={editBranch}
        onSuccess={refresh}
      />
    </div>
  );
}
