"use client";
import { AccountType, CompanyType } from "@/types";
import { canAccessGeneral } from "@/lib/permissions";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SelectBranchProps = {
  account: AccountType;
  company: CompanyType;
};
const SelectBranch = ({ account, company }: SelectBranchProps) => {
  const [selected, setSelected] = useState<string>("");
  const router = useRouter();
  const showGeneral = canAccessGeneral(account, company);

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-primary">
          Select a Branch
        </h2>
        <p className="mb-6 text-center text-foreground opacity-80">
          <span>Hi👋 {account?.name}</span>, <br /> select a branch to continue.
        </p>

        <div className="mb-6">
          <select
            className="b-input w-full bg-background text-foreground border-[--border] dark:bg-neutral-900 dark:text-foreground dark:border-neutral-800 focus:border-primary focus:ring-2 focus:ring-primary appearance-none"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="" disabled>
              -- Select a branch --
            </option>
            {company.branches?.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn w-full mt-2"
          disabled={!selected}
          onClick={async () => {
            if (selected) router.push(`/${selected}/menu`);
          }}
        >
          Continue
        </button>

        {showGeneral ? (
          <Link
            href="/general"
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Building2 className="w-4 h-4" />
            Company admin
          </Link>
        ) : null}
      </div>
    </>
  );
};

export default SelectBranch;
