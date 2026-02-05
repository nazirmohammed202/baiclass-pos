"use client";

import { useEffect } from "react";
import { useStock } from "@/context/stockContext";
import { ReceiveStockTab } from "@/types";

type StockPriceUpdaterProps = {
  setTabs: (tabs: ReceiveStockTab[] | ((prev: ReceiveStockTab[]) => ReceiveStockTab[])) => void;
  activeTabId: string;
};

const StockPriceUpdater = ({ setTabs, activeTabId }: StockPriceUpdaterProps) => {
  const { stockMap, isStockLoading } = useStock();

  useEffect(() => {
    if (isStockLoading || stockMap.size === 0) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;

        const updatedItems = tab.items.map((item) => {
          // Skip items with manually edited prices
          if (item.isPriceManuallyEdited) return item;

          const stockItem = stockMap.get(item.product.details._id);
          if (!stockItem) return item;

          // Use basePrice for receive stock
          const newPrice = stockItem.basePrice ?? item.product.basePrice ?? 0;

          // Only update if price changed and was 0 (initial load)
          if (item.unitPrice === 0 && newPrice !== 0) {
            return { ...item, unitPrice: newPrice };
          }

          return item;
        });

        return { ...tab, items: updatedItems };
      })
    );
  }, [stockMap, isStockLoading, setTabs, activeTabId]);

  return null;
};

export default StockPriceUpdater;
