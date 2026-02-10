"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { CustomersBalanceDueType, CustomerType } from "@/types";
import { deleteCustomer } from "@/lib/customer-actions";
import CustomerActionDropdown, { useDropdownPortal } from "./CustomerActionDropdown";
import EditCustomerModal from "./EditCustomerModal";
import DeleteCustomerModal from "./DeleteCustomerModal";
import { useToast } from "@/context/toastContext";
import CustomersTableSkeleton from "./CustomersTableSkeleton";
import { formatCurrency } from "@/lib/utils";

export type CustomersTableRef = {
  print: () => void;
  export: () => void;
};

type CustomersTableProps = {
  branchId: string;
  customers: CustomerType[];
  loading: boolean;
  onRefresh: () => void;
  initialCustomersBalanceDue: Promise<CustomersBalanceDueType[]>;
  showOnlyDebtors: boolean;
};

const CustomersTable = forwardRef<CustomersTableRef, CustomersTableProps>(function CustomersTable({
  branchId,
  customers,
  loading,
  onRefresh,
  initialCustomersBalanceDue,
  showOnlyDebtors,
}, ref) {
  const params = useParams();
  const router = useRouter();
  const branchIdFromRoute = (params?.branchId as string) || branchId;
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerType | null>(null);
  const [deleteModalCustomer, setDeleteModalCustomer] = useState<CustomerType | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { dropdownPosition, handleButtonClick, handleClose } = useDropdownPortal(
    openDropdownId,
    () => setOpenDropdownId(null)
  );
  const { error: toastError, success: toastSuccess } = useToast();
  const [balanceDueMap, setBalanceDueMap] = useState<Map<string, CustomersBalanceDueType>>(new Map());
  const [balanceDueLoading, setBalanceDueLoading] = useState(true);

  const selectedCustomer = customers.find((c) => c._id === openDropdownId);
  const profileHref = (customerId: string) => `/${branchIdFromRoute}/menu/customers/${customerId}`;
  const goToProfile = (c: CustomerType) => router.push(profileHref(c._id));

  const handleConfirmDelete = async () => {
    if (!deleteModalCustomer) return;
    setDeletingId(deleteModalCustomer._id);
    const result = await deleteCustomer(deleteModalCustomer._id, branchId);
    setDeletingId(null);
    if (result.success) {
      setDeleteModalCustomer(null);
      setOpenDropdownId(null);
      onRefresh();
      toastSuccess("Customer deleted successfully");
    } else {
      toastError(result.error ?? "Failed to delete customer");
    }
  };


  useEffect(() => {
    initialCustomersBalanceDue.then((balanceDue) => {
      const map = new Map<string, CustomersBalanceDueType>();
      balanceDue.forEach((item) => map.set(item._id, item));
      setBalanceDueMap(map);
      setBalanceDueLoading(false);
    })
  }, [initialCustomersBalanceDue]);

  const displayCustomers = showOnlyDebtors && !balanceDueLoading
    ? customers.filter((c) => (balanceDueMap.get(c._id)?.due ?? 0) > 0)
    : customers;

  const handlePrint = () => {
    const headers = ["Name", "Phone", "Address", "Due"];
    const rows = displayCustomers.map((c) => [
      c.name || "—",
      c.phoneNumber || "—",
      c.address || "—",
      formatCurrency(Number(balanceDueMap.get(c._id)?.due ?? 0)),
    ]);
    const escapeCSV = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
    const html = `<!DOCTYPE html><html><head><title>Customers</title></head><body style="font-family:system-ui;padding:24px"><h1>Customers</h1><table border="1" cellpadding="8" style="border-collapse:collapse"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table><p style="margin-top:24px;font-size:12px;color:#666">Generated ${new Date().toLocaleString()}</p></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  };

  const handleExport = () => {
    const headers = ["Name", "Phone", "Address", "Due"];
    const rows = displayCustomers.map((c) => [
      c.name || "",
      c.phoneNumber || "",
      c.address || "",
      (balanceDueMap.get(c._id)?.due ?? 0).toString(),
    ]);
    const escapeCSV = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toastSuccess("Customers exported successfully");
  };

  useImperativeHandle(ref, () => ({ print: handlePrint, export: handleExport }), [displayCustomers, balanceDueMap, toastSuccess]);

  if (loading) return <CustomersTableSkeleton />;

  if (displayCustomers.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 border border-gray-200 dark:border-neutral-800">
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
          {showOnlyDebtors ? "No debtors found" : "No customers found"}
        </p>
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">
          {showOnlyDebtors ? "No customers with outstanding balance" : "Add a customer or adjust your search"}
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
              {displayCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  onClick={() => router.push(profileHref(customer._id))}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{customer.phoneNumber || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{customer.address || "—"}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                    {balanceDueLoading ? (
                      <span className="inline-block h-4 w-14 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" aria-hidden />
                    ) : (
                      formatCurrency(Number(balanceDueMap.get(customer._id)?.due ?? 0))
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className="relative inline-block"
                      ref={(el) => { if (customer._id) dropdownRefs.current[customer._id] = el; }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (customer._id) {
                            handleButtonClick(e, customer._id);
                            setOpenDropdownId(openDropdownId === customer._id ? null : customer._id);
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
          {customers.map((customer) => (
            <Link
              key={customer._id}
              href={profileHref(customer._id)}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{customer.name || "—"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phoneNumber || "—"}</p>
                  {customer.address ? <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{customer.address}</p> : null}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due: {formatCurrency(Number(balanceDueMap.get(customer._id)?.due ?? 0))}</p>
                </div>
                <div
                  className="relative"
                  ref={(el) => { if (customer._id) dropdownRefs.current[customer._id] = el; }}
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (customer._id) {
                        handleButtonClick(e, customer._id);
                        setOpenDropdownId(openDropdownId === customer._id ? null : customer._id);
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

      <CustomerActionDropdown
        openDropdownId={openDropdownId}
        dropdownPosition={dropdownPosition}
        customer={selectedCustomer ?? null}
        deletingId={deletingId}
        onView={goToProfile}
        onEdit={setEditingCustomer}
        onDelete={(c) => { setDeleteModalCustomer(c); setOpenDropdownId(null); }}
        onClose={handleClose}
      />

      <EditCustomerModal
        customer={editingCustomer}
        isOpen={editingCustomer !== null}
        branchId={branchId}
        onClose={() => setEditingCustomer(null)}
        onSuccess={() => { setEditingCustomer(null); onRefresh(); }}
      />
      <DeleteCustomerModal
        customer={deleteModalCustomer}
        isOpen={deleteModalCustomer !== null}
        isDeleting={deletingId === deleteModalCustomer?._id}
        onClose={() => setDeleteModalCustomer(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
});

export default CustomersTable;
