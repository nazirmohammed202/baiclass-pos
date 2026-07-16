"use client";

import { permissionsForRole, roleLabel } from "@/lib/role-utils";

type RolePermissionPreviewProps = {
  role: string;
  className?: string;
};

/** Read-only checklist of what a role grants (from ROLE_PRESETS). Display only. */
export default function RolePermissionPreview({
  role,
  className = "",
}: RolePermissionPreviewProps) {
  const perms = permissionsForRole(role);

  if (perms.length === 0) {
    return (
      <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        No permission preview for this role.
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
        {roleLabel(role)} can:
      </p>
      <ul className="max-h-36 overflow-y-auto space-y-1 rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/40 p-2">
        {perms.map((p) => (
          <li
            key={p}
            className="text-xs text-gray-600 dark:text-gray-300 font-mono truncate"
          >
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
