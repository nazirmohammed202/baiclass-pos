"use client";

import { SalePopulatedType } from "@/types";
import { getSalesHistoryCached, deleteSale } from "@/lib/sale-actions";
import { useCallback } from "react";
import { useSales } from "@/context/salesContext";
import { useRouter } from "next/navigation";

type UseSalesHistoryActionsProps = {
  branchId: string;
  setDeletingId: (id: string | null) => void;
  setOpenDropdownId: (id: string | null) => void;
  onDeleteSaleRequest: (sale: SalePopulatedType) => void;
};

export const useSalesHistoryActions = ({
  branchId,
  setDeletingId,
  setOpenDropdownId,
  onDeleteSaleRequest,
}: UseSalesHistoryActionsProps) => {
  const router = useRouter();

  const {
    searchQuery,
    startDate,
    endDate,
    setSalesHistory,
    setLoading,
    setPagination,
    limit,
    setPage,
  } = useSales();

  const refreshSalesHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch from page 1 when refreshing
      const currentPage = 1;
      const data = await getSalesHistoryCached(
        branchId,
        startDate,
        endDate,
        "",
        currentPage,
        limit
      );
      setLoading(false);
      setSalesHistory(data.sales);
      setPagination(data.pagination);
      setPage(currentPage);
    } catch (error) {
      console.error("Failed to refresh sales history:", error);
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    branchId,
    startDate,
    endDate,
    setSalesHistory,
    setPagination,
    limit,
    setPage,
  ]);

  const searchSalesHistory = useCallback(async () => {
    setLoading(true);
    // Reset to first page when searching
    const searchPage = 1;
    setPage(searchPage);
    try {
      const data = await getSalesHistoryCached(
        branchId,
        startDate,
        endDate,
        searchQuery,
        searchPage,
        limit
      );
      setLoading(false);
      setSalesHistory(data.sales);
      setPagination(data.pagination);
    } catch (error) {
      setLoading(false);
      console.error("Failed to refresh sales history:", error);
    }
  }, [
    setLoading,
    branchId,
    startDate,
    endDate,
    searchQuery,
    setSalesHistory,
    setPagination,
    limit,
    setPage,
  ]);

  const handleEditSale = async (sale: SalePopulatedType) => {
    router.push(`/${branchId}/menu/new-sale?saleId=${sale._id}`);
    // Default edit behavior - you can customize this
    // You might want to open a modal or navigate to an edit page here
  };

  const handleDeleteSale = useCallback(
    (sale: SalePopulatedType) => {
      // Open delete confirmation modal
      onDeleteSaleRequest(sale);
    },
    [onDeleteSaleRequest]
  );

  const confirmDeleteSale = useCallback(
    async (
      sale: SalePopulatedType,
      successCallback: () => void,
      errorCallback: () => void
    ) => {
      setDeletingId(sale._id);
      try {
        const result = await deleteSale(sale._id, branchId);
        if (result.success) {
          // Refresh the sales history
          await refreshSalesHistory();
          successCallback();
        } else {
          console.error("Error deleting sale:", result.error);
          errorCallback();
        }
      } catch (error) {
        console.error("Error deleting sale:", error);
      } finally {
        setDeletingId(null);
        setOpenDropdownId(null);
      }
    },
    [branchId, refreshSalesHistory, setDeletingId, setOpenDropdownId]
  );

  const loadPage = useCallback(
    async (newPage: number) => {
      setLoading(true);
      try {
        const data = await getSalesHistoryCached(
          branchId,
          startDate,
          endDate,
          searchQuery,
          newPage,
          limit
        );
        setLoading(false);
        setSalesHistory(data.sales);
        setPagination(data.pagination);
        setPage(newPage);
      } catch (error) {
        console.error("Failed to load page:", error);
        setLoading(false);
      }
    },
    [
      branchId,
      startDate,
      endDate,
      searchQuery,
      limit,
      setSalesHistory,
      setPagination,
      setPage,
      setLoading,
    ]
  );

  return {
    refreshSalesHistory,
    handleEditSale,
    handleDeleteSale,
    confirmDeleteSale,
    searchSalesHistory,
    loadPage,
  };
};
