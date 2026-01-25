"use client";

import { useSalesReport } from "../hooks/useSalesReport";
import SalesReportHeader from "./SalesReportHeader";
import DailySalesTable from "./DailySalesTable";

export default function SalesReportClient() {
  const report = useSalesReport();

  return (
    <div>
      <SalesReportHeader {...report} />
      <DailySalesTable {...report} />
    </div>
  );
}
