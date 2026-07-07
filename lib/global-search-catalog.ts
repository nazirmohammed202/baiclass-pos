import type { CustomerType, Product, SupplierType } from "@/types";

export type SearchItemCategory =
  | "Navigation"
  | "Sales"
  | "Inventory"
  | "Customers & Suppliers"
  | "Register"
  | "Analytics"
  | "Settings";

export type GlobalSearchNavItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: SearchItemCategory;
  keywords: string[];
};

/** Branch-relative paths (prefixed with `/${branchId}` at runtime). */
export const GLOBAL_SEARCH_NAV_ITEMS: GlobalSearchNavItem[] = [
  {
    id: "nav-overview",
    title: "Overview",
    subtitle: "Dashboard and daily sales summary",
    href: "/overview",
    category: "Navigation",
    keywords: ["dashboard", "home", "today", "summary"],
  },
  {
    id: "nav-menu",
    title: "Menu",
    subtitle: "All branch operations",
    href: "/menu",
    category: "Navigation",
    keywords: ["operations", "modules"],
  },
  {
    id: "nav-analytics",
    title: "Analytics",
    subtitle: "Reports, KPIs, and business insights",
    href: "/analytics",
    category: "Navigation",
    keywords: ["reports", "insights", "kpi", "charts"],
  },
  {
    id: "nav-settings",
    title: "Settings",
    subtitle: "Branch and account configuration",
    href: "/settings",
    category: "Navigation",
    keywords: ["config", "preferences", "branch", "account"],
  },
  {
    id: "sales-new",
    title: "New Sale",
    subtitle: "Start a new sale transaction",
    href: "/menu/new-sale",
    category: "Sales",
    keywords: ["pos", "checkout", "sell", "transaction"],
  },
  {
    id: "sales-custom-date",
    title: "Custom Date Sale",
    subtitle: "Enter sales for a specific date",
    href: "/menu/new-sale?customDate=true",
    category: "Sales",
    keywords: ["backdate", "past", "date"],
  },
  {
    id: "sales-history",
    title: "Sales History",
    subtitle: "View past sales transactions",
    href: "/menu/sales-history",
    category: "Sales",
    keywords: ["history", "invoices", "past sales", "transactions"],
  },
  {
    id: "sales-report",
    title: "Sales Reports",
    subtitle: "Generate sales performance reports",
    href: "/menu/sales-report",
    category: "Sales",
    keywords: ["report", "analytics", "daily", "performance"],
  },
  {
    id: "sales-returns",
    title: "Returns & Refunds",
    subtitle: "Edit or reverse past sales for partial or full refunds",
    href: "/menu/sales-history?mode=returns",
    category: "Sales",
    keywords: ["return", "refund", "reverse"],
  },
  {
    id: "sales-expense",
    title: "Add Expense",
    subtitle: "Record expenses for the branch",
    href: "/menu/add-expense",
    category: "Sales",
    keywords: ["expense", "cost", "spending", "cash out"],
  },
  {
    id: "inv-catalog",
    title: "Product Catalog",
    subtitle: "Manage products, categories and pricing",
    href: "/menu/stock",
    category: "Inventory",
    keywords: ["products", "catalog", "pricing", "stock"],
  },
  {
    id: "inv-stock",
    title: "View Stock",
    subtitle: "View and manage product stock levels",
    href: "/menu/stock",
    category: "Inventory",
    keywords: ["inventory", "quantity", "levels", "warehouse"],
  },
  {
    id: "inv-receive",
    title: "Receive Stock",
    subtitle: "Receive stock from a supplier",
    href: "/menu/receive-stock",
    category: "Inventory",
    keywords: ["procurement", "purchase", "supplier", "delivery"],
  },
  {
    id: "inv-history",
    title: "Stock History",
    subtitle: "View the history of stock movements",
    href: "/menu/stock-history",
    category: "Inventory",
    keywords: ["movements", "receipts", "history"],
  },
  {
    id: "inv-report",
    title: "Stock Report",
    subtitle: "Generate stock and inventory reports",
    href: "/menu/stock-report",
    category: "Inventory",
    keywords: ["report", "inventory report"],
  },
  {
    id: "cs-customers",
    title: "View Customers",
    subtitle: "View and manage your customers",
    href: "/menu/customers",
    category: "Customers & Suppliers",
    keywords: ["clients", "buyers", "credit", "debt"],
  },
  {
    id: "cs-suppliers",
    title: "View Suppliers",
    subtitle: "View and manage your suppliers",
    href: "/menu/suppliers",
    category: "Customers & Suppliers",
    keywords: ["vendors", "procurement"],
  },
  {
    id: "reg-eod",
    title: "End of Day",
    subtitle: "Close register and view Z-report",
    href: "/menu/end-of-day",
    category: "Register",
    keywords: ["close shift", "z-report", "cash at hand", "register"],
  },
  {
    id: "analytics-kpi",
    title: "Analytics KPIs",
    subtitle: "Key performance indicators",
    href: "/analytics",
    category: "Analytics",
    keywords: ["kpi", "metrics", "performance"],
  },
  {
    id: "analytics-trend",
    title: "Sales Trend",
    subtitle: "Sales trend charts and comparisons",
    href: "/analytics",
    category: "Analytics",
    keywords: ["trend", "chart", "growth"],
  },
  {
    id: "analytics-inventory",
    title: "Inventory Health",
    subtitle: "Stock levels and turnover analytics",
    href: "/analytics",
    category: "Analytics",
    keywords: ["inventory health", "stock turnover", "gmroi"],
  },
  {
    id: "settings-branch",
    title: "Branch Settings",
    subtitle: "Currency, pricing, and branch options",
    href: "/settings",
    category: "Settings",
    keywords: ["branch", "currency", "target", "wholesale", "retail"],
  },
  {
    id: "settings-account",
    title: "Account Settings",
    subtitle: "Update your account name and phone",
    href: "/settings",
    category: "Settings",
    keywords: ["account", "profile", "phone", "user"],
  },
];

export function filterNavItems(query: string): GlobalSearchNavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOBAL_SEARCH_NAV_ITEMS;

  return GLOBAL_SEARCH_NAV_ITEMS.filter((item) => {
    const haystack = [
      item.title,
      item.subtitle,
      item.category,
      ...item.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export type GlobalSearchEntityResult = {
  customers: CustomerType[];
  products: Product[];
  suppliers: SupplierType[];
};

export function filterSearchEntities(
  data: GlobalSearchEntityResult,
  query: string
): GlobalSearchEntityResult {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { customers: [], products: [], suppliers: [] };
  }

  const customers = data.customers
    .filter((customer) =>
      [customer.name, customer.phoneNumber, customer.city, customer.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
    .slice(0, 8);

  const products = data.products
    .filter((product) => {
      const d = product.details;
      return [d.name, d.manufacturer, d.nickname, d.size, d.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    })
    .slice(0, 8);

  const suppliers = data.suppliers
    .filter((supplier) =>
      [supplier.name, supplier.address, ...(supplier.phoneNumbers ?? []), supplier.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
    .slice(0, 8);

  return { customers, products, suppliers };
}
