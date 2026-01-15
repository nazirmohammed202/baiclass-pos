"use client";

import { useState, useEffect, useTransition, useRef } from "react";

export const useSaleSettingsPersistence = (branchId: string) => {
  const SHOW_EDIT_ON_CLICK_KEY = `showEditOnClick-${branchId}`;
  const SHOW_PRICE_TYPE_SWITCH_KEY = `showPriceTypeSwitch-${branchId}`;
  const SHOW_SALES_TYPE_SWITCH_KEY = `showSalesTypeSwitch-${branchId}`;

  // Initialize with default values to avoid hydration mismatch
  const [showEditOnClick, setShowEditOnClick] = useState(false);
  const [showPriceTypeSwitch, setShowPriceTypeSwitch] = useState(true);
  const [showSalesTypeSwitch, setShowSalesTypeSwitch] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [, startTransition] = useTransition();
  const hasLoadedRef = useRef(false);

  // Load settings from localStorage after hydration (client-side only)
  useEffect(() => {
    if (typeof window === "undefined" || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      const storedEditOnClick = localStorage.getItem(SHOW_EDIT_ON_CLICK_KEY);
      const storedPriceTypeSwitch = localStorage.getItem(
        SHOW_PRICE_TYPE_SWITCH_KEY
      );
      const storedSalesTypeSwitch = localStorage.getItem(
        SHOW_SALES_TYPE_SWITCH_KEY
      );

      startTransition(() => {
        if (storedEditOnClick !== null) {
          setShowEditOnClick(storedEditOnClick === "true");
        }
        if (storedPriceTypeSwitch !== null) {
          setShowPriceTypeSwitch(storedPriceTypeSwitch !== "false");
        }
        if (storedSalesTypeSwitch !== null) {
          setShowSalesTypeSwitch(storedSalesTypeSwitch !== "false");
        }
        setIsHydrated(true);
      });
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
      startTransition(() => {
        setIsHydrated(true);
      });
    }
  }, [
    branchId,
    SHOW_EDIT_ON_CLICK_KEY,
    SHOW_PRICE_TYPE_SWITCH_KEY,
    SHOW_SALES_TYPE_SWITCH_KEY,
    startTransition,
  ]);

  // Save showEditOnClick to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      localStorage.setItem(SHOW_EDIT_ON_CLICK_KEY, showEditOnClick.toString());
    } catch (error) {
      console.error("Error saving showEditOnClick setting:", error);
    }
  }, [showEditOnClick, SHOW_EDIT_ON_CLICK_KEY, isHydrated]);

  // Save showPriceTypeSwitch to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      localStorage.setItem(
        SHOW_PRICE_TYPE_SWITCH_KEY,
        showPriceTypeSwitch.toString()
      );
    } catch (error) {
      console.error("Error saving showPriceTypeSwitch setting:", error);
    }
  }, [showPriceTypeSwitch, SHOW_PRICE_TYPE_SWITCH_KEY, isHydrated]);

  // Save showSalesTypeSwitch to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      localStorage.setItem(
        SHOW_SALES_TYPE_SWITCH_KEY,
        showSalesTypeSwitch.toString()
      );
    } catch (error) {
      console.error("Error saving showSalesTypeSwitch setting:", error);
    }
  }, [showSalesTypeSwitch, SHOW_SALES_TYPE_SWITCH_KEY, isHydrated]);

  return {
    showEditOnClick,
    setShowEditOnClick,
    showPriceTypeSwitch,
    setShowPriceTypeSwitch,
    showSalesTypeSwitch,
    setShowSalesTypeSwitch,
  };
};
