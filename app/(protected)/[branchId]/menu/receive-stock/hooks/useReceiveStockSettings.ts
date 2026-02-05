"use client";

import { useState, useEffect, useTransition, useRef } from "react";

export type ReceiveStockSettings = {
  showEditOnClick: boolean;
  showPaymentTypeSwitch: boolean;
  autoCalcWholesale: boolean;
  autoCalcRetail: boolean;
  roundWholesale: boolean;
  roundRetail: boolean;
};

export const useReceiveStockSettings = (branchId: string) => {
  const STORAGE_KEY = `receiveStock-settings-${branchId}`;

  const [settings, setSettings] = useState<ReceiveStockSettings>({
    showEditOnClick: false,
    showPaymentTypeSwitch: true,
    autoCalcWholesale: true,
    autoCalcRetail: true,
    roundWholesale: false,
    roundRetail: false,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [, startTransition] = useTransition();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        startTransition(() => {
          setSettings((prev) => ({
            ...prev,
            ...parsed,
          }));
          setIsHydrated(true);
        });
      } else {
        startTransition(() => {
          setIsHydrated(true);
        });
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
      startTransition(() => {
        setIsHydrated(true);
      });
    }
  }, [STORAGE_KEY, startTransition]);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }, [settings, STORAGE_KEY, isHydrated]);

  const updateSetting = <K extends keyof ReceiveStockSettings>(
    key: K,
    value: ReceiveStockSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    updateSetting,
    // Convenience accessors for backward compatibility
    showEditOnClick: settings.showEditOnClick,
    setShowEditOnClick: (value: boolean) => updateSetting("showEditOnClick", value),
    showPaymentTypeSwitch: settings.showPaymentTypeSwitch,
    setShowPaymentTypeSwitch: (value: boolean) => updateSetting("showPaymentTypeSwitch", value),
    autoCalcWholesale: settings.autoCalcWholesale,
    setAutoCalcWholesale: (value: boolean) => updateSetting("autoCalcWholesale", value),
    autoCalcRetail: settings.autoCalcRetail,
    setAutoCalcRetail: (value: boolean) => updateSetting("autoCalcRetail", value),
    roundWholesale: settings.roundWholesale,
    setRoundWholesale: (value: boolean) => updateSetting("roundWholesale", value),
    roundRetail: settings.roundRetail,
    setRoundRetail: (value: boolean) => updateSetting("roundRetail", value),
  };
};
