"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Building2, LogOut, MapPin, Users } from "lucide-react";
import { logout } from "@/lib/auth-actions";
import type { AccountType, CompanyType } from "@/types";

type GeneralHeaderProps = {
  account: AccountType;
  company: CompanyType;
};

export default function GeneralHeader({ account, company }: GeneralHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "team" ? "team" : "overview";

  const tabs = [
    { id: "overview" as const, label: "Overview", href: "/general", icon: Building2 },
    {
      id: "team" as const,
      label: "Team",
      href: "/general?tab=team",
      icon: Users,
    },
  ];

  return (
    <header className="border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/baiclass.png"
            alt="Baiclass"
            width={40}
            height={40}
            className="w-10 h-10 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Company admin
            </p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {company.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <nav className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white dark:bg-neutral-700 text-primary shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/select-branch"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Open a branch</span>
            <span className="sm:hidden">Branch</span>
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-neutral-900 rounded-full border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-gray-100 pr-1 max-w-[120px] truncate">
                  {account.name}
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                align="end"
                className="z-[200] min-w-[200px] rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-1"
              >
                <DropdownMenu.Item
                  onSelect={() => router.push("/select-branch")}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  <MapPin className="h-4 w-4 opacity-80" />
                  Select branch
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-neutral-800" />
                <DropdownMenu.Item
                  onSelect={async () => {
                    await logout();
                  }}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 outline-none hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4 opacity-80" />
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
