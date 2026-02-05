"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStockHistory } from "@/context/stockHistoryContext";
import { getInventoryHistory, deleteInventory } from "@/lib/inventory-actions";
import { InventoryHistoryType } from "@/types";

type UseStockHistoryActionsProps = {
  branchId: string;
  setDeletingId: (id: string | null) => void;
  setOpenDropdownId: (id: string | null) => void;
  onDeleteRequest: (inventory: InventoryHistoryType) => void;
};

export const useStockHistoryActions = ({
  branchId,
  setDeletingId,
  setOpenDropdownId,
  onDeleteRequest,
}: UseStockHistoryActionsProps) => {
  const router = useRouter();
  const {
    startDate,
    endDate,
    searchQuery,
    setStockHistory,
    setLoading,
    setPagination,
    page,
    limit,
    setPage,
  } = useStockHistory();

  const refreshStockHistory = useCallback(async () => {
    setLoading(true);
    setPage(1);

    const response = await getInventoryHistory({
      branchId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: searchQuery || undefined,
      page: 1,
      limit,
    });

    if (response.error) {
      console.error("Error fetching stock history:", response.error);
    }

    setStockHistory(response.receipts || []);
    setPagination(response.pagination);
    setLoading(false);
  }, [branchId, startDate, endDate, searchQuery, limit, setStockHistory, setLoading, setPagination, setPage]);

  const searchStockHistory = useCallback(async () => {
    setLoading(true);
    setPage(1);

    const response = await getInventoryHistory({
      branchId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: searchQuery || undefined,
      page: 1,
      limit,
    });

    if (response.error) {
      console.error("Error searching stock history:", response.error);
    }

    setStockHistory(response.receipts);
    setPagination(response.pagination);
    setLoading(false);
  }, [branchId, startDate, endDate, searchQuery, limit, setStockHistory, setLoading, setPagination, setPage]);

  const loadPage = useCallback(async (newPage: number) => {
    setLoading(true);
    setPage(newPage);

    const response = await getInventoryHistory({
      branchId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: searchQuery || undefined,
      page: newPage,
      limit,
    });

    if (response.error) {
      console.error("Error loading page:", response.error);
    }

    setStockHistory(response.receipts);
    setPagination(response.pagination);
    setLoading(false);
  }, [branchId, startDate, endDate, searchQuery, limit, setStockHistory, setLoading, setPagination, setPage]);

  const handleEditInventory = useCallback(
    (inventory: InventoryHistoryType) => {
      router.push(`/${branchId}/menu/receive-stock?inventoryId=${inventory._id}`);
    },
    [router, branchId]
  );

  const handleDeleteInventory = useCallback(
    (inventory: InventoryHistoryType) => {
      onDeleteRequest(inventory);
    },
    [onDeleteRequest]
  );

  const confirmDeleteInventory = useCallback(
    async (
      inventory: InventoryHistoryType,
      onSuccess: () => void,
      onError: () => void
    ) => {
      if (!inventory._id) return;

      setDeletingId(inventory._id);

      const response = await deleteInventory(inventory._id, branchId);

      if (response.success) {
        onSuccess();
        refreshStockHistory();
      } else {
        onError();
      }

      setDeletingId(null);
      setOpenDropdownId(null);
    },
    [branchId, setDeletingId, setOpenDropdownId, refreshStockHistory]
  );

  return {
    refreshStockHistory,
    searchStockHistory,
    loadPage,
    handleEditInventory,
    handleDeleteInventory,
    confirmDeleteInventory,
  };
};
