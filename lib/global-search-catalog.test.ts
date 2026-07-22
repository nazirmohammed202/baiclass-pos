import { describe, expect, it } from "vitest";
import {
  filterNavItems,
  filterSearchEntities,
  GLOBAL_SEARCH_NAV_ITEMS,
} from "./global-search-catalog";
import type { CustomerType, Product, SupplierType } from "@/types";

describe("filterNavItems", () => {
  it("returns all allowed items for an empty query", () => {
    const result = filterNavItems("");
    expect(result).toHaveLength(GLOBAL_SEARCH_NAV_ITEMS.length);
  });

  it("matches title, subtitle, category, and keywords", () => {
    expect(filterNavItems("refund").map((item) => item.id)).toContain("sales-returns");
    expect(filterNavItems("z-report").map((item) => item.id)).toContain("reg-eod");
  });

  it("respects the canAccessItem callback", () => {
    const result = filterNavItems("", {
      canAccessItem: (id) => id.startsWith("nav-"),
    });

    expect(result.every((item) => item.id.startsWith("nav-"))).toBe(true);
    expect(result.length).toBeLessThan(GLOBAL_SEARCH_NAV_ITEMS.length);
  });
});

describe("filterSearchEntities", () => {
  const customers: CustomerType[] = [
    {
      _id: "c1",
      name: "Jane Doe",
      address: "12 Main",
      city: "Accra",
      phoneNumber: "0244000000",
    },
    {
      _id: "c2",
      name: "John Smith",
      address: "5 Oak",
      city: "Kumasi",
      phoneNumber: "0200000000",
    },
  ];

  const products: Product[] = [
    {
      _id: "p1",
      details: {
        _id: "pd1",
        name: "Paracetamol 500mg",
        manufacturer: "PharmaCo",
      },
      stock: 10,
      retailPrice: 5,
      basePrice: 3,
      wholesalePrice: 4,
      creditPrice: 6,
      retailPriceHistory: [],
      wholesalePriceHistory: [],
      creditPriceHistory: [],
      lowStockThreshold: 2,
    },
  ];

  const suppliers: SupplierType[] = [
    {
      _id: "s1",
      name: "MedSupply Ltd",
      address: "Industrial Area",
      phoneNumbers: ["0302000000"],
      email: "sales@medsupply.test",
      totalOutstandingBalance: 0,
      totalProcurement: 0,
    },
  ];

  const data = { customers, products, suppliers };

  it("returns empty collections for an empty query", () => {
    expect(filterSearchEntities(data, "")).toEqual({
      customers: [],
      products: [],
      suppliers: [],
    });
  });

  it("finds customers by name or phone", () => {
    expect(filterSearchEntities(data, "jane").customers).toHaveLength(1);
    expect(filterSearchEntities(data, "0244").customers[0]?.name).toBe("Jane Doe");
  });

  it("finds products by manufacturer or name", () => {
    expect(filterSearchEntities(data, "pharmaco").products[0]?.details.name).toBe(
      "Paracetamol 500mg"
    );
  });

  it("finds suppliers by email or phone", () => {
    expect(filterSearchEntities(data, "medsupply").suppliers).toHaveLength(1);
    expect(filterSearchEntities(data, "0302").suppliers[0]?.name).toBe("MedSupply Ltd");
  });

  it("limits each entity list to eight results", () => {
    const manyCustomers = Array.from({ length: 12 }, (_, index) => ({
      ...customers[0],
      _id: `c-${index}`,
      name: `Match Customer ${index}`,
    }));

    expect(
      filterSearchEntities({ ...data, customers: manyCustomers }, "match").customers
    ).toHaveLength(8);
  });
});
