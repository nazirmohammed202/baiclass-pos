"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Product, ReceiveStockItem, ReceiveStockTab, SupplierType } from "@/types";
import { getTodayDate } from "@/lib/date-utils";

type StoredTab = {
  id: string;
  supplier: SupplierType | null;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    wholesalePrice?: number;
    retailPrice?: number;
    creditPrice?: number;
    discount?: number;
    isWholesalePriceManuallyEdited?: boolean;
    isRetailPriceManuallyEdited?: boolean;
    isCreditPriceManuallyEdited?: boolean;
  }>;
  paymentType: "cash" | "credit";
  receiveDate: string;
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
};

export const useReceiveStockPersistence = (
  branchId: string,
  productsData: Product[]
) => {
  const STORAGE_KEY = `receiveStockTabs-${branchId}`;
  const ACTIVE_TAB_KEY = `receiveStockActiveTabId-${branchId}`;

  const [tabs, setTabs] = useState<ReceiveStockTab[]>([
    {
      id: "1",
      supplier: null,
      items: [],
      paymentType: "cash",
      receiveDate: getTodayDate(),
      discountType: null,
      discountValue: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [isHydrated, setIsHydrated] = useState(false);
  const [, startTransition] = useTransition();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      const storedTabs = localStorage.getItem(STORAGE_KEY);
      if (storedTabs) {
        const parsed = JSON.parse(storedTabs) as StoredTab[];

        const loadedTabs: ReceiveStockTab[] = parsed.map((tab) => ({
          id: tab.id,
          supplier: tab.supplier,
          paymentType: tab.paymentType || "cash",
          receiveDate: tab.receiveDate || getTodayDate(),
          discountType: tab.discountType ?? null,
          discountValue: tab.discountValue ?? 0,
          items: tab.items
            .map((item) => {
              const product = productsData.find(
                (p) => p.details._id === item.productId
              );
              return product
                ? ({
                    product,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || 0,
                    wholesalePrice: item.wholesalePrice,
                    retailPrice: item.retailPrice,
                    creditPrice: item.creditPrice,
                    isPriceManuallyEdited: false,
                    isWholesalePriceManuallyEdited: item.isWholesalePriceManuallyEdited ?? false,
                    isRetailPriceManuallyEdited: item.isRetailPriceManuallyEdited ?? false,
                    isCreditPriceManuallyEdited: item.isCreditPriceManuallyEdited ?? false,
                    discount: item.discount ?? 0,
                  } as ReceiveStockItem)
                : null;
            })
            .filter((item): item is ReceiveStockItem => item !== null),
        }));

        if (loadedTabs.length > 0) {
          startTransition(() => {
            setTabs(loadedTabs);
          });
        }
      }

      const storedActiveTab = localStorage.getItem(ACTIVE_TAB_KEY);
      if (storedActiveTab) {
        startTransition(() => {
          setActiveTabId(storedActiveTab);
        });
      }

      startTransition(() => {
        setIsHydrated(true);
      });
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      startTransition(() => {
        setIsHydrated(true);
      });
    }
  }, [STORAGE_KEY, ACTIVE_TAB_KEY, productsData, startTransition]);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      const dataToStore: StoredTab[] = tabs.map((tab) => ({
        id: tab.id,
        supplier: tab.supplier,
        paymentType: tab.paymentType,
        receiveDate: tab.receiveDate,
        discountType: tab.discountType,
        discountValue: tab.discountValue,
        items: tab.items.map((item) => ({
          productId: item.product.details._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          wholesalePrice: item.wholesalePrice,
          retailPrice: item.retailPrice,
          creditPrice: item.creditPrice,
          discount: item.discount,
          isWholesalePriceManuallyEdited: item.isWholesalePriceManuallyEdited,
          isRetailPriceManuallyEdited: item.isRetailPriceManuallyEdited,
          isCreditPriceManuallyEdited: item.isCreditPriceManuallyEdited,
        })),
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error saving tabs to localStorage:", error);
    }
  }, [tabs, STORAGE_KEY, isHydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
    } catch (error) {
      console.error("Error saving active tab to localStorage:", error);
    }
  }, [activeTabId, ACTIVE_TAB_KEY, isHydrated]);

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    isHydrated,
  };
};
