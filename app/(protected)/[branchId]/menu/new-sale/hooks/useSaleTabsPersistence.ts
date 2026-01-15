"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { CartItem, CustomerType, Product, Tab } from "@/types";

type StoredTab = {
  id: string;
  customer: CustomerType | null;
  products: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  priceType: "retail" | "wholesale";
  salesType?: "cash" | "credit";
  saleId: string | undefined | null;
  isEditMode: boolean | undefined;
};

export const useSaleTabsPersistence = (
  branchId: string,
  productsData: Product[]
) => {
  const STORAGE_KEY = `saleTabs-${branchId}`;
  const ACTIVE_TAB_KEY = `activeTabId-${branchId}`;

  // Start with default values to avoid hydration mismatch
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "1",
      customer: null,
      products: [],
      priceType: "retail",
      salesType: "cash",
      saleId: undefined,
      isEditMode: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [isHydrated, setIsHydrated] = useState(false);
  const [, startTransition] = useTransition();
  const hasLoadedRef = useRef(false);

  // Load from localStorage after hydration (client-side only)
  useEffect(() => {
    if (typeof window === "undefined" || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      // Load tabs
      const storedTabs = localStorage.getItem(STORAGE_KEY);
      if (storedTabs) {
        const parsed = JSON.parse(storedTabs) as StoredTab[];

        // Convert stored product IDs to actual Product objects
        const loadedTabs: Tab[] = parsed.map((tab) => ({
          id: tab.id,
          customer: tab.customer,
          priceType: tab.priceType || "retail", // Default to retail for backward compatibility
          salesType: tab.salesType || "cash", // Default to cash for backward compatibility
          products: tab.products
            .map((item) => {
              const product = productsData.find(
                (p) => p.details._id === item.productId
              );
              return product
                ? ({
                    product,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || 0, // Default to 0 if not stored
                    isPriceManuallyEdited: false, // Default to false for backward compatibility
                  } as CartItem)
                : null;
            })
            .filter((item): item is CartItem => item !== null),
          saleId: tab.saleId,
          isEditMode: tab.isEditMode,
        }));

        if (loadedTabs.length > 0) {
          startTransition(() => {
            setTabs(loadedTabs);
          });
        }
      }

      // Load active tab ID
      const storedActiveTab = localStorage.getItem(ACTIVE_TAB_KEY);
      if (storedActiveTab) {
        startTransition(() => {
          setActiveTabId(storedActiveTab);
        });
      }

      // Mark as hydrated - this is necessary to enable saving to localStorage
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

  // Save tabs to localStorage whenever they change (only after hydration)
  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      // Store minimal data: product IDs instead of full Product objects
      const dataToStore: StoredTab[] = tabs.map((tab) => ({
        id: tab.id,
        customer: tab.customer,
        priceType: tab.priceType,
        salesType: tab.salesType,
        products: tab.products.map((item) => ({
          productId: item.product.details._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        saleId: tab.saleId,
        isEditMode: tab.isEditMode,
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error saving tabs to localStorage:", error);
    }
  }, [tabs, STORAGE_KEY, isHydrated]);

  // Save active tab ID to localStorage whenever it changes (only after hydration)
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
