"use client";

import { useState } from "react";
import { X, Loader2, Printer } from "lucide-react";
import { recordCustomerPayment, RecordCustomerPaymentPayload } from "@/lib/customer-actions";
import { formatCurrency } from "@/lib/utils";

export type PaymentAllocation = { sale: string; amount: number };

type RecordPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
  branchId: string;
  customerName: string;
  dueBalance: number;
  /** When set, amount is prefilled and payment is allocated to these sales (sent to server). */
  initialAllocations?: PaymentAllocation[];
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  customerId,
  branchId,
  customerName,
  dueBalance,
  initialAllocations,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(() =>
    initialAllocations?.length ? String(initialAllocations.reduce((s, a) => s + a.amount, 0)) : ""
  );
  const [allocations, setAllocations] = useState<PaymentAllocation[]>(() => initialAllocations ?? []);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "cheque">("cash");
  const [datePaid, setDatePaid] = useState(todayStr());
  const [note, setNote] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [momoName, setMomoName] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [chequeBank, setChequeBank] = useState("");
  const [chequeBranch, setChequeBranch] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const buildPayload = (): RecordCustomerPaymentPayload | null => {
    const payload: RecordCustomerPaymentPayload = {
      amount: numAmount,
      paymentMethod,
      note: note.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      date: datePaid || todayStr(),
    };

    if (paymentMethod === "momo") {
      const name = momoName.trim();
      const number = momoNumber.trim();
      if (!name || !number) return null;
      payload.momoName = name;
      payload.momoNumber = number;
      if (transactionId.trim()) payload.transactionId = transactionId.trim();
    }

    if (paymentMethod === "cheque") {
      const bank = chequeBank.trim();
      const cb = chequeBranch.trim();
      const num = chequeNumber.trim();
      const cd = chequeDate;
      if (!bank || !cb || !num || !cd) return null;
      payload.cheque = { bank, branch: cb, number: num, date: cd };
    }

    if (allocations.length > 0) {
      const sum = allocations.reduce((s, a) => s + a.amount, 0);
      if (Math.abs(sum - numAmount) > 0.01) return null;
      payload.allocations = allocations.map((a) => ({ sale: a.sale, amount: a.amount }));
    }

    return payload;
  };

  const validateForm = (): string | null => {
    if (numAmount <= 0) return "Please enter a valid amount";
    if (numAmount > dueBalance) return `Amount cannot exceed due balance (${formatCurrency(dueBalance)})`;
    if (allocations.length > 0) {
      const sum = allocations.reduce((s, a) => s + a.amount, 0);
      if (Math.abs(sum - numAmount) > 0.01) return "Allocation total must equal payment amount";
    }
    if (paymentMethod === "momo" && (!momoName.trim() || !momoNumber.trim())) {
      return "MoMo Name and MoMo Number are required";
    }
    if (paymentMethod === "cheque") {
      if (!chequeBank.trim() || !chequeBranch.trim() || !chequeNumber.trim() || !chequeDate) {
        return "All cheque details (Bank, Branch, Number, Date) are required";
      }
    }
    return null;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const newNum = parseFloat(value) || 0;
    if (allocations.length === 1) {
      setAllocations([{ sale: allocations[0].sale, amount: newNum }]);
    }
  };

  const handleSubmit = async (shouldPrint: boolean) => {
    setError(null);
    const validationErr = validateForm();
    if (validationErr) {
      setError(validationErr);
      return;
    }
    const payload = buildPayload();
    if (!payload) {
      setError("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const result = await recordCustomerPayment(customerId, branchId, payload);
    setSaving(false);
    if (result.success) {
      if (shouldPrint) {
        printReceipt(payload);
      }
      setAmount("");
      setAllocations([]);
      setNote("");
      setReceiptNumber("");
      setMomoName("");
      setMomoNumber("");
      setTransactionId("");
      setChequeBank("");
      setChequeBranch("");
      setChequeNumber("");
      onSuccess();
      onClose();
    } else {
      setError(result.error ?? "Failed to record payment");
    }
  };

  const printReceipt = (payload: RecordCustomerPaymentPayload) => {
    const methodLabel = paymentMethod === "cash" ? "Cash" : paymentMethod === "momo" ? "Mobile Money (MoMo)" : "Cheque";
    let methodDetails = "";
    if (paymentMethod === "momo") {
      methodDetails = `\nMoMo Name: ${payload.momoName}\nMoMo Number: ${payload.momoNumber}`;
      if (payload.transactionId) methodDetails += `\nTransaction ID: ${payload.transactionId}`;
    } else if (payload.cheque) {
      methodDetails = `\nBank: ${payload.cheque.bank}\nBranch: ${payload.cheque.branch}\nCheque #: ${payload.cheque.number}\nCheque Date: ${payload.cheque.date}`;
    }
    const receiptDate = payload.date ? new Date(payload.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString();

    const content = `
      <!DOCTYPE html>
      <html>
        <head><title>Payment Receipt - ${customerName}</title></head>
        <body style="font-family: system-ui, sans-serif; padding: 24px; max-width: 400px; margin: 0 auto;">
          <h2 style="margin: 0 0 16px; font-size: 18px;">Payment Receipt</h2>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Customer:</strong> ${customerName}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Date:</strong> ${receiptDate}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Amount:</strong> ${formatCurrency(payload.amount)}</p>
          <p style="margin: 0 0 8px; font-size: 14px;"><strong>Method:</strong> ${methodLabel}${methodDetails}</p>
          ${payload.receiptNumber ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Receipt #:</strong> ${payload.receiptNumber}</p>` : ""}
          ${payload.note ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Note:</strong> ${payload.note}</p>` : ""}
          <p style="margin: 24px 0 0; font-size: 12px; color: #666;">Generated on ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h2>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {customerName} • Due: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(dueBalance)}</span>
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-4"
        >
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>
          )}
          {allocations.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800/50 rounded-lg px-3 py-2">
              Allocating to {allocations.length} sale{allocations.length > 1 ? "s" : ""}: {formatCurrency(allocations.reduce((s, a) => s + a.amount, 0))} total.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date paid *</label>
            <input
              type="date"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "cash" | "momo" | "cheque")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
            >
              <option value="cash">Cash</option>
              <option value="momo">Mobile Money (MoMo)</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {paymentMethod === "momo" && (
            <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MoMo Name *</label>
                <input
                  type="text"
                  value={momoName}
                  onChange={(e) => setMomoName(e.target.value)}
                  placeholder="Sender name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MoMo Number *</label>
                <input
                  type="tel"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="0XX XXX XXXX"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID (optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {paymentMethod === "cheque" && (
            <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-neutral-800/50">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank *</label>
                <input
                  type="text"
                  value={chequeBank}
                  onChange={(e) => setChequeBank(e.target.value)}
                  placeholder="Bank name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch *</label>
                <input
                  type="text"
                  value={chequeBranch}
                  onChange={(e) => setChequeBranch(e.target.value)}
                  placeholder="Branch"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cheque number *</label>
                <input
                  type="text"
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                  placeholder="Cheque #"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cheque date *</label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receipt number</label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Record Payment
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border border-primary text-primary rounded-md hover:bg-primary/10 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                Record & Print
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
