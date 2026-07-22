import { describe, expect, it } from "vitest";
import { P } from "@/lib/generated/permissions";
import {
  canAccessGeneral,
  canManageTeam,
  getAccountPermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "./permissions";
import type { AccountType, CompanyType } from "@/types";

const branchA = "branch-a";
const branchB = "branch-b";

const accountWithFlatPermissions = (
  permissions: string[]
): AccountType => ({
  _id: "acc-1",
  name: "Test User",
  phoneNumber: "000",
  branches: [branchA],
  permissions,
});

const accountWithBranchGrants = (
  grants: Array<{ branch: string; permissions: string[] }>
): AccountType => ({
  _id: "acc-1",
  name: "Test User",
  phoneNumber: "000",
  branches: grants.map((g) => g.branch),
  permissions: grants,
});

describe("getAccountPermissions", () => {
  it("fails open when the source is missing", () => {
    expect(getAccountPermissions(null)).toEqual(expect.arrayContaining([P.SALE_CREATE]));
  });

  it("fails open when permissions are null", () => {
    expect(getAccountPermissions({ permissions: null })).toEqual(
      expect.arrayContaining([P.SALE_CREATE])
    );
  });

  it("returns an empty list for an explicit empty grant", () => {
    expect(getAccountPermissions({ permissions: [] })).toEqual([]);
  });

  it("reads flat permission strings", () => {
    const perms = [P.SALE_CREATE, P.SALE_READ];
    expect(getAccountPermissions({ permissions: perms })).toEqual(perms);
  });

  it("scopes branch grants to a single branch", () => {
    const account = accountWithBranchGrants([
      { branch: branchA, permissions: [P.SALE_CREATE] },
      { branch: branchB, permissions: [P.SALE_READ] },
    ]);

    expect(getAccountPermissions(account, branchA)).toEqual([P.SALE_CREATE]);
    expect(getAccountPermissions(account, branchB)).toEqual([P.SALE_READ]);
  });

  it("unions branch grants when no branch is selected", () => {
    const account = accountWithBranchGrants([
      { branch: branchA, permissions: [P.SALE_CREATE] },
      { branch: branchB, permissions: [P.SALE_CREATE, P.SALE_READ] },
    ]);

    expect(getAccountPermissions(account)).toEqual(
      expect.arrayContaining([P.SALE_CREATE, P.SALE_READ])
    );
    expect(getAccountPermissions(account)).toHaveLength(2);
  });

  it("supports populated branch objects in grants", () => {
    const account = accountWithBranchGrants([
      { branch: branchA, permissions: [P.CUSTOMER_READ] },
    ]);
    account.permissions = [
      { branch: { _id: branchA } as unknown as string, permissions: [P.CUSTOMER_READ] },
    ];

    expect(getAccountPermissions(account, branchA)).toEqual([P.CUSTOMER_READ]);
  });

  it("returns no permissions for malformed branch grants", () => {
    const account = accountWithBranchGrants([
      { branch: branchA, permissions: [P.CUSTOMER_READ] },
    ]);
    account.permissions = [{ branch: {} as unknown as string, permissions: [P.CUSTOMER_READ] }];

    expect(getAccountPermissions(account, branchA)).toEqual([]);
  });
});

describe("permission checks", () => {
  it("hasPermission checks a single grant", () => {
    const account = accountWithFlatPermissions([P.SALE_READ]);
    expect(hasPermission(account, P.SALE_READ)).toBe(true);
    expect(hasPermission(account, P.SALE_CREATE)).toBe(false);
  });

  it("hasAnyPermission returns true when one match exists", () => {
    const account = accountWithFlatPermissions([P.SALE_UPDATE]);
    expect(hasAnyPermission(account, [P.SALE_VOID, P.SALE_UPDATE])).toBe(true);
    expect(hasAnyPermission(account, [P.SALE_VOID, P.SALE_CREATE])).toBe(false);
  });

  it("hasAnyPermission treats an empty requirement as allowed", () => {
    expect(hasAnyPermission({ permissions: [] }, [])).toBe(true);
  });

  it("hasAllPermissions requires every permission", () => {
    const account = accountWithFlatPermissions([P.SALE_READ, P.SALE_UPDATE]);
    expect(hasAllPermissions(account, [P.SALE_READ, P.SALE_UPDATE])).toBe(true);
    expect(hasAllPermissions(account, [P.SALE_READ, P.SALE_VOID])).toBe(false);
  });

  it("hasAllPermissions treats an empty requirement as allowed", () => {
    expect(hasAllPermissions({ permissions: [] }, [])).toBe(true);
  });
});

describe("canAccessGeneral / canManageTeam", () => {
  const company: CompanyType = {
    _id: "co-1",
    name: "Acme",
    owner: "owner-1",
    members: [
      { userId: "member-admin", role: "admin" },
      { userId: "member-staff", role: "cashier" },
    ],
    branches: [{ _id: branchA, name: "Main", address: "1 Road" }],
  };

  it("denies access without an account", () => {
    expect(canAccessGeneral(null, company)).toBe(false);
    expect(canManageTeam(null, company)).toBe(false);
  });

  it("allows the company owner", () => {
    const owner = accountWithFlatPermissions([]);
    owner._id = "owner-1";
    expect(canAccessGeneral(owner, company)).toBe(true);
  });

  it("allows account-admin permissions on any branch", () => {
    const admin = accountWithFlatPermissions([P.ACCOUNT_UPDATE]);
    expect(canAccessGeneral(admin, company)).toBe(true);
  });

  it("allows members with the admin company role", () => {
    const adminMember = accountWithFlatPermissions([]);
    adminMember._id = "member-admin";
    expect(canAccessGeneral(adminMember, company)).toBe(true);
  });

  it("resolves members linked via populated account objects", () => {
    const companyWithPopulatedMember: CompanyType = {
      ...company,
      members: [{ account: { _id: "member-admin" }, role: "admin" }],
    };
    const adminMember = accountWithFlatPermissions([]);
    adminMember._id = "member-admin";

    expect(canAccessGeneral(adminMember, companyWithPopulatedMember)).toBe(true);
  });

  it("denies non-admin members without account-admin permissions", () => {
    const cashier = accountWithFlatPermissions([P.SALE_CREATE]);
    cashier._id = "member-staff";
    expect(canAccessGeneral(cashier, company)).toBe(false);
    expect(canManageTeam(cashier, company)).toBe(false);
  });
});
