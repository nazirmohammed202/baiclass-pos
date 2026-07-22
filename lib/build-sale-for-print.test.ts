import { describe, expect, it } from "vitest";
import { buildSaleForPrint } from "./build-sale-for-print";
import type { AccountType, BranchType, CartItem, CustomerType } from "@/types";

const branch: BranchType = {
  _id: "branch-1",
  name: "Main Branch",
  address: "1 High Street",
  phoneNumber: "0300000000",
  settings: {
    retailPricePercentage: 0.2,
    wholesalePricePercentage: 0.1,
    creditPricePercentage: 0.25,
    roundRetailPrices: false,
    roundWholesalePrices: false,
    wholesaleEnabled: true,
    retailEnabled: true,
    currency: "GHS",
    isWarehouse: false,
    suspended: false,
    creditEnabled: true,
    dailySalesTarget: 1000,
  },
};

const seller: AccountType = {
  _id: "seller-1",
  name: "Ama Mensah",
  phoneNumber: "0244000000",
  branches: [branch._id],
  permissions: [],
};

const customer: CustomerType = {
  _id: "cust-1",
  name: "Jane Doe",
  address: "12 Main",
  city: "Accra",
  phoneNumber: "0200000000",
};

const cartItem: CartItem = {
  product: {
    _id: "prod-1",
    details: {
      _id: "prod-1",
      name: "Paracetamol",
      manufacturer: "PharmaCo",
      size: "500mg",
      type: "tablet",
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
  quantity: 2,
  unitPrice: 5,
};

describe("buildSaleForPrint", () => {
  it("maps cart lines and seller/customer details", () => {
    const sale = buildSaleForPrint({
      cartItems: [cartItem],
      customer,
      total: 10,
      discount: 0,
      amountPaid: 10,
      paymentMethod: "cash",
      salesType: "cash",
      priceType: "retail",
      seller,
      branch,
      saleId: "sale-1",
      invoiceNumber: "INV-001",
      createdAt: "2026-07-03T10:00:00.000Z",
    });

    expect(sale._id).toBe("sale-1");
    expect(sale.invoiceNumber).toBe("INV-001");
    expect(sale.seller).toEqual({ _id: "seller-1", name: "Ama Mensah" });
    expect(sale.customer?.name).toBe("Jane Doe");
    expect(sale.branch).toEqual({ _id: "branch-1", name: "Main Branch" });
    expect(sale.products).toEqual([
      {
        product: {
          _id: "prod-1",
          name: "Paracetamol",
          manufacturer: "PharmaCo",
          size: "500mg",
          type: "tablet",
        },
        quantity: 2,
        price: 5,
        total: 10,
      },
    ]);
    expect(sale.due).toBe(0);
    expect(sale.paid).toBe(10);
  });

  it("computes due when payment is partial", () => {
    const sale = buildSaleForPrint({
      cartItems: [cartItem],
      customer: null,
      total: 100,
      discount: 10,
      amountPaid: 60,
      paymentMethod: "momo",
      salesType: "credit",
      priceType: "wholesale",
      seller: null,
      branch,
    });

    expect(sale.due).toBe(40);
    expect(sale.seller).toEqual({ _id: "", name: "—" });
    expect(sale.customer).toBeUndefined();
    expect(sale.priceMode).toBe("wholesale");
  });

  it("maps credit price type to retail price mode", () => {
    const sale = buildSaleForPrint({
      cartItems: [cartItem],
      customer: null,
      total: 10,
      discount: 0,
      amountPaid: 10,
      paymentMethod: "cash",
      salesType: "cash",
      priceType: "credit",
      seller,
      branch,
    });

    expect(sale.priceMode).toBe("retail");
  });
});
