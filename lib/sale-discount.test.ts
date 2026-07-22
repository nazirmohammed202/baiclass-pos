import { describe, expect, it } from "vitest";
import {
  calculateInvoiceDiscountAmount,
  calculateSaleTotal,
} from "./sale-discount";

describe("calculateInvoiceDiscountAmount", () => {
  it("returns 0 when no discount type", () => {
    expect(calculateInvoiceDiscountAmount(100, null, 10)).toBe(0);
  });

  it("returns 0 for non-positive subtotal or discount value", () => {
    expect(calculateInvoiceDiscountAmount(0, "fixed", 10)).toBe(0);
    expect(calculateInvoiceDiscountAmount(100, "fixed", 0)).toBe(0);
    expect(calculateInvoiceDiscountAmount(-50, "percentage", 10)).toBe(0);
  });

  it("calculates percentage discount", () => {
    expect(calculateInvoiceDiscountAmount(200, "percentage", 10)).toBe(20);
  });

  it("caps percentage discount at subtotal", () => {
    expect(calculateInvoiceDiscountAmount(50, "percentage", 150)).toBe(50);
  });

  it("applies fixed discount up to subtotal", () => {
    expect(calculateInvoiceDiscountAmount(50, "fixed", 30)).toBe(30);
  });

  it("caps fixed discount at subtotal", () => {
    expect(calculateInvoiceDiscountAmount(50, "fixed", 80)).toBe(50);
  });
});

describe("calculateSaleTotal", () => {
  it("returns subtotal minus discount", () => {
    expect(calculateSaleTotal(100, "fixed", 15)).toBe(85);
  });

  it("rounds the final total to two decimals", () => {
    expect(calculateSaleTotal(10, "percentage", 33.333)).toBe(6.67);
  });

  it("returns the subtotal when no discount applies", () => {
    expect(calculateSaleTotal(75.5, null, 0)).toBe(75.5);
  });
});
