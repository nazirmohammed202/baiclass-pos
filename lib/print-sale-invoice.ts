import { AccountType, CompanyType, SalePopulatedType } from "@/types";
import { generateInvoiceHTML } from "@/app/(protected)/[branchId]/menu/sales-history/utils/generateInvoiceHTML";

export const printSaleInvoice = (
  sale: SalePopulatedType,
  company: CompanyType | null | undefined,
  account: AccountType | null | undefined,
  branchId: string
): void => {
  if (typeof document === "undefined") return;

  const invoiceHTML = generateInvoiceHTML(sale, company, account, branchId);

  // Render into a hidden iframe rather than window.open. This function is.
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  const removeIframe = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      removeIframe();
      return;
    }

    // The invoice HTML auto-triggers window.print() on load. Clean up the
    // iframe once the print dialog is dismissed, with a fallback timeout in
    // case the afterprint event never fires.
    frameWindow.addEventListener("afterprint", removeIframe, { once: true });
    window.setTimeout(removeIframe, 60000);
  };

  document.body.appendChild(iframe);
  iframe.srcdoc = invoiceHTML;
};
