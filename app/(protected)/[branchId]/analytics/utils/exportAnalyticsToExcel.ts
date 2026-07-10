import type { AnalyticsDashboardData } from "@/lib/analytics-action";
import type { KPICard, ProductPerformanceItem } from "@/types";
import type { AnalyticsReportMeta } from "./generateAnalyticsReportHTML";

const escapeCSV = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const cell = (value: string | number | undefined | null): string => {
  if (value == null) return "";
  return escapeCSV(String(value));
};

const section = (title: string, headers: string[], rows: (string | number)[][]): string[] => {
  const lines: string[] = ["", title, headers.map(escapeCSV).join(",")];
  for (const row of rows) {
    lines.push(row.map(cell).join(","));
  }
  return lines;
};

const kpiRow = (label: string, card: KPICard): (string | number)[] => [
  label,
  card.value,
  card.previousValue ?? "",
  card.changePercent ?? "",
  card.format,
];

const productTableRows = (items: ProductPerformanceItem[]): (string | number)[][] =>
  items.map((item) => [
    item.name,
    item.category ?? "",
    item.quantitySold,
    item.revenue,
    item.profit,
    item.margin,
    item.stock,
    item.daysOfStockLeft ?? "",
    item.velocityPerDay ?? "",
  ]);

export const exportAnalyticsToExcel = (
  data: AnalyticsDashboardData,
  meta: AnalyticsReportMeta,
  onSuccess?: () => void
): void => {
  if (typeof document === "undefined") return;

  const lines: string[] = [
    "BaiClass Analytics Report",
    `Company,${cell(meta.companyName ?? "")}`,
    `Branch,${cell(meta.branchName ?? "")}`,
    `Period,${cell(meta.periodLabel)}`,
    `Dates,${cell(meta.currentDatesLabel)}`,
  ];

  if (meta.compareEnabled && meta.compareDatesLabel) {
    lines.push(`Compared To,${cell(meta.compareDatesLabel)}`);
  }

  lines.push(`Generated,${cell(new Date().toISOString())}`);

  lines.push(
    ...section(
      "Key Performance Indicators",
      ["Metric", "Value", "Previous Value", "Change %", "Format"],
      [
        kpiRow("Gross Revenue", data.kpis.grossRevenue),
        kpiRow("Net Revenue", data.kpis.netRevenue),
        kpiRow("Total Profit", data.kpis.totalProfit),
        kpiRow("Profit Margin", data.kpis.profitMargin),
        kpiRow("Total Transactions", data.kpis.totalTransactions),
        kpiRow("Average Order Value", data.kpis.averageOrderValue),
        kpiRow("Total Items Sold", data.kpis.totalItemsSold),
        kpiRow("Total Discounts", data.kpis.totalDiscounts),
        kpiRow("Discount Rate", data.kpis.discountRate),
        kpiRow("Total Refunds", data.kpis.totalRefunds),
        kpiRow("Refund Rate", data.kpis.refundRate),
        kpiRow("Tax Collected", data.kpis.taxCollected),
      ]
    )
  );

  lines.push(
    ...section(
      "Sales Trend",
      ["Label", "Date", "Revenue", "Profit", "Transactions", "Previous Revenue", "Previous Profit", "Previous Transactions"],
      data.salesTrend.map((p) => [
        p.label,
        p.date,
        p.revenue,
        p.profit,
        p.transactions,
        p.previousRevenue ?? "",
        p.previousProfit ?? "",
        p.previousTransactions ?? "",
      ])
    )
  );

  lines.push(
    ...section(
      "Payment Breakdown",
      ["Method", "Amount"],
      data.paymentsBreakdown.map((p) => [p.label, p.amount])
    )
  );

  const productHeaders = [
    "Product",
    "Category",
    "Qty Sold",
    "Revenue",
    "Profit",
    "Margin %",
    "Stock",
    "Days of Stock Left",
    "Velocity / Day",
  ];

  lines.push(
    ...section(
      "Top Selling Products",
      productHeaders,
      productTableRows(data.productPerformance.topSelling)
    )
  );
  lines.push(
    ...section(
      "Most Profitable Products",
      productHeaders,
      productTableRows(data.productPerformance.mostProfitable)
    )
  );
  lines.push(
    ...section(
      "Worst Performing Products",
      productHeaders,
      productTableRows(data.productPerformance.worstPerforming)
    )
  );
  lines.push(
    ...section(
      "Dead Stock",
      productHeaders,
      productTableRows(data.productPerformance.deadStock)
    )
  );

  const inv = data.inventoryHealth;
  lines.push(
    ...section(
      "Inventory Health",
      ["Metric", "Value"],
      [
        ["Total Value (Cost)", inv.totalValueCost],
        ["Total Value (Retail)", inv.totalValueRetail],
        ["GMROI", inv.gmroi],
        ["Average Turnover", inv.averageTurnover],
        ["Total SKUs", inv.totalSkus],
        ["Low Stock Count", inv.lowStockCount],
        ["Out of Stock Count", inv.outOfStockCount],
        ["Overstocked Count", inv.overstockedCount],
      ]
    )
  );

  lines.push(
    ...section(
      "Staff Performance",
      ["Staff", "Revenue", "Transactions", "Average Sale", "Discounts Given", "Refunds Processed", "Items Sold"],
      data.staffPerformance.map((s) => [
        s.name,
        s.revenue,
        s.transactions,
        s.averageSale,
        s.discountsGiven,
        s.refundsProcessed,
        s.itemsSold,
      ])
    )
  );

  const cust = data.customerAnalytics;
  lines.push(
    ...section(
      "Customer Summary",
      ["Metric", "Value"],
      [
        ["New Customers", cust.newCustomers],
        ["Returning Customers", cust.returningCustomers],
        ["Repeat Purchase Rate", cust.repeatPurchaseRate],
        ["Average Basket Size", cust.averageBasketSize],
        ["Average Basket Value", cust.averageBasketValue],
      ]
    )
  );
  lines.push(
    ...section(
      "Top Customers",
      ["Customer", "Revenue", "Transactions", "CLV"],
      cust.topCustomers.map((c) => [c.name, c.revenue, c.transactions, c.clv])
    )
  );

  lines.push(
    ...section(
      "Peak Hours",
      ["Hour", "Revenue", "Transactions"],
      data.timeIntelligence.peakHours.map((h) => [h.hourLabel, h.revenue, h.transactions])
    )
  );
  lines.push(
    ...section(
      "Peak Days",
      ["Day", "Revenue", "Transactions"],
      data.timeIntelligence.peakDays.map((d) => [d.dayLabel, d.revenue, d.transactions])
    )
  );

  lines.push(
    ...section(
      "Alerts & Risks",
      ["Severity", "Type", "Title", "Detail", "Metric"],
      data.alertsRisks.alerts.map((a) => [
        a.severity,
        a.type,
        a.title,
        a.detail,
        a.metric ?? "",
      ])
    )
  );

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().split("T")[0];
  const periodSlug = meta.periodLabel.replace(/\s+/g, "-").toLowerCase();

  link.setAttribute("href", url);
  link.setAttribute("download", `analytics-report-${periodSlug}-${dateStamp}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  onSuccess?.();
};
