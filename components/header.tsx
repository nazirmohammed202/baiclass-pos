"use client";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { AccountType, BranchType, CompanyType } from "@/types";
import { Suspense, use, useEffect } from "react";
import { useCompany } from "@/context/companyContext";

const chips = ["overview", "menu", "analytics", "settings"];

type HeaderProps = {
  branch: Promise<BranchType>;
  company: Promise<CompanyType>;
  account: AccountType;
};

// Separate component for company breadcrumb that uses the promise
const CompanyBreadcrumb = ({ company }: { company: Promise<CompanyType> }) => {
  const companyData = use(company);
  const { setCompany } = useCompany();
  useEffect(() => {
    setCompany(companyData);
  }, [companyData, setCompany]);
  return <>{companyData.name} &gt; </>;
};

// Separate component for branch breadcrumb that uses the promise
const BranchBreadcrumb = ({ branch }: { branch: Promise<BranchType> }) => {
  const branchData = use(branch);
  return <>{branchData.name}</>;
};

const Header = ({ branch, company, account }: HeaderProps) => {
  const pathname = usePathname();
  const params = useParams();
  const withoutBranch = pathname?.split("/").filter(Boolean).slice(1).join("/");
  const current = withoutBranch.split("/").pop();
  const { setAccount } = useCompany();

  useEffect(() => {
    setAccount(account);
  }, [account, setAccount]);

  return (
    <header className="p-2 sm:p-3">
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 flex-nowrap overflow-x-auto">
          <div className="shrink-0">
            <Image
              src="/baiclass.png"
              alt="Baiclass Logo"
              className="w-10 h-10 sm:w-12 sm:h-12"
              width={50}
              height={50}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-nowrap shrink-0">
            {chips.map((chip: string) => {
              const match = withoutBranch.split("/").includes(chip);
              return (
                <Link
                  href={`/${params.branchId}/${chip}`}
                  key={chip}
                  className="shrink-0"
                >
                  <div
                    className={
                      match ? "header-chip-active  text-white" : "header-chip"
                    }
                  >
                    <p className="capitalize text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap">
                      {chip}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Search and Account Info */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap lg:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex items-center flex-1 min-w-0 lg:min-w-[200px]">
            <span className="absolute left-2 sm:left-3 text-gray-400 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  x1="16.5"
                  y1="16.5"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white dark:bg-neutral-900 dark:border-none border border-gray-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Account Info */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-neutral-900 rounded-full shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm shrink-0">
              {account.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {account.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {account.phoneNumber}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-1 mt-2 ml-1 sm:ml-2 flex-wrap overflow-x-auto">
        <Link href={`/select-branch`} className="shrink-0">
          <span className="breadcrumb-active text-xs sm:text-sm">
            <Suspense
              fallback={
                <div className="h-3 w-12 sm:w-16 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
              }
            >
              <CompanyBreadcrumb company={company} />
            </Suspense>
          </span>
        </Link>

        <Link href={`/${params.branchId}/menu`} className="shrink-0">
          <span className="breadcrumb-active text-xs sm:text-sm">
            <Suspense
              fallback={
                <div className="h-3 w-12 sm:w-16 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
              }
            >
              <BranchBreadcrumb branch={branch} />
            </Suspense>
          </span>
        </Link>
        {withoutBranch.split("/").map((item) => {
          const match = current === item;

          const position = pathname.split("/").indexOf(item);
          const href = pathname
            .split("/")
            .slice(0, position + 1)
            .join("/");

          return (
            <Link href={`${href}`} key={item} className="shrink-0">
              <span
                key={item}
                className={`text-xs sm:text-sm ${
                  !match ? "breadcrumb-active" : "breadcrumb-inactive"
                }`}
              >
                {" "}
                &gt; {item}
              </span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default Header;
