import React from "react";
import { getAccount } from "@/lib/auth-actions";
import { getBranch } from "@/lib/branch-actions";
import SettingsClient from "./SettingsClient";

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) => {
  const { branchId } = await params;
  const [branch, account] = await Promise.all([
    getBranch(branchId),
    getAccount(),
  ]);

  return (
    <SettingsClient
      branchId={branchId}
      branch={branch ?? null}
      account={account ?? null}
    />
  );
};

export default SettingsPage;
