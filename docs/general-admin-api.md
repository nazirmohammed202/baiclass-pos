# General admin & Team API

Frontend lives at `/general` (Overview + Team). This doc is the contract for backend routes the UI already calls.

---

## Product model (agreed)

| Concept | Rule |
|--------|------|
| Permissions | **Branch-scoped** — same person can be cashier at Branch A and warehouse at Branch B |
| `/general` | Company admin cockpit: roster, invite, per-branch roles, future company analytics |
| Branch UI | Uses `account.permissions` for the **current** `branchId` only |
| Roles | Assign **roles** in Team UI (not raw permission checkboxes). Backend expands role → permissions via presets |
| Branch settings | Stay under `/{branchId}/settings` |

Assignable roles (frontend dropdown): `admin`, `salesperson`, `cashier`, `warehouse`  
Align `companyMemberRoles` with presets (`salesperson` vs `salesPerson`; include `warehouse` if inviteable).

---

## UI map (implemented)

| Route | What |
|-------|------|
| `/general` | Overview — branch list, jump into a branch |
| `/general?tab=team` | Team table + invite + member drawer (per-branch roles / permission preview) |
| Access | `canAccessGeneral`: `account:create|update|delete` **or** company member `role === "admin"` |
| Entry | Select branch → “Company admin”; branch header account menu → “Company admin” |

Provisional fallback: if member list API fails, Team shows `company.members` (ids + legacy role, no branch matrix) and a warning banner.

---

## Auth

All routes: `x-auth-token` header (same as existing API).  
Deny non-admins with **403** and a clear message body (string or `{ message }`).

---

## Routes to implement

### 1. List members

`GET /company/:companyId/members`

**Response** (array or `{ members: [...] }`):

```json
[
  {
    "_id": "accountObjectId",
    "name": "Ama Mensah",
    "phoneNumber": "0244123456",
    "status": "active",
    "branchAccess": [
      {
        "branchId": "branchObjectId",
        "branchName": "Madina",
        "role": "cashier",
        "permissions": ["sale:create", "sale:read"]
      },
      {
        "branchId": "otherBranchId",
        "branchName": "Accra Central",
        "role": "salesperson",
        "permissions": ["sale:create", "inventory-receipt:create"]
      }
    ]
  }
]
```

- `permissions` optional (UI can preview from `ROLE_PRESETS` if omitted).
- `branchName` optional (UI falls back to company branch list).
- `status`: `active` | `invited` | `disabled` (optional).

Frontend: `lib/company-actions.ts` → `getTeamMembers`.

---

### 2. Invite / add member

`POST /company/:companyId/members`

**Body:**

```json
{
  "phoneNumber": "0244123456",
  "name": "Optional if creating new account",
  "branchAccess": [
    { "branchId": "branchObjectId", "role": "cashier" }
  ]
}
```

**Behavior:**

- If account with phone exists → attach to company + apply branch roles.
- If not → create/invite account, then attach.
- Require at least one `branchAccess` entry.
- Expand each `role` via role presets → store branch-scoped permissions.
- Reject duplicate branch ids in one request.
- Cannot leave company with zero admins (if demoting/removing elsewhere).

**Response:** created/updated member in the same shape as list item (201/200).

Frontend: `inviteTeamMember`.

---

### 3. Change role on a branch

`PATCH /company/:companyId/members/:memberId/branches/:branchId`

**Body:** `{ "role": "salesperson" }`

Recompute branch permissions from preset.  
Block demoting the last company admin if this was their only admin grant (product rule: define “admin” as any branch with `admin` role, or a company-level flag — pick one and enforce consistently).

Frontend: `updateMemberBranchRole`.

---

### 4. Add branch access

`POST /company/:companyId/members/:memberId/branches`

**Body:** `{ "branchId": "...", "role": "warehouse" }`

Idempotent or 409 if already has that branch.

Frontend: `addMemberBranchAccess`.

---

### 5. Remove branch access

`DELETE /company/:companyId/members/:memberId/branches/:branchId`

If last branch → either remove from company or 400 “remove last branch via remove member”. Prefer: allow last-branch remove only via full remove, **or** auto-remove from company — document which.

Frontend: `removeMemberBranchAccess`.

---

### 6. Remove from company

`DELETE /company/:companyId/members/:memberId`

Revoke all branch access. Block removing self / last admin.

Frontend: `removeTeamMember`.

---

## Account read (already in progress)

`GET /accounts/read` should keep returning **`permissions` (+ optional `role`) for the active branch context**.

When the user is in `/general` (no branch), either:

- omit till permissions / return empty `permissions`, and rely on admin check via company membership, or
- return a flag like `isCompanyAdmin: true`.

Do **not** merge all branches’ permissions into one flat array for till use — that would over-grant in branch UI.

Optional later: `GET /accounts/read?branchId=` for explicit branch grants.

---

## Recommended rules

1. Last-admin protection on demote/remove.
2. Invite default role: `cashier`.
3. `warehouse` in `companyMemberRoles` if Team can assign it.
4. Normalize role spelling: prefer `salesperson` in member APIs; map to preset `salesPerson` server-side.
5. 403 body usable by `handleError` (string response data works today).

---

## Frontend files

| File | Role |
|------|------|
| `app/(protected)/general/**` | UI |
| `lib/company-actions.ts` | Server actions calling these routes |
| `lib/permissions.ts` | `hasPermission`, `canAccessGeneral` |
| `lib/role-utils.ts` | Labels, preset preview |
| `lib/generated/permissions.ts` | Synced catalog (`npm run sync:permissions`) |
| `types.tsx` | `TeamMember`, `BranchRoleAssignment`, account `permissions` |

---

## Out of scope (later)

- Custom per-permission role editor
- Approval workflows

Company-wide Overview analytics routes: see `docs/backend.md`.
