import React from "react";
import { MenuCard } from "@/components/MenuCard";

type SaleItem = {
  name: string;
  icon: string;
  route: string;
  description: string;
};

const Dashboard = async () => {
  const salesList: SaleItem[] = [
    {
      name: "New Sale",
      icon: "ShoppingCart",
      route: "/new-sale",
      description: "Start a new sale transaction",
    },
    {
      name: "Custom Date",
      icon: "ShoppingCart",
      route: "/custom-date-sale",
      description: "Enter sales for a specific date ",
    },
    {
      name: "Sales History",
      icon: "History",
      route: "/sales-history",
      description: "View your past sales transactions",
    },
    {
      name: "Sales Reports",
      icon: "ChartBar",
      route: "/sales-reports",
      description: "Generate sales performance reports",
    },
  ];

  // await new Promise((resolve) => setTimeout(resolve, 8000));

  return (
    <main className="p-3 sm:p-4 lg:p-6">
      <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Sales</p>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {salesList.map((saleItem: SaleItem, index: number) => (
          <MenuCard key={index} saleItem={saleItem} />
        ))}
      </section>
    </main>
  );
};

export default Dashboard;
