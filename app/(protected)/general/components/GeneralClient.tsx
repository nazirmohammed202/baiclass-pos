"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type {
  AccountType,
  CompanyAnalyticsBundle,
  CompanyType,
  TeamMember,
} from "@/types";
import OverviewSection from "./OverviewSection";
import TeamSection from "./TeamSection";

type GeneralClientProps = {
  account: AccountType;
  company: CompanyType;
  members: TeamMember[];
  membersFromApi: boolean;
  membersError: string | null;
  periodLabel: string;
  analytics: CompanyAnalyticsBundle;
};

export default function GeneralClient({
  account,
  company,
  members,
  membersFromApi,
  membersError,
  periodLabel,
  analytics,
}: GeneralClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") === "team" ? "team" : "overview";

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
