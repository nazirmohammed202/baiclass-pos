import { describe, it, expect } from "vitest";
import {
  buildHourlyDisplay,
  calculatePercentage,
  formatHourLabel,
  getSellerVariance,
} from "./sales-report-math";

describe("getSellerVariance", () => {
  const seller = { cashSales: 500, ePayments: 0, expenses: 0 };

  it("returns null when cash at hand was not recorded", () => {
    expect(getSellerVariance(seller, undefined)).toBeNull();
  });

  it("is balanced (0) when cash at hand matches cash sales exactly", () => {
    expect(getSellerVariance(seller, 500)).toBe(0);
  });

  it("reports a shortage (negative) when cash at hand is too low", () => {
    expect(getSellerVariance(seller, 450)).toBe(-50);
  });

  it("reports an excess (positive) when cash at hand is too high", () => {
    expect(getSellerVariance(seller, 520)).toBe(20);
  });

  it("counts e-payments as received money", () => {
    // 300 cash + 200 momo covers 500 of cash sales
    expect(
      getSellerVariance({ cashSales: 500, ePayments: 200, expenses: 0 }, 300)
    ).toBe(0);
  });

  it("reduces the expected cash by expenses paid from the drawer", () => {
    // Seller sold 500 cash but paid 100 expenses, so only 400 is expected
    expect(
      getSellerVariance({ cashSales: 500, ePayments: 0, expenses: 100 }, 400)
    ).toBe(0);
  });

  it("combines e-payments and expenses in one reconciliation", () => {
    // expected = 800 - 50 = 750; received = 600 + 100 = 700 → shortage of 50
    expect(
      getSellerVariance({ cashSales: 800, ePayments: 100, expenses: 50 }, 600)
    ).toBe(-50);
  });

  it("treats zero cash at hand as recorded (full shortage), not missing", () => {
    expect(getSellerVariance(seller, 0)).toBe(-500);
  });

  it("handles a seller with no sales but recorded cash (pure excess)", () => {
    expect(
      getSellerVariance({ cashSales: 0, ePayments: 0, expenses: 0 }, 75)
    ).toBe(75);
  });
});

describe("calculatePercentage", () => {
  it("computes the share of a total", () => {
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });

  it("returns 0 when the total is 0 instead of dividing by zero", () => {
    expect(calculatePercentage(50, 0)).toBe(0);
  });

  it("can exceed 100 when value is larger than total", () => {
    expect(calculatePercentage(150, 100)).toBe(150);
  });

  it("rounds to two decimals", () => {
    expect(calculatePercentage(2, 7)).toBe(28.57);
  });
});

describe("formatHourLabel", () => {
  it("maps 24h hours to 12h labels", () => {
    expect(formatHourLabel(0)).toBe("12 AM");
    expect(formatHourLabel(1)).toBe("1 AM");
    expect(formatHourLabel(11)).toBe("11 AM");
    expect(formatHourLabel(12)).toBe("12 PM");
    expect(formatHourLabel(13)).toBe("1 PM");
    expect(formatHourLabel(23)).toBe("11 PM");
  });
});

describe("buildHourlyDisplay", () => {
  it("always returns 24 hours", () => {
    expect(buildHourlyDisplay([])).toHaveLength(24);
    expect(buildHourlyDisplay(undefined)).toHaveLength(24);
  });

  it("zero-fills hours missing from the breakdown", () => {
    const result = buildHourlyDisplay([
      { hour: 9, sales: 120, transactions: 4 },
    ]);

    expect(result[9]).toEqual({
      hour: 9,
      hourLabel: "9 AM",
      sales: 120,
      transactions: 4,
    });
    expect(result[10]).toEqual({
      hour: 10,
      hourLabel: "10 AM",
      sales: 0,
      transactions: 0,
    });
  });

  it("keeps entries in hour order regardless of input order", () => {
    const result = buildHourlyDisplay([
      { hour: 15, sales: 10, transactions: 1 },
      { hour: 3, sales: 20, transactions: 2 },
    ]);

    expect(result.map((r) => r.hour)).toEqual(
      Array.from({ length: 24 }, (_, i) => i)
    );
    expect(result[3].sales).toBe(20);
    expect(result[15].sales).toBe(10);
  });
});
