"use client";

import { useEffect, useState, useCallback } from "react";
import { PaymentType } from "@/types";
import { getSupplierProcurements, getSupplierPayments } from "@/lib/suppliers-actions";
import type { SupplierProcurementType } from "@/lib/suppliers-actions";

export type SupplierProfilePagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const DEFAULT_LIMIT = 10;

type UseSupplierProfileParams = {
  supplierId: string;
  branchId: string;
};

export function useSupplierProfile({ supplierId, branchId }: UseSupplierProfileParams) {
  const [procurements, setProcurements] = useState<SupplierProcurementType[]>([]);
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [procurementsPagination, setProcurementsPagination] = useState<SupplierProfilePagination | null>(null);
  const [paymentsPagination, setPaymentsPagination] = useState<SupplierProfilePagination | null>(null);
  const [procurementsLoading, setProcurementsLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [procurementsError, setProcurementsError] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [procurementsPage, setProcurementsPage] = useState(1);
  const [procurementsLimit, setProcurementsLimit] = useState(DEFAULT_LIMIT);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLimit, setPaymentsLimit] = useState(DEFAULT_LIMIT);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setProcurementsLoading(true);
    setProcurementsError(null);
    getSupplierProcurements(supplierId, branchId, procurementsPage, procurementsLimit)
      .then((res) => {
        if (!cancelled) {
          setProcurements(res.procurements ?? []);
          setProcurementsPagination(res.pagination ?? null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setProcurementsError(e instanceof Error ? e.message : "Failed to load procurements");
          setProcurements([]);
          setProcurementsPagination(null);
        }
      })
      .finally(() => {
        if (!cancelled) setProcurementsLoading(false);
      });
    return () => { cancelled = true; };
  }, [supplierId, branchId, procurementsPage, procurementsLimit, refreshTrigger]);

  useEffect(() => {
    let cancelled = false;
    setPaymentsLoading(true);
    setPaymentsError(null);
    getSupplierPayments(supplierId, branchId, paymentsPage, paymentsLimit)
      .then((res) => {
        if (!cancelled) {
          setPayments(res.payments ?? []);
          setPaymentsPagination(res.pagination ?? null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setPaymentsError(e instanceof Error ? e.message : "Failed to load payments");
          setPayments([]);
          setPaymentsPagination(null);
        }
      })
      .finally(() => {
        if (!cancelled) setPaymentsLoading(false);
      });
    return () => { cancelled = true; };
  }, [supplierId, branchId, paymentsPage, paymentsLimit, refreshTrigger]);

  const loadProcurementsPage = useCallback((page: number) => setProcurementsPage(page), []);
  const loadPaymentsPage = useCallback((page: number) => setPaymentsPage(page), []);
  const setProcurementsLimitAndReset = useCallback((limit: number) => {
    setProcurementsLimit(limit);
    setProcurementsPage(1);
  }, []);
  const setPaymentsLimitAndReset = useCallback((limit: number) => {
    setPaymentsLimit(limit);
    setPaymentsPage(1);
  }, []);

  const refreshProfile = useCallback(() => setRefreshTrigger((t) => t + 1), []);

  return {
    procurements,
    payments,
    procurementsPagination,
    paymentsPagination,
    procurementsLoading,
    paymentsLoading,
    procurementsError,
    paymentsError,
    procurementsLimit,
    paymentsLimit,
    loadProcurementsPage,
    loadPaymentsPage,
    setProcurementsLimit: setProcurementsLimitAndReset,
    setPaymentsLimit: setPaymentsLimitAndReset,
    refreshProfile,
  };
}
