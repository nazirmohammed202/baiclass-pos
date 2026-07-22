import { describe, expect, it } from "vitest";
import { P } from "@/lib/generated/permissions";
import {
  ASSIGNABLE_ROLES,
  permissionsForRole,
  roleBadgeClasses,
  roleLabel,
  toPresetKey,
} from "./role-utils";

describe("roleLabel", () => {
  it("returns Unknown for empty roles", () => {
    expect(roleLabel(null)).toBe("Unknown");
    expect(roleLabel(undefined)).toBe("Unknown");
  });

  it("maps known roles to display labels", () => {
    expect(roleLabel("admin")).toBe("Admin");
    expect(roleLabel("salesPerson")).toBe("Salesperson");
  });

  it("title-cases unknown roles", () => {
    expect(roleLabel("auditor")).toBe("Auditor");
  });
});

describe("toPresetKey", () => {
  it("normalizes salesperson to the preset key", () => {
    expect(toPresetKey("salesperson")).toBe("salesPerson");
  });

  it("accepts preset keys directly", () => {
    expect(toPresetKey("cashier")).toBe("cashier");
  });

  it("returns null for unknown roles", () => {
    expect(toPresetKey("auditor")).toBeNull();
  });
});

describe("permissionsForRole", () => {
  it("returns cashier permissions from presets", () => {
    expect(permissionsForRole("cashier")).toContain(P.SALE_CREATE);
  });

  it("returns an empty list for unknown roles", () => {
    expect(permissionsForRole("auditor")).toEqual([]);
  });
});

describe("roleBadgeClasses", () => {
  it("returns role-specific styling", () => {
    expect(roleBadgeClasses("admin")).toContain("text-primary");
    expect(roleBadgeClasses("cashier")).toContain("text-amber-900");
    expect(roleBadgeClasses("salesPerson")).toContain("text-sky-800");
    expect(roleBadgeClasses("warehouse")).toContain("text-violet-900");
  });

  it("falls back to neutral styling for unknown roles", () => {
    expect(roleBadgeClasses("auditor")).toContain("text-gray-700");
  });
});

describe("ASSIGNABLE_ROLES", () => {
  it("includes warehouse for invite flows", () => {
    expect(ASSIGNABLE_ROLES).toContain("warehouse");
  });
});
