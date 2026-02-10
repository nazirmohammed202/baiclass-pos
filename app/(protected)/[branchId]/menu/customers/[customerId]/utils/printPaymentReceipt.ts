import { PaymentType } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function printPaymentReceipt(payment: PaymentType, customerName: string): void {
  const methodLabel = payment.paymentMethod === "momo" ? "Mobile Money" : payment.paymentMethod === "cheque" ? "Cheque" : "Cash";
  let methodDetails = "";
  if (payment.paymentMethod === "momo" && (payment.momoName || payment.transactionId)) {
    if (payment.momoName) methodDetails += `\nMoMo Name: ${payment.momoName}`;
    if (payment.transactionId) methodDetails += `\nTransaction ID: ${payment.transactionId}`;
  } else if (payment.cheque && typeof payment.cheque === "object") {
    const ch = payment.cheque as { bank?: string; branch?: string; number?: string };
    methodDetails = `\nBank: ${ch.bank ?? "—"}\nBranch: ${ch.branch ?? "—"}\nCheque #: ${ch.number ?? "—"}`;
  }
  const receiptDate = payment.date
    ? new Date(payment.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const content = `<!DOCTYPE html><html><head><title>Payment Receipt - ${customerName}</title></head>
<body style="font-family: system-ui, sans-serif; padding: 24px; max-width: 400px; margin: 0 auto;">
  <h2 style="margin: 0 0 16px; font-size: 18px;">Payment Receipt</h2>
  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Customer:</strong> ${customerName}</p>
  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Date:</strong> ${receiptDate}</p>
  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Amount:</strong> ${formatCurrency(payment.amount ?? 0)}</p>
  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Method:</strong> ${methodLabel}${methodDetails}</p>
  ${payment.receiptNumber ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Receipt #:</strong> ${payment.receiptNumber}</p>` : ""}
  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Balance before:</strong> ${formatCurrency(payment.balanceBefore ?? 0)}</p>
  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Balance after:</strong> ${formatCurrency(payment.balanceAfter ?? 0)}</p>
  ${payment.note ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Note:</strong> ${payment.note}</p>` : ""}
  <p style="margin: 24px 0 0; font-size: 12px; color: #666;">Generated on ${new Date().toLocaleString()}</p>
</body></html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
