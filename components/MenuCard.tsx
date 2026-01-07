"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { ChartBarIcon, HistoryIcon, ShoppingCartIcon } from "lucide-react";

type MenuCardProps = {
  saleItem: {
    name: string;
    icon: string;
    route: string;
    description: string;
  };
};
export const MenuCard = ({ saleItem }: MenuCardProps) => {
  const router = useRouter();
  const path = usePathname();

  return (
    <div
      className="w-full bg-white min-h-[120px] sm:min-h-[140px] h-fit p-4 sm:p-5 rounded-md flex flex-col justify-center gap-3 sm:gap-4 cursor-pointer hover:text-primary hover:shadow-md transition-all duration-200 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 active:scale-[0.98]"
      onClick={() => {
        router.push(path + saleItem.route);
      }}
    >
      <RenderIcon icon={saleItem.icon} />
      <p className="text-xl sm:text-2xl font-bold">{saleItem.name}</p>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
        {saleItem.description}
      </p>
    </div>
  );
};

const RenderIcon = ({ icon }: { icon: string }) => {
  const iconSize = 32; // Base size
  const iconClass = "w-8 h-8 sm:w-10 sm:h-10 text-gray-700 dark:text-gray-300";

  switch (icon) {
    case "ShoppingCart":
      return <ShoppingCartIcon className={iconClass} size={iconSize} />;
    case "History":
      return <HistoryIcon className={iconClass} size={iconSize} />;
    case "ChartBar":
      return <ChartBarIcon className={iconClass} size={iconSize} />;
    default:
      return null;
  }
};
