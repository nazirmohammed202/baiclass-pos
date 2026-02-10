"use client";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { SupplierType } from "@/types";
import SuppliersHeader from "./SuppliersHeader";
import SuppliersTable, { SuppliersTableRef } from "./SuppliersTable";

type SuppliersSectionProps = {
  branchId: string;
  initialSuppliers: Promise<SupplierType[]>;
};

export default function SuppliersSection({
  branchId,
  initialSuppliers,
}: SuppliersSectionProps) {
  const router = useRouter();
  const suppliers = use(initialSuppliers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyDebtors, setShowOnlyDebtors] = useState(false);
  const tableRef = useRef<SuppliersTableRef>(null);

  const filteredSuppliers = searchQuery.trim()
    ? suppliers.filter((s) => {
        const q = searchQuery.toLowerCase();
        const phones = Array.isArray(s.phoneNumbers) ? s.phoneNumbers.join(" ") : "";
        return (
          (s.name ?? "").toLowerCase().includes(q) ||
          phones.toLowerCase().includes(q) ||
          (s.address ?? "").toLowerCase().includes(q) ||
          (s.email ?? "").toLowerCase().includes(q)
        );
      })
    : suppliers;

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <section className="h-full flex flex-col min-h-0">
      <SuppliersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddSupplier={handleRefresh}
        branchId={branchId}
        showOnlyDebtors={showOnlyDebtors}
        onShowOnlyDebtorsChange={setShowOnlyDebtors}
        onPrint={() => tableRef.current?.print()}
        onExport={() => tableRef.current?.export()}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        <SuppliersTable
          ref={tableRef}
          branchId={branchId}
          suppliers={filteredSuppliers}
          loading={loading}
          onRefresh={handleRefresh}
          showOnlyDebtors={showOnlyDebtors}
        />
      </div>
    </section>
  );
}
