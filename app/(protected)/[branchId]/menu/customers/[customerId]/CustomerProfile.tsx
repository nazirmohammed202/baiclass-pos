"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  ShoppingBag,
  Wallet,
  Loader2,
  Phone,
  MapPin,
  CreditCard,
  TrendingUp,
  Plus,
  FileText,
  Printer,
  Copy,
  Pencil,
} from "lucide-react";
import { BranchType, CustomerType, SalePopulatedType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCustomerProfile } from "./hooks/useCustomerProfile";
import ProfileTablePagination from "./components/ProfileTablePagination";
import RecordPaymentModal from "./components/RecordPaymentModal";
import EditCreditLimitModal from "./components/EditCreditLimitModal";
import CustomerStatement, { CustomerStatementRef } from "./components/CustomerStatement";
import ViewSaleModal from "@/app/(protected)/[branchId]/menu/sales-history/components/viewSaleModal";
import { printPaymentReceipt } from "./utils/printPaymentReceipt";
import { use } from "react";
import { useToast } from "@/context/toastContext";

type CustomerProfileProps = {
  branchId: string;
  customerPromise: Promise<CustomerType>;
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

export default function CustomerProfile({ branchId, customerPromise, branchPromise }: CustomerProfileProps) {
  const params = useParams();
  const router = useRouter();
  const customer = use(customerPromise);
  const bid = (params?.branchId as string) || branchId;
  const { success: toastSuccess } = useToast();
  const statementRef = useRef<CustomerStatementRef>(null);

  const {
    sales,
    payments,
    salesPagination,
    paymentsPagination,
    salesLoading,
    paymentsLoading,
    salesError,
    paymentsError,
    salesLimit,
    paymentsLimit,
    loadSalesPage,
    loadPaymentsPage,
    setSalesLimit,
    setPaymentsLimit,
    refreshProfile,
  } = useCustomerProfile({ customerId: customer._id, branchId: bid });

  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [editLimitOpen, setEditLimitOpen] = useState(false);
  const [viewSale, setViewSale] = useState<SalePopulatedType | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);

  const fullAddress = [customer.address, customer.city].filter(Boolean).join(", ") || "—";
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

  const handleEditLimitSuccess = () => {
    router.refresh();
    refreshProfile();
    toastSuccess("Credit limit updated");
  };

  const handlePrint = () => statementRef.current?.print();

  const handlePrintPayment = (p: Parameters<typeof printPaymentReceipt>[0]) =>
    printPaymentReceipt(p, customer.name || "Customer");

  const backHref = `/${bid}/menu/customers`;

  return (
    <div className="space-y-6 p-4">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </Link>

      {/* Profile card */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div>
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight capitalize">
              {customer.name || "Customer"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customer profile</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                {customer.phoneNumber ? (
                  <a href={`tel:${customer.phoneNumber}`} className="text-primary hover:underline">
                    {customer.phoneNumber}
                  </a>
                ) : (
                  "—"
                )}
              </span>
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
                href={`/${bid}/menu/new-sale?customerId=${customer._id}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <Plus className="w-4 h-4" />
                New Sale
              </Link>
              <button
                type="button"
                onClick={() => setEditLimitOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <Pencil className="w-4 h-4" />
                Edit Limit
              </button>
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

      {/* Analytics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Total  Spend</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(Number(customer.totalCreditPurchase ?? 0))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Total credit Spend</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(Number(customer.totalCreditPurchase ?? 0))}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider"> Balance Due</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(Number(customer.due ?? 0))}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg p-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Credit limit</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(Number(customer.creditLimit ?? 0))}
          </p>
        </div>
      </div>

      {/* Sales section */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sales</h2>
          </div>
          {salesPagination && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {salesPagination.total === 0
                ? "No sales"
                : `Showing ${(salesPagination.page - 1) * salesPagination.limit + 1}–${Math.min(salesPagination.page * salesPagination.limit, salesPagination.total)} of ${salesPagination.total}`}
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          {salesLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading sales…
            </div>
          ) : salesError ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400 text-sm">{salesError}</div>
          ) : sales.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No sales found</div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Paid</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {sales.map((sale) => (
                    <tr
                      key={sale._id}
                      onClick={() => setViewSale(sale)}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatDate(sale.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{sale.invoiceNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(sale.total ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(sale.paid ?? 0)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(sale.due ?? 0)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${sale.salesType === "credit" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"}`}>
                          {sale.salesType ?? "cash"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salesPagination && salesPagination.pages > 0 && (
                <ProfileTablePagination
                  pagination={salesPagination}
                  currentItemsCount={sales.length}
                  loading={salesLoading}
                  limit={salesLimit}
                  onPageChange={loadSalesPage}
                  onLimitChange={setSalesLimit}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Payments section */}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date </th>
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

      <CustomerStatement
        ref={statementRef}
        customer={customer}
        sales={sales}
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
        customerId={customer._id}
        branchId={bid}
        customerName={customer.name || "Customer"}
        dueBalance={Number(customer.due ?? 0)}
      />

      <EditCreditLimitModal
        isOpen={editLimitOpen}
        onClose={() => setEditLimitOpen(false)}
        onSuccess={handleEditLimitSuccess}
        customerId={customer._id}
        branchId={bid}
        customerName={customer.name || "Customer"}
        currentLimit={Number(customer.creditLimit ?? 0)}
      />

      <ViewSaleModal
        sale={viewSale}
        isOpen={!!viewSale}
        onClose={() => setViewSale(null)}
      />
    </div>
  );
}
