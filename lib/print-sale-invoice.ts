import { AccountType, CompanyType, SalePopulatedType } from "@/types";
import { generateInvoiceHTML } from "@/app/(protected)/[branchId]/menu/sales-history/utils/generateInvoiceHTML";
import { printHtml } from "@/lib/print-html";

export const printSaleInvoice = (
  sale: SalePopulatedType,
  company: CompanyType | null | undefined,
  account: AccountType | null | undefined,
  branchId: string
): void => {
  const invoiceHTML = generateInvoiceHTML(sale, company, account, branchId);
  printHtml(invoiceHTML);
};
