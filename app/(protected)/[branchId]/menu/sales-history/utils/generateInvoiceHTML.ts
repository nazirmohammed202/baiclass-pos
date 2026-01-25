import { SalePopulatedType } from "@/types";

// Type guard for customer with extended properties
type CustomerWithDetails = {
  _id: string;
  name: string;
  address?: string;
  phoneNumber?: string;
};

type CompanyType = {
  name?: string;
  branches?: Array<{
    _id: string;
    address?: string;
  }>;
};

type AccountType = {
  phoneNumber?: string;
};

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

// Helper to extract product name safely
const getProductName = (
  product: string | { name?: string; details?: { name?: string } }
): string => {
  if (typeof product === "string") return "Product";
  return product?.name || product?.details?.name || "Product";
};

// Helper to extract product manufacturer
const getProductManufacturer = (
  product:
    | string
    | { manufacturer?: string; details?: { manufacturer?: string } }
): string | null => {
  if (typeof product === "string") return null;
  return product?.manufacturer || product?.details?.manufacturer || null;
};

// Helper to extract product size
const getProductSize = (
  product: string | { size?: string; details?: { size?: string } }
): string | null => {
  if (typeof product === "string") return null;
  return product?.size || product?.details?.size || null;
};

// Helper to extract product type
const getProductType = (
  product: string | { type?: string; details?: { type?: string } }
): string | null => {
  if (typeof product === "string") return null;
  return product?.type || product?.details?.type || null;
};

export const generateInvoiceHTML = (
  sale: SalePopulatedType,
  company: CompanyType | null | undefined,
  account: AccountType | null | undefined,
  branchId: string
): string => {
  const subtotal = sale.total + sale.discount;
  const invoiceNumber =
    sale.invoiceNumber || (sale._id ? sale._id.slice(-8).toUpperCase() : "—");
  const logoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/baiclass.png`
      : "/baiclass.png";

  // Find current branch from company branches
  const currentBranch = company?.branches?.find(
    (branch) => branch._id === branchId || branch._id === sale.branch?._id
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 40px;
      color: #000;
      background: #fff;
      line-height: 1.6;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #cbcbcb;
    }
    .company-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }
    .company-details h3 {
      font-size: 18px;
      color: #111827;
    }
    .company-details p {
      font-size: 14px;
      color: #6b7280;
    }
    .customer-info {
      text-align: right;
    }
    .customer-info p {
      font-size: 14px;
      color: #6b7280;
    }
    .customer-info h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      text-transform: capitalize;
    }
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #cbcbcb;
    }
    .meta-section h4 {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .meta-section p {
      font-size: 14px;
      color: #111827;
    }
    .meta-right {
      display: flex;
      gap: 40px;
    }
    .meta-item h4 {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .meta-item p {
      font-size: 14px;
      color: #111827;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      border-bottom: 1px solid #cbcbcb;
    }
    th {
      text-align: left;
      padding: 2px 4px;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
    }
    th.text-right {
      text-align: right;
    }
    td {
      padding: 2px 4px;
      font-size: 14px;
      color: #111827;
      border-bottom: 1px solid #cbcbcb;
    }
    td.text-right {
      text-align: right;
    }
    .product-cell {
      display: flex;
      flex-direction: column;
    }
    .product-manufacturer {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .product-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .product-name {
      font-size: 14px;
      font-weight: 500;
      color: #444444;
      flex: 1;
      text-transform: uppercase;
    }
    .product-size {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
    }
    .totals {
      margin-left: auto;
      max-width: 300px;
      margin-top: 20px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #4b5563;
    }
    .totals-row.discount {
      color: #dc2626;
    }
    .totals-row.total {
      padding-top: 12px;
      margin-top: 12px;
      border-top: 2px solid #e5e7eb;
      font-size: 18px;
      font-weight: bold;
      color: #111827;
    }
    .notes {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .notes h4 {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .notes p {
      font-size: 14px;
      color: #111827;
    }
    @media print {
      body {
        padding: 20px;
      }
      @page {
        margin: 1cm;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'">
        <div class="company-details">
          <h3>${company?.name || "Company Name"}</h3>
          <p>${currentBranch?.address || "Address"}</p>
          <p>${account?.phoneNumber || "Phone Number"}</p>
        </div>
      </div>
      ${
        sale.customer
          ? `
      <div class="customer-info">
        <p>Bill To:</p>
        <h3>${sale.customer.name}</h3>
        ${
          (sale.customer as CustomerWithDetails).address
            ? `<p>${(sale.customer as CustomerWithDetails).address}</p>`
            : ""
        }
        ${
          (sale.customer as CustomerWithDetails).phoneNumber
            ? `<p>${(sale.customer as CustomerWithDetails).phoneNumber}</p>`
            : ""
        }
      </div>
      `
          : ""
      }
    </div>

    <div class="invoice-meta">
      <div class="meta-section">
        <h4>Issued By:</h4>
        <p>${sale.seller?.name || "—"}</p>
      </div>

      <div class="meta-section">
        <h4>Issued At:</h4>
        <p>${sale.branch?.name || "—"}</p>
      </div>

      <div class="meta-right">
        <div class="meta-item">
          <h4>Invoice Number</h4>
          <p>${invoiceNumber}</p>
        </div>
        <div class="meta-item">
          <h4>Date</h4>
          <p>${formatDate(sale.createdAt)}</p>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${sale.products
          .map((item, index) => {
            const productName = getProductName(item.product);
            const manufacturer = getProductManufacturer(item.product);
            const size = getProductSize(item.product);
            const type = getProductType(item.product);

            return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="product-cell">
              ${
                manufacturer
                  ? `<span class="product-manufacturer">${manufacturer}</span>`
                  : ""
              }
              <div class="product-row">
                <span class="product-name">${productName}${
              type ? ` (${type})` : ""
            }</span>
                ${size ? `<span class="product-size">${size}</span>` : ""}
              </div>
            </div>
          </td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.price)}</td>
          <td class="text-right">${formatCurrency(item.total)}</td>
        </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
      ${
        sale.discount > 0
          ? `
      <div class="totals-row discount">
        <span>Discount</span>
        <span>-${formatCurrency(sale.discount)}</span>
      </div>
      `
          : ""
      }
      <div class="totals-row total">
        <span>Total</span>
        <span>${formatCurrency(sale.total)}</span>
      </div>
    </div>

    ${
      sale.note
        ? `
    <div class="notes">
      <h4>Notes</h4>
      <p>${sale.note}</p>
    </div>
    `
        : ""
    }
  </div>
  <script>
    (function() {
      // Wait for window to load, then trigger print
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 250);
      };
      
      // Close window after print dialog closes (whether printed or cancelled)
      window.addEventListener('afterprint', function() {
        window.close();
      });
      
      // Fallback: Close window if afterprint doesn't fire (some browsers don't support it)
      // This ensures the window closes even if the event isn't supported
      var fallbackClose = setTimeout(function() {
        if (!window.closed) {
          window.close();
        }
      }, 2000);
      
      // Clear fallback if afterprint fires
      window.addEventListener('afterprint', function() {
        clearTimeout(fallbackClose);
      }, { once: true });
    })();
  </script>
</body>
</html>
  `.trim();
};
