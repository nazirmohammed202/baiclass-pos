import { Suspense } from "react";
import { getAccount, getCompany } from "@/lib/auth-actions";
import { getTeamMembers } from "@/lib/company-actions";
import type { AccountType, CompanyType, TeamMember } from "@/types";
import GeneralClient from "./components/GeneralClient";

function provisionalMembers(
  company: CompanyType,
  account: AccountType
): TeamMember[] {
  return (company.members ?? []).map((m) => {
    const populated =
      typeof m.account === "object" && m.account !== null ? m.account : null;
    const memberId =
      m.userId ??
      populated?._id ??
      (typeof m.account === "string" ? m.account : m._id ?? "");
    const isSelf = memberId === account._id;
    return {
      _id: memberId,
      name: isSelf ? account.name : populated?.name ?? "Team member",
      phoneNumber: isSelf
        ? account.phoneNumber
        : populated?.phoneNumber ?? "—",
      branchAccess: [],
      legacyRole: m.role,
      status: "active" as const,
    };
  });
}

export default async function GeneralPage() {
  const account = await getAccount();
  const companyId = account.company?._id;
  if (!companyId) {
    return null;
  }

  const company = await getCompany(companyId);
  const membersResult = await getTeamMembers(companyId);

  const membersFromApi = membersResult.success;
  const members: TeamMember[] = membersFromApi
    ? (membersResult.data ?? [])
    : provisionalMembers(company, account);

  return (
    <Suspense
      fallback={
        <main className="p-6 max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-10 w-48 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
        </main>
      }
    >
      <GeneralClient
        account={account}
        company={company}
        members={members}
        membersFromApi={membersFromApi}
        membersError={membersFromApi ? null : membersResult.error}
      />
    </Suspense>
  );
}
