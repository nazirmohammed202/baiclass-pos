import { describe, expect, it } from "vitest";
import { P } from "@/lib/generated/permissions";
import {
  canAccessHeaderChip,
  canAccessMenuRoute,
  canAccessSearchNavItem,
  canPerform,
} from "./permission-gates";
import type { AccountType } from "@/types";

const branchId = "branch-1";

const account = (permissions: string[]): AccountType => ({
  _id: "acc-1",
  name: "Cashier",
  phoneNumber: "000",
  branches: [branchId],
  permissions: [{ branch: branchId, permissions }],
});

describe("canAccessHeaderChip", () => {
  it("allows chips with no requirement", () => {
    expect(canAccessHeaderChip(account([]), "overview", branchId)).toBe(true);
  });

  it("requires analytics permission for the analytics chip", () => {
    const granted = account([P.ANALYTICS_READ]);
    const denied = account([P.SALE_READ]);

    expect(canAccessHeaderChip(granted, "analytics", branchId)).toBe(true);
    expect(canAccessHeaderChip(denied, "analytics", branchId)).toBe(false);
  });
});

describe("canAccessMenuRoute", () => {
  it("allows unknown routes by default", () => {
    expect(canAccessMenuRoute(account([]), "/unknown-route", branchId)).toBe(true);
  });

  it("requires sale:create for new sales", () => {
    expect(canAccessMenuRoute(account([P.SALE_CREATE]), "/new-sale", branchId)).toBe(
      true
    );
    expect(canAccessMenuRoute(account([P.SALE_READ]), "/new-sale", branchId)).toBe(
      false
    );
  });

  it("requires any of the returns permissions", () => {
    const route = "/sales-history?mode=returns";
    expect(canAccessMenuRoute(account([P.SALE_VOID]), route, branchId)).toBe(true);
    expect(canAccessMenuRoute(account([P.SALE_UPDATE]), route, branchId)).toBe(true);
    expect(canAccessMenuRoute(account([P.SALE_READ]), route, branchId)).toBe(false);
  });
});

describe("canAccessSearchNavItem", () => {
  it("requires at least one inventory permission for stock nav items", () => {
    expect(
      canAccessSearchNavItem(
        account([P.PRODUCT_READ, P.BRANCH_READ_PRODUCT_STOCK]),
        "inv-stock",
        branchId
      )
    ).toBe(true);
    expect(canAccessSearchNavItem(account([P.PRODUCT_READ]), "inv-stock", branchId)).toBe(
      true
    );
    expect(canAccessSearchNavItem(account([P.SALE_READ]), "inv-stock", branchId)).toBe(
      false
    );
  });
});

describe("canPerform", () => {
  it("maps named actions to permissions", () => {
    expect(canPerform(account([P.SALE_VOID]), "saleVoid", branchId)).toBe(true);
    expect(canPerform(account([P.SALE_READ]), "saleVoid", branchId)).toBe(false);
  });
});
