#!/usr/bin/env node
/**
 * Fetches GET {API_URL}/permission and writes lib/generated/permissions.ts
 *
 * Usage:
 *   node scripts/sync-permissions.mjs
 *   node scripts/sync-permissions.mjs --fixture
 *   API_URL=http://localhost:5000/api node scripts/sync-permissions.mjs
 *   node scripts/sync-permissions.mjs --url http://localhost:5000/api/permission
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "lib", "generated", "permissions.ts");
const FIXTURE_FILE = path.join(
  __dirname,
  "fixtures",
  "permission-response.json"
);

/** @typedef {{
 *   permissions: Record<string, string>;
 *   allPermissions: string[];
 *   rolePresets: Record<string, string[]>;
 *   companyMemberRoles: string[];
 * }} PermissionCatalog */

function parseArgs(argv) {
  const args = {
    fixture: false,
    url: undefined,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--fixture") {
      args.fixture = true;
    } else if (arg === "--url") {
      args.url = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node scripts/sync-permissions.mjs [--fixture] [--url <full-url>]

Defaults:
  URL = process.env.PERMISSIONS_API_URL
      || process.env.API_URL + "/permissions"
      || "http://localhost:5000/api/permissions"
`);
      process.exit(0);
    }
  }

  return args;
}

function resolveUrl(args) {
  if (args.url) return args.url;
  if (process.env.PERMISSIONS_API_URL) return process.env.PERMISSIONS_API_URL;
  if (process.env.API_URL) {
    return `${process.env.API_URL.replace(/\/$/, "")}/permissions`;
  }
  return "http://localhost:5000/api/permissions";
}

/** @param {PermissionCatalog} data */
function assertCatalog(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid catalog: expected an object");
  }
  if (!data.permissions || typeof data.permissions !== "object") {
    throw new Error("Invalid catalog: missing permissions object");
  }
  if (!Array.isArray(data.allPermissions)) {
    throw new Error("Invalid catalog: missing allPermissions array");
  }
  if (!data.rolePresets || typeof data.rolePresets !== "object") {
    throw new Error("Invalid catalog: missing rolePresets object");
  }
  if (!Array.isArray(data.companyMemberRoles)) {
    throw new Error("Invalid catalog: missing companyMemberRoles array");
  }
}

/** @param {string} value */
function quote(value) {
  return JSON.stringify(value);
}

/** @param {string[]} values */
function formatStringArray(values, indent = 2) {
  const pad = " ".repeat(indent);
  if (values.length === 0) return "[]";
  return `[\n${values.map((v) => `${pad}  ${quote(v)},`).join("\n")}\n${pad}]`;
}

/**
 * Prefer PascalCase role keys that match rolePresets keys (e.g. salesPerson).
 * Falls back to companyMemberRoles when needed.
 * @param {PermissionCatalog} data
 */
function resolveRoleKeys(data) {
  const presetKeys = Object.keys(data.rolePresets);
  // Keep preset key order; include companyMemberRoles that aren't already covered
  // by a case-insensitive match against presets.
  const roles = [...presetKeys];
  for (const role of data.companyMemberRoles) {
    const exists = roles.some((r) => r.toLowerCase() === role.toLowerCase());
    if (!exists) roles.push(role);
  }
  return roles;
}

/** @param {PermissionCatalog} data @param {string} sourceLabel */
function generateTypeScript(data, sourceLabel) {
  const entries = Object.entries(data.permissions);
  const roleKeys = resolveRoleKeys(data);

  const pObject = entries
    .map(([key, value]) => `  ${key}: ${quote(value)},`)
    .join("\n");

  const rolePresetsBlock = Object.entries(data.rolePresets)
    .map(([role, perms]) => {
      return `  ${quote(role)}: ${formatStringArray(perms, 4)} as const satisfies readonly Permission[],`;
    })
    .join("\n");

  const generatedAt = new Date().toISOString();

  return `/* eslint-disable */
/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Source: ${sourceLabel}
 * Generated: ${generatedAt}
 *
 * Regenerate with:
 *   npm run sync:permissions
 *   npm run sync:permissions -- --fixture
 */

export const P = {
${pObject}
} as const;

export type PermissionKey = keyof typeof P;
export type Permission = (typeof P)[PermissionKey];

export const ALL_PERMISSIONS = ${formatStringArray(data.allPermissions)} as const satisfies readonly Permission[];

export type RolePresetName = ${roleKeys.map(quote).join(" | ")};

export const ROLE_PRESETS = {
${rolePresetsBlock}
} as const;

export const COMPANY_MEMBER_ROLES = ${formatStringArray(
    data.companyMemberRoles
  )} as const;

export type CompanyMemberRole = (typeof COMPANY_MEMBER_ROLES)[number];
`;
}

async function loadCatalog(args) {
  if (args.fixture) {
    const raw = await readFile(FIXTURE_FILE, "utf8");
    /** @type {PermissionCatalog} */
    const data = JSON.parse(raw);
    assertCatalog(data);
    return {
      data,
      sourceLabel: `fixture ${path.relative(ROOT, FIXTURE_FILE)}`,
    };
  }

  const url = resolveUrl(args);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch permissions from ${url}: ${response.status} ${response.statusText}`
    );
  }

  /** @type {PermissionCatalog} */
  const data = await response.json();
  assertCatalog(data);
  return { data, sourceLabel: url };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { data, sourceLabel } = await loadCatalog(args);
  const contents = generateTypeScript(data, sourceLabel);

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, contents, "utf8");

  console.log(`Wrote ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`  permissions: ${Object.keys(data.permissions).length}`);
  console.log(`  roles:       ${Object.keys(data.rolePresets).join(", ")}`);
  console.log(`  source:      ${sourceLabel}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
