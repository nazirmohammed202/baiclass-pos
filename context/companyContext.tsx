"use client";
import { AccountType, CompanyType, ProductDetailsType } from "@/types";
import React, { useState } from "react";

const CompanyContext = React.createContext<{
  company: CompanyType | null;
  setCompany: (company: CompanyType) => void;
  allSystemProducts: ProductDetailsType[] | null;
  setAllSystemProducts: (products: ProductDetailsType[]) => void;
  account: AccountType | null;
  setAccount: (account: AccountType) => void;
} | null>(null);

export const CompanyProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [account, setAccount] = useState<AccountType | null>(null);
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [allSystemProducts, setAllSystemProducts] = useState<
    ProductDetailsType[] | null
  >(null);

  return (
    <CompanyContext.Provider
      value={{
        account,
        setAccount,
        company,
        setCompany,
        allSystemProducts,
        setAllSystemProducts,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = React.useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }

  return context;
};
