"use client";

import { useRef, useImperativeHandle, forwardRef, use } from "react";
import { Printer } from "lucide-react";
import { BranchType, InventoryHistoryType, PaymentType, SupplierType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

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

type SupplierStatementProps = {
  supplier: SupplierType;
  procurements: InventoryHistoryType[];
  payments: PaymentType[];
  fullAddress: string;
  isOpen: boolean;
  onClose: () => void;
  branchPromise: Promise<BranchType>;
};

export type SupplierStatementRef = {
  print: () => void;
};

const SupplierStatement = forwardRef<SupplierStatementRef, SupplierStatementProps>(
  function SupplierStatement({ supplier, procurements, payments, fullAddress, isOpen, onClose, branchPromise }, ref) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
      if (!printRef.current) return;
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Statement - ${supplier.name}</title></head>
          <body style="font-family: system-ui; padding: 24px; max-width: 800px; margin: 0 auto;">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };

    useImperativeHandle(ref, () => ({
      print: handlePrint,
    }));


    const now = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const branch = use(branchPromise);


    return (
      <>
        {/* Printable statement content (hidden, used for print) */}
        <div
          ref={printRef}
          className="hidden"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }} >
              <Image
                src="/baiclass.png"
                alt="Baiclass Logo"
                style={{ width: 50, height: 50, objectFit: "contain" }}
                width={50}
                height={50}
              />
              <div>
                <h3 style={{ fontSize: 18, color: "#111827", margin: 0 }}>Baiclass Enterprise</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>{branch.name} - 0{branch.phoneNumber}</p>
                <p style={{ fontSize: 14, color: "#6b7280", margin: "2px 0 0" }}>{branch.address}</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Statement — {supplier.name}</h1>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24, fontSize: 14 }}>
              <div><strong>Outstanding:</strong> {formatCurrency(Number(supplier.totalOutstandingBalance ?? 0))}</div>
              <div><strong>Total Procurement:</strong> {formatCurrency(Number(supplier.totalProcurement ?? 0))}</div>
            </div>
            <h2 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Procurements</h2>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Invoice date</th>
                  <th style={{ textAlign: "right", padding: "4px 8px" }}>Total cost</th>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {procurements.map((s) => (
                  <tr key={s._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "4px 8px" }}>{formatDate(s.createdAt)}</td>
                    <td style={{ padding: "4px 8px" }}>{s.invoiceDate ? new Date(s.invoiceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{formatCurrency(s.totalCost ?? 0)}</td>
                    <td style={{ padding: "4px 8px" }}>{s.paymentType ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Payments</h2>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "4px 8px" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "4px 8px" }}>Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "4px 8px" }}>{formatDate(p.date)}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right" }}>{formatCurrency(p.amount ?? 0)}</td>
                    <td style={{ padding: "4px 8px" }}>{p.paymentMethod ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 24 }}>Generated on {now}</p>
          </div>
        </div>

        {/* Statement modal (summary view) */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
            <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Statement</h2>
                  <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600" aria-label="Close">×</button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{supplier.name} • {fullAddress}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Outstanding</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(Number(supplier.totalOutstandingBalance ?? 0))}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Procurement</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(Number(supplier.totalProcurement ?? 0))}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Showing {procurements.length} procurements, {payments.length} payments. Use Print for full export.</p>
                <button onClick={handlePrint} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:opacity-90">
                  <Printer className="w-4 h-4" />
                  Print Statement
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default SupplierStatement;
