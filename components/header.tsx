"use client";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AccountType, BranchType, CompanyType } from "@/types";
import { Suspense, use, useEffect } from "react";
import GlobalSearch from "./GlobalSearch";
import { useCompany } from "@/context/companyContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { logout } from "@/lib/auth-actions";

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
  const router = useRouter();
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
          <GlobalSearch />

          {/* Account Info */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-neutral-900 rounded-full shrink-0 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm shrink-0">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col min-w-0 text-left">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {account.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {account.phoneNumber}
                  </span>
                </div>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className="z-[200] min-w-[220px] rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-1"
              >
                <DropdownMenu.Item
                  onSelect={() => router.push(`/${params.branchId}/settings`)}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none hover:bg-gray-50 dark:hover:bg-neutral-800 focus:bg-gray-50 dark:focus:bg-neutral-800"
                >
                  <Settings className="h-4 w-4 opacity-80" />
                  Account settings
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-neutral-800" />

                <DropdownMenu.Item
                  onSelect={async () => {
                    await logout();
                  }}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 outline-none hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4 opacity-80" />
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
