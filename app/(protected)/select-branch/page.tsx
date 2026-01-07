// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

import SelectBranch from "@/components/SelectBranch";
import { getAccount, getCompany } from "@/lib/auth-actions";

const BranchPage = async () => {
  const account = await getAccount();
  const company = await getCompany(account.company._id);

  return (
    <section className="flex min-h-screen items-center justify-center bg-background">
      <SelectBranch account={account} company={company} />
    </section>
  );
};

export default BranchPage;
