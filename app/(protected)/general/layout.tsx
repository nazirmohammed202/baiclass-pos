import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccount, getCompany } from "@/lib/auth-actions";
import { canAccessGeneral } from "@/lib/permissions";
import GeneralHeader from "./components/GeneralHeader";

export default async function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await getAccount();
  const companyId = account.company?._id;
  if (!companyId) {
    redirect("/select-branch");
  }

  const company = await getCompany(companyId);

  if (!canAccessGeneral(account, company)) {
    redirect("/select-branch");
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="h-[65px] border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" />
        }
      >
        <GeneralHeader account={account} company={company} />
      </Suspense>
      {children}
    </div>
  );
}
