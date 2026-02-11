"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Package,
  Wallet,
  Loader2,
  Phone,
  MapPin,
  Mail,
  TrendingUp,
  FileText,
  Printer,
  Copy,
  MoreVertical,
} from "lucide-react";
import { BranchType, InventoryHistoryType, PaymentType, SupplierType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useSupplierProfile } from "./hooks/useSupplierProfile";
import ProfileTablePagination from "./components/ProfileTablePagination";
import RecordPaymentModal from "./components/RecordPaymentModal";
import SupplierStatement, { SupplierStatementRef } from "./components/SupplierStatement";
import { printPaymentReceipt } from "@/app/(protected)/[branchId]/menu/customers/[customerId]/utils/printPaymentReceipt";
import { use } from "react";
import { useToast } from "@/context/toastContext";
import ProcurementActionDropdown, { useDropdownPortal } from "./components/ProcurementActionDropdown";
import ViewInventoryModal from "@/app/(protected)/[branchId]/menu/stock-history/components/ViewInventoryModal";
import DeleteInventoryModal from "@/app/(protected)/[branchId]/menu/stock-history/components/DeleteInventoryModal";
import { deleteInventory } from "@/lib/inventory-actions";

type SupplierProfileProps = {
  branchId: string;
  supplierPromise: Promise<SupplierType>;
  branchPromise: Promise<BranchType>;
};

function formatDate(date: Date | string | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupplierProfile({ branchId, supplierPromise, branchPromise }: SupplierProfileProps) {
  const params = useParams();
  const router = useRouter();
  const supplier = use(supplierPromise);
  const bid = (params?.branchId as string) || branchId;
  const { success: toastSuccess, error: toastError } = useToast();
  const statementRef = useRef<SupplierStatementRef>(null);

  const {
    procurements,
    payments,
    procurementsPagination,
    paymentsPagination,
    procurementsLoading,
    paymentsLoading,
    procurementsError,
    paymentsError,
    procurementsLimit,
    paymentsLimit,
    loadProcurementsPage,
    loadPaymentsPage,
    setProcurementsLimit,
    setPaymentsLimit,
    refreshProfile,
  } = useSupplierProfile({ supplierId: supplier._id, branchId: bid });

  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [openProcurementDropdownId, setOpenProcurementDropdownId] = useState<string | null>(null);
  const [deletingProcurementId, setDeletingProcurementId] = useState<string | null>(null);
  const [viewingProcurement, setViewingProcurement] = useState<InventoryHistoryType | null>(null);
  const [deleteProcurementModal, setDeleteProcurementModal] = useState<InventoryHistoryType | null>(null);

  const { dropdownPosition: procurementDropdownPosition, handleButtonClick: handleProcurementButtonClick, handleClose: handleProcurementDropdownClose } = useDropdownPortal(openProcurementDropdownId, () => setOpenProcurementDropdownId(null));

  const selectedProcurement = procurements.find((p) => p._id === openProcurementDropdownId) ?? null;

  const handleEditProcurement = (proc: InventoryHistoryType) => {
    router.push(`/${bid}/menu/receive-stock?inventoryId=${proc._id}`);
  };

  const handleConfirmDeleteProcurement = async () => {
    if (!deleteProcurementModal) return;
    setDeletingProcurementId(deleteProcurementModal._id);
    const result = await deleteInventory(deleteProcurementModal._id, bid);
    setDeletingProcurementId(null);
    if (result.success) {
      setDeleteProcurementModal(null);
      setOpenProcurementDropdownId(null);
      refreshProfile();
      router.refresh();
      toastSuccess("Stock receipt deleted");
    } else {
      toastError(result.error ?? "Failed to delete receipt");
    }
  };

  const fullAddress = supplier.address || "—";
  const phoneDisplay = Array.isArray(supplier.phoneNumbers) && supplier.phoneNumbers.length > 0
    ? supplier.phoneNumbers.join(", ")
    : "—";

  const handleCopyAddress = () => {
    if (!fullAddress || fullAddress === "—") return;
    navigator.clipboard.writeText(fullAddress);
    toastSuccess("Address copied to clipboard");
  };

  const handleRecordPaymentSuccess = () => {
    router.refresh();
    refreshProfile();
    toastSuccess("Payment recorded successfully");
  };

  const handlePrint = () => statementRef.current?.print();

  const handlePrintPayment = (p: PaymentType) =>
    printPaymentReceipt(p, supplier.name || "Supplier");

  const backHref = `/${bid}/menu/suppliers`;

  return (
    <div className="space-y-6 p-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Suppliers
      </Link>

      <div className="bg-white dark:bg-neutral-900 rounded-lg overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div>
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight capitalize">
              {supplier.name || "Supplier"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Supplier profile</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-600 dark:text-gray-300">
              {phoneDisplay !== "—" && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                  <a href={`tel:${phoneDisplay.split(",")[0]?.trim()}`} className="text-primary hover:underline">
                    {phoneDisplay}
                  </a>
                </span>
              )}
              {supplier.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                  <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                    {supplier.email}
                  </a>
                </span>
              )}
              <span className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                <span className="truncate">{fullAddress}</span>
                {fullAddress !== "—" && (
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-700"
                    aria-label="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRecordPaymentOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90"
              >
                <Wallet className="w-4 h-4" />
                Record Payment
              </button>
              <Link
                href={`/${bid}/menu/receive-stock?supplierId=${supplier._id}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <Package className="w-4 h-4" />
                Receive Stock
              </Link>
              <button
                type="button"
                onClick={() => setStatementOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <FileText className="w-4 h-4" />
                Statement
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Wallet className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(Number(supplier.totalOutstandingBalance ?? 0))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Total Procurement</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(Number(supplier.totalProcurement ?? 0))}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Procurements</h2>
          </div>
          {procurementsPagination && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {procurementsPagination.total === 0
                ? "No procurements"
                : `Showing ${(procurementsPagination.page - 1) * procurementsPagination.limit + 1}–${Math.min(procurementsPagination.page * procurementsPagination.limit, procurementsPagination.total)} of ${procurementsPagination.total}`}
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          {procurementsLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading procurements…
            </div>
          ) : procurementsError ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400 text-sm">{procurementsError}</div>
          ) : procurements.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No procurements found</div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {procurements.map((proc) => (
                    <tr
                      key={proc._id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                      onClick={() => setViewingProcurement(proc)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatDate(proc.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{proc.invoiceDate ? new Date(proc.invoiceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(proc.totalCost ?? 0)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${proc.paymentType === "credit" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"}`}>
                          {proc.paymentType ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcurementButtonClick(e, proc._id);
                              setOpenProcurementDropdownId(openProcurementDropdownId === proc._id ? null : proc._id);
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
              {procurementsPagination && procurementsPagination.pages > 0 && (
                <ProfileTablePagination
                  pagination={procurementsPagination}
                  currentItemsCount={procurements.length}
                  loading={procurementsLoading}
                  limit={procurementsLimit}
                  onPageChange={loadProcurementsPage}
                  onLimitChange={setProcurementsLimit}
                />
              )}
            </>
          )}
        </div>
      </div>

      <ProcurementActionDropdown
        openDropdownId={openProcurementDropdownId}
        dropdownPosition={procurementDropdownPosition}
        procurement={selectedProcurement}
        deletingId={deletingProcurementId}
        onView={setViewingProcurement}
        onEdit={handleEditProcurement}
        onDelete={(proc) => {
          setDeleteProcurementModal(proc);
          setOpenProcurementDropdownId(null);
        }}
        onClose={handleProcurementDropdownClose}
      />

      <ViewInventoryModal
        inventory={viewingProcurement}
        isOpen={!!viewingProcurement}
        onClose={() => setViewingProcurement(null)}
      />

      <DeleteInventoryModal
        inventory={deleteProcurementModal}
        isOpen={!!deleteProcurementModal}
        isDeleting={deletingProcurementId === deleteProcurementModal?._id}
        onClose={() => setDeleteProcurementModal(null)}
        onConfirm={handleConfirmDeleteProcurement}
      />

      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payments</h2>
          </div>
          {paymentsPagination && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {paymentsPagination.total === 0
                ? "No payments"
                : `Showing ${(paymentsPagination.page - 1) * paymentsPagination.limit + 1}–${Math.min(paymentsPagination.page * paymentsPagination.limit, paymentsPagination.total)} of ${paymentsPagination.total}`}
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          {paymentsLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading payments…
            </div>
          ) : paymentsError ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400 text-sm">{paymentsError}</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No payments found</div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Balance before</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Balance after</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receipt #</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {payments.map((p, idx) => (
                    <tr key={`${p.date}-${p.amount}-${p.receiptNumber}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{formatDate(p.date)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(p.amount ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">{formatCurrency(p.balanceBefore ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">{formatCurrency(p.balanceAfter ?? 0)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {p.paymentMethod === "momo" ? "Mobile Money" : p.paymentMethod ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{p.receiptNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handlePrintPayment(p); }}
                          className="p-1.5 rounded text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-neutral-800 dark:hover:text-primary"
                          aria-label="Print receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paymentsPagination && paymentsPagination.pages > 0 && (
                <ProfileTablePagination
                  pagination={paymentsPagination}
                  currentItemsCount={payments.length}
                  loading={paymentsLoading}
                  limit={paymentsLimit}
                  onPageChange={loadPaymentsPage}
                  onLimitChange={setPaymentsLimit}
                />
              )}
            </>
          )}
        </div>
      </div>

      <SupplierStatement
        ref={statementRef}
        supplier={supplier}
        procurements={procurements}
        payments={payments}
        fullAddress={fullAddress}
        isOpen={statementOpen}
        onClose={() => setStatementOpen(false)}
        branchPromise={branchPromise}
      />

      <RecordPaymentModal
        key={recordPaymentOpen ? "open" : "closed"}
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        onSuccess={handleRecordPaymentSuccess}
        supplierId={supplier._id}
        branchId={bid}
        supplierName={supplier.name || "Supplier"}
        dueBalance={Number(supplier.totalOutstandingBalance ?? 0)}
      />
    </div>
  );
}
