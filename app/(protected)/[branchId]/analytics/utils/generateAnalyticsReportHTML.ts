import type { AnalyticsDashboardData } from "@/lib/analytics-action";
import type { KPICard, ProductPerformanceItem } from "@/types";

export type AnalyticsReportMeta = {
  companyName?: string;
  branchName?: string;
  periodLabel: string;
  currentDatesLabel: string;
  compareDatesLabel?: string;
  compareEnabled?: boolean;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatCurrency = (amount: number): string =>
  `₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (value: number): string =>
  value.toLocaleString("en-GH", { maximumFractionDigits: 2 });

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

const formatKPIValue = (card: KPICard): string => {
  switch (card.format) {
    case "currency":
      return formatCurrency(card.value);
    case "percent":
      return formatPercent(card.value);
    default:
      return formatNumber(card.value);
  }
};

const formatChange = (card: KPICard): string => {
  if (card.changePercent == null) return "—";
  const sign = card.changePercent > 0 ? "+" : "";
  return `${sign}${card.changePercent.toFixed(1)}%`;
};

const productRows = (items: ProductPerformanceItem[], limit = 10): string => {
  if (!items.length) {
    return `<tr><td colspan="6" class="empty">No data</td></tr>`;
  }
  return items
    .slice(0, limit)
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td class="num">${formatNumber(item.quantitySold)}</td>
        <td class="num">${formatCurrency(item.revenue)}</td>
        <td class="num">${formatCurrency(item.profit)}</td>
        <td class="num">${formatPercent(item.margin)}</td>
        <td class="num">${formatNumber(item.stock)}</td>
      </tr>`
    )
    .join("");
};

export const generateAnalyticsReportHTML = (
  data: AnalyticsDashboardData,
  meta: AnalyticsReportMeta
): string => {
  const logoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/baiclass.png`
      : "/baiclass.png";

  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const compareLine =
    meta.compareEnabled && meta.compareDatesLabel
      ? `<p class="subtitle">Compared to ${escapeHtml(meta.compareDatesLabel)}</p>`
      : "";

  const kpiEntries: { key: keyof AnalyticsDashboardData["kpis"]; label: string }[] = [
    { key: "grossRevenue", label: "Gross Revenue" },
    { key: "netRevenue", label: "Net Revenue" },
    { key: "totalProfit", label: "Total Profit" },
    { key: "profitMargin", label: "Profit Margin" },
    { key: "totalTransactions", label: "Transactions" },
    { key: "averageOrderValue", label: "Avg Order Value" },
    { key: "totalItemsSold", label: "Items Sold" },
    { key: "totalDiscounts", label: "Discounts" },
    { key: "discountRate", label: "Discount Rate" },
    { key: "totalRefunds", label: "Refunds" },
    { key: "refundRate", label: "Refund Rate" },
    { key: "taxCollected", label: "Tax Collected" },
  ];

  const kpiCards = kpiEntries
    .map(({ key, label }) => {
      const card = data.kpis[key];
      const changeClass =
        card.changePercent == null
          ? ""
          : card.changePercent >= 0
            ? "up"
            : "down";
      return `
        <div class="kpi">
          <div class="kpi-label">${escapeHtml(label)}</div>
          <div class="kpi-value">${formatKPIValue(card)}</div>
          <div class="kpi-change ${changeClass}">${formatChange(card)}</div>
        </div>`;
    })
    .join("");

  const trendRows = data.salesTrend.length
    ? data.salesTrend
        .map(
          (point) => `
      <tr>
        <td>${escapeHtml(point.label)}</td>
        <td class="num">${formatCurrency(point.revenue)}</td>
        <td class="num">${formatCurrency(point.profit)}</td>
        <td class="num">${formatNumber(point.transactions)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="empty">No trend data</td></tr>`;

  const paymentTotal = data.paymentsBreakdown.reduce((sum, p) => sum + p.amount, 0);
  const paymentRows = data.paymentsBreakdown.length
    ? data.paymentsBreakdown
        .map((p) => {
          const share = paymentTotal > 0 ? (p.amount / paymentTotal) * 100 : 0;
          return `
      <tr>
        <td>${escapeHtml(p.label)}</td>
        <td class="num">${formatCurrency(p.amount)}</td>
        <td class="num">${formatPercent(share)}</td>
      </tr>`;
        })
        .join("")
    : `<tr><td colspan="3" class="empty">No payment data</td></tr>`;

  const staffRows = data.staffPerformance.length
    ? data.staffPerformance
        .map(
          (s) => `
      <tr>
        <td>${escapeHtml(s.name)}</td>
        <td class="num">${formatCurrency(s.revenue)}</td>
        <td class="num">${formatNumber(s.transactions)}</td>
        <td class="num">${formatCurrency(s.averageSale)}</td>
        <td class="num">${formatCurrency(s.discountsGiven)}</td>
        <td class="num">${formatNumber(s.itemsSold)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="empty">No staff data</td></tr>`;

  const customerRows = data.customerAnalytics.topCustomers.length
    ? data.customerAnalytics.topCustomers
        .slice(0, 10)
        .map(
          (c) => `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td class="num">${formatCurrency(c.revenue)}</td>
        <td class="num">${formatNumber(c.transactions)}</td>
        <td class="num">${formatCurrency(c.clv)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="empty">No customer data</td></tr>`;

  const peakHourRows = data.timeIntelligence.peakHours.length
    ? data.timeIntelligence.peakHours
        .map(
          (h) => `
      <tr>
        <td>${escapeHtml(h.hourLabel)}</td>
        <td class="num">${formatCurrency(h.revenue)}</td>
        <td class="num">${formatNumber(h.transactions)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="3" class="empty">No data</td></tr>`;

  const peakDayRows = data.timeIntelligence.peakDays.length
    ? data.timeIntelligence.peakDays
        .map(
          (d) => `
      <tr>
        <td>${escapeHtml(d.dayLabel)}</td>
        <td class="num">${formatCurrency(d.revenue)}</td>
        <td class="num">${formatNumber(d.transactions)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="3" class="empty">No data</td></tr>`;

  const alertRows = data.alertsRisks.alerts.length
    ? data.alertsRisks.alerts
        .map(
          (a) => `
      <tr>
        <td><span class="badge ${escapeHtml(a.severity)}">${escapeHtml(a.severity)}</span></td>
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.detail)}</td>
        <td class="num">${a.metric ? escapeHtml(a.metric) : "—"}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="empty">No alerts for this period</td></tr>`;

  const inv = data.inventoryHealth;
  const cust = data.customerAnalytics;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Analytics Report — ${escapeHtml(meta.periodLabel)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #111827;
      background: #fff;
      line-height: 1.45;
      font-size: 11px;
    }
    .page {
      max-width: 960px;
      margin: 0 auto;
      padding: 28px 32px 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 18px;
      border-bottom: 3px solid #008080;
      margin-bottom: 22px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand img {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }
    .brand h1 {
      font-size: 22px;
      font-weight: 700;
      color: #008080;
      letter-spacing: -0.02em;
    }
    .brand .company {
      font-size: 12px;
      color: #4b5563;
      margin-top: 2px;
    }
    .meta {
      text-align: right;
    }
    .meta .title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
    }
    .meta .subtitle {
      color: #6b7280;
      margin-top: 2px;
    }
    .meta .generated {
      color: #9ca3af;
      font-size: 10px;
      margin-top: 8px;
    }
    h2 {
      font-size: 13px;
      font-weight: 700;
      color: #008080;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin: 22px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .kpi {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px 12px;
      background: #f9fafb;
    }
    .kpi-label {
      font-size: 10px;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .kpi-value {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-top: 4px;
      font-variant-numeric: tabular-nums;
    }
    .kpi-change {
      font-size: 10px;
      margin-top: 2px;
      color: #9ca3af;
      font-variant-numeric: tabular-nums;
    }
    .kpi-change.up { color: #059669; }
    .kpi-change.down { color: #dc2626; }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 8px;
    }
    .stat {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .stat .label { color: #6b7280; font-size: 10px; text-transform: uppercase; }
    .stat .value { font-size: 14px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4px;
    }
    th, td {
      padding: 7px 8px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }
    th {
      background: #f3f4f6;
      color: #374151;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      font-weight: 600;
    }
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
    td.empty { text-align: center; color: #9ca3af; padding: 14px; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge.critical { background: #fee2e2; color: #b91c1c; }
    .badge.warning { background: #fef3c7; color: #b45309; }
    .badge.info { background: #e0f2fe; color: #0369a1; }
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 10px;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 0; max-width: none; }
      h2 { break-after: avoid; }
      .kpi, .stat, table, tr { break-inside: avoid; }
      .kpi-grid, .stats-row, .two-col { break-inside: avoid; }
    }
    @page {
      size: A4;
      margin: 14mm 12mm;
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="brand">
        <img src="${logoUrl}" alt="BaiClass" />
        <div>
          <h1>BaiClass</h1>
          <div class="company">${escapeHtml(meta.companyName || "Analytics Report")}${
            meta.branchName ? ` · ${escapeHtml(meta.branchName)}` : ""
          }</div>
        </div>
      </div>
      <div class="meta">
        <div class="title">Analytics Report</div>
        <p class="subtitle">${escapeHtml(meta.periodLabel)} — ${escapeHtml(meta.currentDatesLabel)}</p>
        ${compareLine}
        <p class="generated">Generated ${escapeHtml(generatedAt)}</p>
      </div>
    </header>

    <h2>Key Performance Indicators</h2>
    <div class="kpi-grid">${kpiCards}</div>

    <h2>Sales Trend</h2>
    <table>
      <thead>
        <tr>
          <th>Period</th>
          <th class="num">Revenue</th>
          <th class="num">Profit</th>
          <th class="num">Transactions</th>
        </tr>
      </thead>
      <tbody>${trendRows}</tbody>
    </table>

    <div class="two-col">
      <div>
        <h2>Payment Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th class="num">Amount</th>
              <th class="num">Share</th>
            </tr>
          </thead>
          <tbody>${paymentRows}</tbody>
        </table>
      </div>
      <div>
        <h2>Inventory Health</h2>
        <div class="stats-row" style="grid-template-columns: 1fr 1fr;">
          <div class="stat"><div class="label">Cost Value</div><div class="value">${formatCurrency(inv.totalValueCost)}</div></div>
          <div class="stat"><div class="label">Retail Value</div><div class="value">${formatCurrency(inv.totalValueRetail)}</div></div>
          <div class="stat"><div class="label">GMROI</div><div class="value">${formatNumber(inv.gmroi)}</div></div>
          <div class="stat"><div class="label">Avg Turnover</div><div class="value">${formatNumber(inv.averageTurnover)}</div></div>
          <div class="stat"><div class="label">Total SKUs</div><div class="value">${formatNumber(inv.totalSkus)}</div></div>
          <div class="stat"><div class="label">Low / Out / Over</div><div class="value">${inv.lowStockCount} / ${inv.outOfStockCount} / ${inv.overstockedCount}</div></div>
        </div>
      </div>
    </div>

    <h2>Top Selling Products</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="num">Qty Sold</th>
          <th class="num">Revenue</th>
          <th class="num">Profit</th>
          <th class="num">Margin</th>
          <th class="num">Stock</th>
        </tr>
      </thead>
      <tbody>${productRows(data.productPerformance.topSelling)}</tbody>
    </table>

    <h2>Most Profitable Products</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="num">Qty Sold</th>
          <th class="num">Revenue</th>
          <th class="num">Profit</th>
          <th class="num">Margin</th>
          <th class="num">Stock</th>
        </tr>
      </thead>
      <tbody>${productRows(data.productPerformance.mostProfitable)}</tbody>
    </table>

    <h2>Staff Performance</h2>
    <table>
      <thead>
        <tr>
          <th>Staff</th>
          <th class="num">Revenue</th>
          <th class="num">Transactions</th>
          <th class="num">Avg Sale</th>
          <th class="num">Discounts</th>
          <th class="num">Items Sold</th>
        </tr>
      </thead>
      <tbody>${staffRows}</tbody>
    </table>

    <h2>Customer Analytics</h2>
    <div class="stats-row">
      <div class="stat"><div class="label">New Customers</div><div class="value">${formatNumber(cust.newCustomers)}</div></div>
      <div class="stat"><div class="label">Returning</div><div class="value">${formatNumber(cust.returningCustomers)}</div></div>
      <div class="stat"><div class="label">Repeat Rate</div><div class="value">${formatPercent(cust.repeatPurchaseRate)}</div></div>
      <div class="stat"><div class="label">Avg Basket Size</div><div class="value">${formatNumber(cust.averageBasketSize)}</div></div>
      <div class="stat"><div class="label">Avg Basket Value</div><div class="value">${formatCurrency(cust.averageBasketValue)}</div></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Top Customer</th>
          <th class="num">Revenue</th>
          <th class="num">Transactions</th>
          <th class="num">CLV</th>
        </tr>
      </thead>
      <tbody>${customerRows}</tbody>
    </table>

    <div class="two-col">
      <div>
        <h2>Peak Hours</h2>
        <table>
          <thead>
            <tr>
              <th>Hour</th>
              <th class="num">Revenue</th>
              <th class="num">Transactions</th>
            </tr>
          </thead>
          <tbody>${peakHourRows}</tbody>
        </table>
      </div>
      <div>
        <h2>Peak Days</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th class="num">Revenue</th>
              <th class="num">Transactions</th>
            </tr>
          </thead>
          <tbody>${peakDayRows}</tbody>
        </table>
      </div>
    </div>

    <h2>Alerts &amp; Risks</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Title</th>
          <th>Detail</th>
          <th class="num">Metric</th>
        </tr>
      </thead>
      <tbody>${alertRows}</tbody>
    </table>

    <footer class="footer">
      <span>BaiClass POS · Analytics Report</span>
      <span>${escapeHtml(meta.periodLabel)} · ${escapeHtml(meta.currentDatesLabel)}</span>
    </footer>
  </div>
  <script>
    (function () {
      window.onload = function () {
        setTimeout(function () { window.print(); }, 250);
      };
    })();
  </script>
</body>
</html>
  `.trim();
};
