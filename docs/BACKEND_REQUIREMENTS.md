# Backend requirements for POS menu features

## 1. Expenses (Add Expense)

- **Purpose:** Record and list branch expenses (e.g. rent, utilities, supplies) for profit reporting.
- **Data model (suggestion):**
  - `branchId`, `date`, `amount`, `category` (e.g. "Rent", "Utilities", "Supplies"), `description`, `createdAt`, `createdBy`.
- **API:**
  - `POST /api/branches/[branchId]/expenses` – create expense (body: date, amount, category, description).
  - `GET /api/branches/[branchId]/expenses` – list expenses (query: startDate, endDate, optional category).
  - Optional: `PATCH` / `DELETE` for edit/delete.
- **Integration:** Sales report / day detail already uses `totalExpenses`; ensure daily (or period) expense aggregation is available for the report (e.g. sum of expenses for that branch/date or date range).

---

## 2. Refunds (Returns & Refunds)

- **Purpose:** Record a refund (full or partial) against an existing sale; used from Sales History.
- **API:**
  - `POST /api/branches/[branchId]/sales/[saleId]/refund` – process refund.
    - Body: `amount` (optional for full refund), optional `reason` / `notes`.
  - Behavior: create a refund record linked to the sale; update analytics (e.g. refundsProcessed) and optionally reverse/restore inventory for refunded items.
- **Data model:** Refund record with saleId, amount, date, reason, processedBy. Ensure existing analytics (e.g. StaffPerformanceSection, KPICards) can read refund totals.

---

## 3. End of day / Cash management (Register)

- **Purpose:** Close register, record cash in/out, and produce a Z-report (till summary).
- **Concepts:**
  - **Shift / session:** Optional open/close shift per user or per register.
  - **Cash in/out:** Record cash removed (e.g. bank deposit) or added (e.g. float) with amount and reason.
  - **Z-report:** Summary for a period (e.g. day): total sales by payment type, refunds, expenses (if any), cash expected vs counted.
- **API (suggestion):**
  - `POST /api/branches/[branchId]/register/close` or `end-of-day` – close current period; optional body: counted cash, notes. Returns Z-report payload.
  - `GET /api/branches/[branchId]/register/summary` – get current period summary (for display before close).
  - Optional: `POST .../register/cash-in` and `.../register/cash-out` with amount and reason.
- **Data model:** Shift/session (branchId, openedAt, closedAt, openedBy, closedBy); cash movements; Z-report snapshot (totals, period, branchId).
