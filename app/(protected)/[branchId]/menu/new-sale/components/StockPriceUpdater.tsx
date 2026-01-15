"use client";

import { useEffect } from "react";
import { useStock } from "@/context/stockContext";
import { Tab } from "@/types";

type StockPriceUpdaterProps = {
  setTabs: (tabs: Tab[] | ((prev: Tab[]) => Tab[])) => void;
  activeTabId: string;
  priceType: "retail" | "wholesale";
};

const StockPriceUpdater = ({
  setTabs,
  activeTabId,
  priceType,
}: StockPriceUpdaterProps) => {
  const { stockMap } = useStock();

  useEffect(() => {
    // Only update if stockMap has data
    if (stockMap.size === 0) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;

        const updatedProducts = tab.products.map((item) => {
          // Skip if price was manually edited
          if (item.isPriceManuallyEdited) return item;

          // Get stock item for this product
          const stockItem = stockMap.get(item.product.details._id);
          if (!stockItem) return item;

          // Calculate new price based on priceType
          const newPrice =
            priceType === "wholesale"
              ? stockItem.wholesalePrice ??
                stockItem.basePrice ??
                item.product.wholesalePrice ??
                item.product.basePrice ??
                0
              : stockItem.retailPrice ??
                stockItem.basePrice ??
                item.product.retailPrice ??
                item.product.basePrice ??
                0;

          // Only update if price changed and is not 0
          if (newPrice > 0 && newPrice !== item.unitPrice) {
            return { ...item, unitPrice: newPrice };
          }

          return item;
        });

        return { ...tab, products: updatedProducts };
      })
    );
  }, [stockMap, activeTabId, priceType, setTabs]);

  return null;
};

export default StockPriceUpdater;
