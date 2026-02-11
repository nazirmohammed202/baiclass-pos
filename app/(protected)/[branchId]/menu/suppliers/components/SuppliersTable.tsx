"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { SupplierType } from "@/types";
import { deleteSupplier } from "@/lib/suppliers-actions";
import SupplierActionDropdown, { useDropdownPortal } from "./SupplierActionDropdown";
import EditSupplierModal from "./EditSupplierModal";
import DeleteSupplierModal from "./DeleteSupplierModal";
import { useToast } from "@/context/toastContext";
import SuppliersTableSkeleton from "./SuppliersTableSkeleton";
import { formatCurrency } from "@/lib/utils";

export type SuppliersTableRef = {
  print: () => void;
  export: () => void;
};

type SuppliersTableProps = {
  branchId: string;
  suppliers: SupplierType[];
  loading: boolean;
  onRefresh: () => void;
  showOnlyDebtors: boolean;
};

const SuppliersTable = forwardRef<SuppliersTableRef, SuppliersTableProps>(function SuppliersTable({
  branchId,
  suppliers,
  loading,
  onRefresh,
  showOnlyDebtors,
}, ref) {
  const params = useParams();
  const router = useRouter();
  const branchIdFromRoute = (params?.branchId as string) || branchId;
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(null);
  const [deleteModalSupplier, setDeleteModalSupplier] = useState<SupplierType | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { dropdownPosition, handleButtonClick, handleClose } = useDropdownPortal(
    openDropdownId,
    () => setOpenDropdownId(null)
  );
  const { error: toastError, success: toastSuccess } = useToast();

  const selectedSupplier = suppliers.find((s) => s._id === openDropdownId);
  const profileHref = (supplierId: string) => `/${branchIdFromRoute}/menu/suppliers/${supplierId}`;
  const goToProfile = (s: SupplierType) => router.push(profileHref(s._id));

  const handleConfirmDelete = async () => {
    if (!deleteModalSupplier) return;
    setDeletingId(deleteModalSupplier._id);
    const result = await deleteSupplier(deleteModalSupplier._id, branchId);
    setDeletingId(null);
    if (result.success) {
      setDeleteModalSupplier(null);
      setOpenDropdownId(null);
      onRefresh();
      toastSuccess("Supplier deleted successfully");
    } else {
      toastError(result.error ?? "Failed to delete supplier");
    }
  };

  const displaySuppliers = showOnlyDebtors
    ? suppliers.filter((s) => (s.totalOutstandingBalance ?? 0) > 0)
    : suppliers;

  const getPhoneDisplay = (s: SupplierType) =>
    Array.isArray(s.phoneNumbers) && s.phoneNumbers.length > 0
      ? s.phoneNumbers.join(", ")
      : "—";

  const handlePrint = () => {
    const headers = ["Name", "Phone", "Address", "Due"];
    const rows = displaySuppliers.map((s) => [
      s.name || "—",
      getPhoneDisplay(s),
      s.address || "—",
      formatCurrency(Number(s.totalOutstandingBalance ?? 0)),
    ]);
    const escapeCSV = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
    const html = `<!DOCTYPE html><html><head><title>Suppliers</title></head><body style="font-family:system-ui;padding:24px"><h1>Suppliers</h1><table border="1" cellpadding="8" style="border-collapse:collapse"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table><p style="margin-top:24px;font-size:12px;color:#666">Generated ${new Date().toLocaleString()}</p></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  };

  const handleExport = () => {
    const headers = ["Name", "Phone", "Address", "Due"];
    const rows = displaySuppliers.map((s) => [
      s.name || "",
      getPhoneDisplay(s),
      s.address || "",
      (s.totalOutstandingBalance ?? 0).toString(),
    ]);
    const escapeCSV = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `suppliers-${new Date().toISOString().split("T")[0]}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toastSuccess("Suppliers exported successfully");
  };

  useImperativeHandle(ref, () => ({ print: handlePrint, export: handleExport }), [displaySuppliers, toastSuccess]);

  if (loading) return <SuppliersTableSkeleton />;

  if (displaySuppliers.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800">
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
          {showOnlyDebtors ? "No debtors found" : "No suppliers found"}
        </p>
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">
          {showOnlyDebtors ? "No suppliers with outstanding balance" : "Add a supplier or adjust your search"}
        </p>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due</th>

                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>

            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {displaySuppliers.map((supplier) => (
                <tr
                  key={supplier._id}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  onClick={() => router.push(profileHref(supplier._id))}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{supplier.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{getPhoneDisplay(supplier)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{supplier.address || "—"}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                    {formatCurrency(Number(supplier.totalOutstandingBalance ?? 0))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className="relative inline-block"
                      ref={(el) => { if (supplier._id) dropdownRefs.current[supplier._id] = el; }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (supplier._id) {
                            handleButtonClick(e, supplier._id);
                            setOpenDropdownId(openDropdownId === supplier._id ? null : supplier._id);
                          }
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                        aria-label="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-200 dark:divide-neutral-700">
          {displaySuppliers.map((supplier) => (
            <Link
              key={supplier._id}
              href={profileHref(supplier._id)}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.name || "—"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getPhoneDisplay(supplier)}</p>
                  {supplier.address ? <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{supplier.address}</p> : null}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due: {formatCurrency(Number(supplier.totalOutstandingBalance ?? 0))}</p>
                </div>
                <div
                  className="relative"
                  ref={(el) => { if (supplier._id) dropdownRefs.current[supplier._id] = el; }}
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (supplier._id) {
                        handleButtonClick(e, supplier._id);
                        setOpenDropdownId(openDropdownId === supplier._id ? null : supplier._id);
                      }
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <SupplierActionDropdown
        openDropdownId={openDropdownId}
        dropdownPosition={dropdownPosition}
        supplier={selectedSupplier ?? null}
        deletingId={deletingId}
        onView={goToProfile}
        onEdit={setEditingSupplier}
        onDelete={(s) => { setDeleteModalSupplier(s); setOpenDropdownId(null); }}
        onClose={handleClose}
      />

      <EditSupplierModal
        supplier={editingSupplier}
        isOpen={editingSupplier !== null}
        branchId={branchId}
        onClose={() => setEditingSupplier(null)}
        onSuccess={() => { setEditingSupplier(null); onRefresh(); }}
      />
      <DeleteSupplierModal
        supplier={deleteModalSupplier}
        isOpen={deleteModalSupplier !== null}
        isDeleting={deletingId === deleteModalSupplier?._id}
        onClose={() => setDeleteModalSupplier(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
});

export default SuppliersTable;
