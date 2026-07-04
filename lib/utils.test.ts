import { describe, it, expect } from "vitest";
import { compactNumber, fmt, formatCurrency, num, pct } from "./utils";

describe("formatCurrency", () => {
  it("formats with the cedi symbol and two decimals", () => {
    expect(formatCurrency(1234.5)).toBe("₵ 1234.50");
    expect(formatCurrency(0)).toBe("₵ 0.00");
  });

  it("keeps negative amounts negative", () => {
    expect(formatCurrency(-50)).toBe("₵ -50.00");
  });
});

describe("fmt", () => {
  it("parses string amounts from the API", () => {
    expect(fmt("199.9")).toBe("₵ 199.90");
  });

  it("falls back to 0 for undefined", () => {
    expect(fmt(undefined)).toBe("₵ 0.00");
  });
});

describe("num", () => {
  it("parses numeric strings", () => {
    expect(num("42.5")).toBe(42.5);
  });

  it("passes numbers through", () => {
    expect(num(7)).toBe(7);
  });

  it("returns 0 for undefined and non-numeric strings", () => {
    expect(num(undefined)).toBe(0);
    expect(num("abc")).toBe(0);
  });
});

describe("pct", () => {
  it("computes a percentage of a whole", () => {
    expect(pct(50, 200)).toBe(25);
  });

  it("caps at 100", () => {
    expect(pct(300, 100)).toBe(100);
  });

  it("returns 0 when the whole is 0 or negative", () => {
    expect(pct(10, 0)).toBe(0);
    expect(pct(10, -5)).toBe(0);
  });
});

describe("compactNumber", () => {
  it("abbreviates thousands and millions", () => {
    expect(compactNumber(4500)).toBe("4.5k");
    expect(compactNumber(1_200_000)).toBe("1.2M");
  });

  it("leaves small numbers as-is", () => {
    expect(compactNumber(999)).toBe("999");
    expect(compactNumber(0)).toBe("0");
  });
});
