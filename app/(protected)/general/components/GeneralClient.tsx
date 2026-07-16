"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type {
  AccountType,
  BranchType,
  CompanyAnalyticsBundle,
  CompanyType,
  TeamMember,
} from "@/types";
import OverviewSection from "./OverviewSection";
import TeamSection from "./TeamSection";
import BranchesSection from "./BranchesSection";

type GeneralClientProps = {
  account: AccountType;
  company: CompanyType;
  members: TeamMember[];
  membersFromApi: boolean;
  membersError: string | null;
  periodLabel: string;
  analytics: CompanyAnalyticsBundle;
  branches: BranchType[];
  branchesFromApi: boolean;
};

export default function GeneralClient({
  account,
  company,
  members,
  membersFromApi,
  membersError,
  periodLabel,
  analytics,
  branches,
  branchesFromApi,
}: GeneralClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const tab =
    tabParam === "team" || tabParam === "branches" ? tabParam : "overview";

  return (
    <main
      className={`p-4 sm:p-6 mx-auto ${
        tab === "team" ? "max-w-5xl" : "max-w-6xl"
      }`}
    >
      {tab === "team" ? (
        <TeamSection
          company={company}
          members={members}
          membersFromApi={membersFromApi}
          membersError={membersError}
          currentAccountId={account._id}
          onRefresh={() => router.refresh()}
        />
      ) : tab === "branches" ? (
        <BranchesSection
          company={company}
          branches={branches}
          branchesFromApi={branchesFromApi}
        />
      ) : (
        <OverviewSection
          company={company}
          periodLabel={periodLabel}
          analytics={analytics}
        />
      )}
    </main>
  );
}
