"use client";

import React from "react";
import { createPortal } from "react-dom";
import { SalePopulatedType } from "@/types";
import { X, Printer } from "lucide-react";
import { useCompany } from "@/context/companyContext";
import { useParams } from "next/navigation";
import Image from "next/image";
import { generateInvoiceHTML } from "../utils/generateInvoiceHTML";

type ViewSaleModalProps = {
  sale: SalePopulatedType | null;
  isOpen: boolean;
  onClose: () => void;
};

// Type guard for customer with extended properties
type CustomerWithDetails = {
  _id: string;
  name: string;
  address?: string;
  phoneNumber?: string;
};

// Helper functions for modal display
const formatCurrency = (amount: number): string => {
  return `₵${amount.toFixed(2)}`;
};

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProductName = (
  product: string | { name?: string; details?: { name?: string } }
): string => {
  if (typeof product === "string") return "Product";
  return product?.name || product?.details?.name || "Product";
};

const ViewSaleModal = ({ sale, isOpen, onClose }: ViewSaleModalProps) => {
  const [mounted, setMounted] = React.useState(false);
  const { company, account } = useCompany();
  const params = useParams();
  const branchId = params?.branchId as string;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen && mounted && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "unset";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, mounted]);

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !sale) return null;

  const subtotal = sale.total + sale.discount;

  // Find current branch from company branches
  const currentBranch = company?.branches?.find(
    (branch) => branch._id === branchId || branch._id === sale.branch?._id
  );

  // Print handler - opens new window with invoice
  const handlePrint = () => {
    const invoiceHTML = generateInvoiceHTML(sale, company, account, branchId);
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow popups to print invoices");
      return;
    }

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between z-10">
          <span></span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* Company and Customer Info Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-gray-200 dark:border-neutral-700">
            {/* Company Info - Left */}
            <div className="flex items-end gap-2">
              <Image
                src="/baiclass.png"
                alt="Baiclass Logo"
                className="w-10 h-10 sm:w-12 sm:h-12"
                width={50}
                height={50}
              />

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 ">
                  {company?.name || "Company Name"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentBranch?.address || "Address"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {account?.phoneNumber || "Phone Number"}
                </p>
              </div>
            </div>

            {/* Customer Info - Right */}
            {sale.customer && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Bill To:
                </p>
                <h3 className=" font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {sale.customer.name}
                </h3>
                {(sale.customer as CustomerWithDetails).address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(sale.customer as CustomerWithDetails).address}
                  </p>
                )}
                {(sale.customer as CustomerWithDetails).phoneNumber && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(sale.customer as CustomerWithDetails).phoneNumber}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Invoice Number and Date */}
          <section className="flex justify-between ">
            {/* Seller Info */}
            <div className="">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 ">
                Issued By:
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {sale.seller?.name || "—"}
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {sale.branch?.name || "—"}
              </p>
            </div>

            <div className="flex gap-5 ">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Invoice Number
                </p>
                <p className=" text-gray-900 dark:text-gray-100">
                  {sale.invoiceNumber ||
                    (sale._id ? sale._id.slice(-8).toUpperCase() : "—")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Date
                </p>
                <p className=" text-gray-900 dark:text-gray-100">
                  {formatDate(sale.createdAt)}
                </p>
              </div>
            </div>
          </section>

          {/* Products Table */}
          <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Product
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sale.products.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-neutral-800"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {getProductName(item.product)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Discount</span>
                  <span className="text-red-600 dark:text-red-400">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-neutral-700">
                <span>Total</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.note && (
            <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Notes
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {sale.note}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    // Fallback: render directly if portal isn't available
    return isOpen && sale ? modalContent : null;
  }

  if (typeof document !== "undefined" && document.body) {
    return createPortal(modalContent, document.body);
  }

  // Fallback: render directly
  return isOpen && sale ? modalContent : null;
};

export default ViewSaleModal;
