"use client";

import { useStockReport } from "../hooks/useStockReport";
import StockReportHeader from "./StockReportHeader";
import DailyStockTable from "./DailyStockTable";

export default function StockReportClient() {
  const report = useStockReport();

  return (
    <div>
      <StockReportHeader {...report} />
      <DailyStockTable {...report} />
    </div>
  );
}
