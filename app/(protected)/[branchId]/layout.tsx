import { AllSystemProducts } from "@/components/AllSytemProducts";
import Header from "@/components/header";
import { getAccount, getCompany } from "@/lib/auth-actions";
import { getBranch } from "@/lib/branch-actions";
import { getAllProducts } from "@/lib/product-actions";
import React, { Suspense } from "react";

interface BranchLayoutProps {
  children: React.ReactNode;
  params: Promise<{ branchId: string }>;
}

export default async function BranchLayout({
  children,
  params,
}: BranchLayoutProps) {
  const paramsData = await params;
  const account = await getAccount();
  const branch = getBranch(paramsData.branchId);
  const company = getCompany(account.company._id);
  const allSystemProducts = getAllProducts(account.company._id);

  return (
    <div className="h-screen  flex flex-col">
      <Header branch={branch} company={company} account={account} />
      <Suspense fallback={null}>
        <AllSystemProducts products={allSystemProducts} />
      </Suspense>
      {children}
    </div>
  );
}
