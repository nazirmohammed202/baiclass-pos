import React from "react";
import { MenuCard } from "@/components/MenuCard";
import { getAccount } from "@/lib/auth-actions";
import { canAccessMenuRoute } from "@/lib/permission-gates";

type MenuItem = {
  name: string;
  icon: string;
  route: string;
  description: string;
};

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
    description: "Enter sales for a specific date",
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
  {
    name: "Returns & Refunds",
    icon: "RotateCcw",
    route: "/sales-history?mode=returns",
    description: "Edit or reverse past sales for partial or full refunds",
  },
  {
    name: "Add Expense",
    icon: "DollarSign",
    route: "/add-expense",
    description: "Record expenses for the branch",
  },
];

const inventoryList: MenuItem[] = [
  {
    name: "Product Catalog",
    icon: "PackageOpen",
    route: "/stock",
    description: "Manage products, categories and pricing",
  },
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

const registerList: MenuItem[] = [
  {
    name: "End of Day",
    icon: "CircleDollarSign",
    route: "/end-of-day",
    description: "Close the register for the day",
  },
];

function filterMenuItems(
  account: Awaited<ReturnType<typeof getAccount>>,
  items: MenuItem[],
  branchId: string
) {
  return items.filter((item) =>
    canAccessMenuRoute(account, item.route, branchId)
  );
}

const MenuPage = async ({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) => {
  const { branchId } = await params;
  const account = await getAccount();

  const visibleSales = filterMenuItems(account, salesList, branchId);
  const visibleInventory = filterMenuItems(account, inventoryList, branchId);
  const visibleCustomers = filterMenuItems(
    account,
    customersAndSuppliersList,
    branchId
  );
  const visibleRegister = filterMenuItems(account, registerList, branchId);

  return (
    <main className="p-3 sm:p-4 lg:p-6 space-y-8">
      {visibleSales.length > 0 && (
        <section>
          <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Sales</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2 sm:gap-4">
            {visibleSales.map((saleItem, index) => (
              <MenuCard key={`sales-${index}`} saleItem={saleItem} />
            ))}
          </div>
        </section>
      )}

      {visibleInventory.length > 0 && (
        <section>
          <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Inventory</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2 sm:gap-4">
            {visibleInventory.map((item, index) => (
              <MenuCard key={`inventory-${index}`} saleItem={item} />
            ))}
          </div>
        </section>
      )}

      {visibleCustomers.length > 0 && (
        <section>
          <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Customers and Suppliers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2 sm:gap-4">
            {visibleCustomers.map((item, index) => (
              <MenuCard
                key={`customers-and-suppliers-${index}`}
                saleItem={item}
              />
            ))}
          </div>
        </section>
      )}

      {visibleRegister.length > 0 && (
        <section>
          <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Register</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2 sm:gap-4">
            {visibleRegister.map((item, index) => (
              <MenuCard key={`register-${index}`} saleItem={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default MenuPage;
