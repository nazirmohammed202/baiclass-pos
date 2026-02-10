import React from "react";
import { MenuCard } from "@/components/MenuCard";


type MenuItem = {
  name: string;
  icon: string;
  route: string;
  description: string;
};

const Dashboard = async () => {
  const salesList: MenuItem[] = [
    {
      name: "New Sale",
      icon: "ShoppingCart",
      route: "/new-sale",
      description: "Start a new sale transaction",
    },
    {
      name: "Custom Date",
      icon: "ShoppingCart",
      route: "/new-sale?customDate=true",
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
      route: "/sales-report",
      description: "Generate sales performance reports",
    },
  ];

  const inventoryList: MenuItem[] = [
    {
      name: "View Stock",
      icon: "Package",
      route: "/stock",
      description: "View and manage product stock levels",
    },
    {
      name: "Receive Stock",
      icon: "PackagePlus",
      route: "/receive-stock",
      description: "Receive stock from a supplier",
    },
    {
      name: "Stock History",
      icon: "History",
      route: "/stock-history",
      description: "View the history of stock movements",
    },
    {
      name: "Stock Report",
      icon: "ClipboardList",
      route: "/stock-report",
      description: "Generate stock and inventory reports",
    },
  ];

  const customersAndSuppliersList: MenuItem[] = [
    {
      name: "View Customers",
      icon: "User",
      route: "/customers",
      description: "View and manage your customers",
    },

    {
      name: "View Suppliers",
      icon: "Building2",
      route: "/suppliers",
      description: "View and manage your suppliers",
    },

  ];



  return (
    <main className="p-3 sm:p-4 lg:p-6 space-y-8">
      <section>
        <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Sales</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {salesList.map((saleItem, index) => (
            <MenuCard key={`sales-${index}`} saleItem={saleItem} />
          ))}
        </div>
      </section>

      <section>
        <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Inventory</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {inventoryList.map((item, index) => (
            <MenuCard key={`inventory-${index}`} saleItem={item} />
          ))}
        </div>
      </section>

      <section>
        <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Customers and Suppliers</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {customersAndSuppliersList.map((item, index) => (
            <MenuCard key={`customers-and-suppliers-${index}`} saleItem={item} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
