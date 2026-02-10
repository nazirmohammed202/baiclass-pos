"use client";

import { useEffect, useState, useCallback } from "react";
import { SalePopulatedType, PaymentType } from "@/types";
import { getCustomerSales, getCustomerPayments } from "@/lib/customer-actions";

export type CustomerProfilePagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const DEFAULT_LIMIT = 10;

type UseCustomerProfileParams = {
  customerId: string;
  branchId: string;
};

export function useCustomerProfile({ customerId, branchId }: UseCustomerProfileParams) {
  const [sales, setSales] = useState<SalePopulatedType[]>([]);
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [salesPagination, setSalesPagination] = useState<CustomerProfilePagination | null>(null);
  const [paymentsPagination, setPaymentsPagination] = useState<CustomerProfilePagination | null>(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [salesPage, setSalesPage] = useState(1);
  const [salesLimit, setSalesLimit] = useState(DEFAULT_LIMIT);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLimit, setPaymentsLimit] = useState(DEFAULT_LIMIT);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setSalesLoading(true);
    setSalesError(null);
    getCustomerSales(customerId, branchId, salesPage, salesLimit)
      .then((res) => {
        if (!cancelled) {
          setSales(res.sales ?? []);
          setSalesPagination(res.pagination ?? null);
        }
      })
      .catch((e) => {
        if (!cancelled) setSalesError(e instanceof Error ? e.message : "Failed to load sales");
      })
      .finally(() => {
        if (!cancelled) setSalesLoading(false);
      });
    return () => { cancelled = true; };
  }, [customerId, branchId, salesPage, salesLimit, refreshTrigger]);

  useEffect(() => {
    let cancelled = false;
    setPaymentsLoading(true);
    setPaymentsError(null);
    getCustomerPayments(customerId, branchId, paymentsPage, paymentsLimit)
      .then((res) => {
        if (!cancelled) {
          setPayments(res.payments ?? []);
          setPaymentsPagination(res.pagination ?? null);
        }
      })
      .catch((e) => {
        if (!cancelled) setPaymentsError(e instanceof Error ? e.message : "Failed to load payments");
      })
      .finally(() => {
        if (!cancelled) setPaymentsLoading(false);
      });
    return () => { cancelled = true; };
  }, [customerId, branchId, paymentsPage, paymentsLimit, refreshTrigger]);

  const loadSalesPage = useCallback((page: number) => setSalesPage(page), []);
  const loadPaymentsPage = useCallback((page: number) => setPaymentsPage(page), []);
  const setSalesLimitAndReset = useCallback((limit: number) => {
    setSalesLimit(limit);
    setSalesPage(1);
  }, []);
  const setPaymentsLimitAndReset = useCallback((limit: number) => {
    setPaymentsLimit(limit);
    setPaymentsPage(1);
  }, []);

  const refreshProfile = useCallback(() => setRefreshTrigger((t) => t + 1), []);

  return {
    sales,
    payments,
    salesPagination,
    paymentsPagination,
    salesLoading,
    paymentsLoading,
    salesError,
    paymentsError,
    salesLimit,
    paymentsLimit,
    loadSalesPage,
    loadPaymentsPage,
    setSalesLimit: setSalesLimitAndReset,
    setPaymentsLimit: setPaymentsLimitAndReset,
    refreshProfile,
  };
}
