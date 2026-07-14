"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import {
  roleBadgeClasses,
  roleLabel,
} from "@/lib/role-utils";
import type { CompanyType, TeamMember } from "@/types";
import InviteMemberModal from "./InviteMemberModal";
import MemberDetailDrawer from "./MemberDetailDrawer";

type TeamSectionProps = {
  company: CompanyType;
  members: TeamMember[];
  membersFromApi: boolean;
  membersError: string | null;
  currentAccountId: string;
  onRefresh: () => void;
};

export default function TeamSection({
  company,
  members,
  membersFromApi,
  membersError,
  currentAccountId,
  onRefresh,
}: TeamSectionProps) {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phoneNumber.toLowerCase().includes(q) ||
        m.branchAccess.some(
          (b) =>
            (b.branchName ?? "").toLowerCase().includes(q) ||
            roleLabel(b.role).toLowerCase().includes(q)
        )
    );
  }, [members, search]);

  const selected = members.find((m) => m._id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Team
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage who can access each branch and what they can do there.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Invite member
          </button>
        </div>

        <div className="mt-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, branch, or role…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {!membersFromApi ? (
          <p className="mt-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
            Showing a provisional roster from company data
            {membersError ? ` (${membersError})` : ""}. Wire up{" "}
            <code className="font-mono text-[11px]">GET /company/:id/members</code>{" "}
            for names, phones, and per-branch roles. See{" "}
            <code className="font-mono text-[11px]">docs/general-admin-api.md</code>.
          </p>
        ) : null}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-neutral-800/60 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="text-left font-medium px-4 sm:px-5 py-3">Member</th>
                <th className="text-left font-medium px-4 sm:px-5 py-3">Branches</th>
                <th className="text-left font-medium px-4 sm:px-5 py-3 hidden md:table-cell">
                  Roles
                </th>
                <th className="text-right font-medium px-4 sm:px-5 py-3"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {members.length === 0
                      ? "No team members yet. Invite someone to get started."
                      : "No members match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((member) => {
                  const roles = [
                    ...new Set(member.branchAccess.map((b) => b.role)),
                  ];
                  if (roles.length === 0 && member.legacyRole) {
                    roles.push(member.legacyRole);
                  }
                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                            {(member.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {member.name || "Unnamed"}
                              {member._id === currentAccountId ? (
                                <span className="ml-1.5 text-xs font-normal text-gray-400">
                                  (you)
                                </span>
                              ) : null}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {member.phoneNumber || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-gray-700 dark:text-gray-300">
                        {member.branchAccess.length > 0 ? (
                          <span className="line-clamp-2">
                            {member.branchAccess
                              .map(
                                (b) =>
                                  b.branchName ||
                                  company.branches?.find(
                                    (c) => c._id === b.branchId
                                  )?.name ||
                                  "Branch"
                              )
                              .join(", ")}
                          </span>
                        ) : (
                          <span className="text-gray-400">None assigned</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <span
                                key={role}
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${roleBadgeClasses(role)}`}
                              >
                                {roleLabel(role)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedId(member._id)}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        company={company}
        onSuccess={onRefresh}
      />

      <MemberDetailDrawer
        member={selected}
        company={company}
        currentAccountId={currentAccountId}
        onClose={() => setSelectedId(null)}
        onChanged={onRefresh}
      />
    </div>
  );
}
