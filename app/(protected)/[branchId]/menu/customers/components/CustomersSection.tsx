"use client";

import { useState, useRef, use } from "react";
import { CustomersBalanceDueType, CustomerType } from "@/types";
import CustomersHeader from "./CustomersHeader";
import CustomersTable, { CustomersTableRef } from "./CustomersTable";

type CustomersSectionProps = {
  branchId: string;
  initialCustomers: Promise<CustomerType[]>;
  initialCustomersBalanceDue: Promise<CustomersBalanceDueType[]>;
};

export default function CustomersSection({
  branchId,
  initialCustomers,
  initialCustomersBalanceDue,
}: CustomersSectionProps) {
  const customers = use(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyDebtors, setShowOnlyDebtors] = useState(false);
  const tableRef = useRef<CustomersTableRef>(null);

  const filteredCustomers = searchQuery.trim()
    ? customers.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.phoneNumber ?? "").toLowerCase().includes(q) ||
        (c.address ?? "").toLowerCase().includes(q)
      );
    })
    : customers;



  return (
    <section className="h-full flex flex-col min-h-0">
      <CustomersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddCustomer={() => { }}
        branchId={branchId}
        showOnlyDebtors={showOnlyDebtors}
        onShowOnlyDebtorsChange={setShowOnlyDebtors}
        onPrint={() => tableRef.current?.print()}
        onExport={() => tableRef.current?.export()}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        <CustomersTable
          ref={tableRef}
          branchId={branchId}
          customers={filteredCustomers}
          loading={loading}
          initialCustomersBalanceDue={initialCustomersBalanceDue}
          onRefresh={() => { }}
          showOnlyDebtors={showOnlyDebtors}
        />
      </div>
    </section>
  );
}
