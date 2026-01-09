"use client";

import { SalePopulatedType } from "@/types";
import { getSalesHistoryCached, deleteSale } from "@/lib/sale-actions";
import { useCallback } from "react";
import { useSales } from "@/context/salesContext";

type UseSalesHistoryActionsProps = {
  branchId: string;
  setDeletingId: (id: string | null) => void;
  setOpenDropdownId: (id: string | null) => void;
};

export const useSalesHistoryActions = ({
  branchId,
  setDeletingId,
  setOpenDropdownId,
}: UseSalesHistoryActionsProps) => {
  const { searchQuery, startDate, endDate, setSalesHistory, setLoading } =
    useSales();

  const refreshSalesHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSalesHistoryCached(
        branchId,
        startDate,
        endDate,
        ""
      );
      setLoading(false);
      setSalesHistory(data);
    } catch (error) {
      console.error("Failed to refresh sales history:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, branchId, startDate, endDate, setSalesHistory]);

  const searchSalesHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSalesHistoryCached(
        branchId,
        startDate,
        endDate,
        searchQuery
      );
      setLoading(false);
      setSalesHistory(data);
    } catch (error) {
      setLoading(false);
      console.error("Failed to refresh sales history:", error);
    }
  }, [setLoading, branchId, startDate, endDate, searchQuery, setSalesHistory]);

  const handleEditSale = async (sale: SalePopulatedType) => {
    // Default edit behavior - you can customize this
    // You might want to open a modal or navigate to an edit page here
  };

  const handleDeleteSale = async (sale: SalePopulatedType) => {
    // Confirm deletion
    if (
      !window.confirm(
        `Are you sure you want to delete this sale (Invoice: ${
          sale.invoiceNumber ||
          (sale._id ? sale._id.slice(-8).toUpperCase() : "—")
        })? This action cannot be undone.`
      )
    ) {
      return;
    }

    if (!sale._id) {
      console.error("Sale ID is missing");
      return;
    }

    setDeletingId(sale._id);
    try {
      const result = await deleteSale(sale._id, branchId);
      if (result.success) {
        // Refresh the sales history
        await refreshSalesHistory();
      } else {
        alert(`Failed to delete sale: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("An error occurred while deleting the sale.");
    } finally {
      setDeletingId(null);
      setOpenDropdownId(null);
    }
  };

  return {
    refreshSalesHistory,
    handleEditSale,
    handleDeleteSale,
    searchSalesHistory,
  };
};
