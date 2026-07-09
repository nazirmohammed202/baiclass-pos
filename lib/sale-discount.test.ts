import { describe, expect, it } from "vitest";
import {
  calculateInvoiceDiscountAmount,
  calculateSaleTotal,
} from "./sale-discount";

describe("calculateInvoiceDiscountAmount", () => {
  it("returns 0 when no discount type", () => {
    expect(calculateInvoiceDiscountAmount(100, null, 10)).toBe(0);
  });

  it("calculates percentage discount", () => {
    expect(calculateInvoiceDiscountAmount(200, "percentage", 10)).toBe(20);
  });

  it("caps fixed discount at subtotal", () => {
    expect(calculateInvoiceDiscountAmount(50, "fixed", 80)).toBe(50);
  });
});

describe("calculateSaleTotal", () => {
  it("returns subtotal minus discount", () => {
    expect(calculateSaleTotal(100, "fixed", 15)).toBe(85);
  });
});
