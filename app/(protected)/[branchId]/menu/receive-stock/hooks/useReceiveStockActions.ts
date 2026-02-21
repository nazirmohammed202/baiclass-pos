"use client";

import { useCallback, useState } from "react";
import { BranchType, InventoryHistoryType, Product, ReceiveStockItem, ReceiveStockTab, SupplierType } from "@/types";
import { useToast } from "@/context/toastContext";
import { getTodayDate } from "@/lib/date-utils";
import { createReceiveStock, getInventoryById, updateInventory } from "@/lib/inventory-actions";
import { ReceiveStockSettings } from "./useReceiveStockSettings";

type UseReceiveStockActionsProps = {
  tabs: ReceiveStockTab[];
  setTabs: (tabs: ReceiveStockTab[] | ((prev: ReceiveStockTab[]) => ReceiveStockTab[])) => void;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  branchId: string;
  showEditOnClick: boolean;
  setPendingProduct: (
    product: {
      product: Product;
      stockItem: Product | undefined;
    } | null
  ) => void;
  branchSettings?: BranchType["settings"];
  priceSettings: Pick<ReceiveStockSettings, "autoCalcWholesale" | "autoCalcRetail" | "roundWholesale" | "roundRetail">;
  productsData: Product[];
  suppliersData: SupplierType[];
};

// Helper function to calculate prices
export const calculateDerivedPrices = (
  basePrice: number,
  branchSettings: BranchType["settings"] | undefined,
  priceSettings: Pick<ReceiveStockSettings, "autoCalcWholesale" | "autoCalcRetail" | "roundWholesale" | "roundRetail">
): { wholesalePrice: number | undefined; retailPrice: number | undefined } => {
  let wholesalePrice: number | undefined;
  let retailPrice: number | undefined;

  if (branchSettings) {
    // Calculate wholesale price if enabled
    if (branchSettings.wholesaleEnabled && priceSettings.autoCalcWholesale) {
      const wholesalePercentage = branchSettings.wholesalePricePercentage || 0;
      wholesalePrice = basePrice * (1 + wholesalePercentage);
      if (priceSettings.roundWholesale || branchSettings.roundWholesalePrices) {
        wholesalePrice = Math.round(wholesalePrice);
      } else {
        wholesalePrice = Math.round(wholesalePrice * 100) / 100;
      }
    }

    // Calculate retail price if enabled
    if (branchSettings.retailEnabled && priceSettings.autoCalcRetail) {
      const retailPercentage = branchSettings.retailPricePercentage || 0;
      retailPrice = basePrice * (1 + retailPercentage);
      if (priceSettings.roundRetail || branchSettings.roundRetailPrices) {
        retailPrice = Math.round(retailPrice);
      } else {
        retailPrice = Math.round(retailPrice * 100) / 100;
      }
    }
  }

  return { wholesalePrice, retailPrice };
};

export const useReceiveStockActions = ({
  tabs,
  setTabs,
  activeTabId,
  setActiveTabId,
  branchId,
  showEditOnClick,
  setPendingProduct,
  branchSettings,
  priceSettings,
  productsData,
  suppliersData,
}: UseReceiveStockActionsProps) => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadedInventoryIds, setLoadedInventoryIds] = useState<Set<string>>(new Set());

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  // Helper function to convert inventory products to receive stock items
  const convertInventoryProductsToItems = useCallback(
    (inventoryProducts: InventoryHistoryType["products"]): ReceiveStockItem[] => {
      return inventoryProducts
        .map((item) => {
          // Handle both string (ObjectId) and object (populated) product
          let productId: string | undefined;

          if (typeof item.product === "string") {
            productId = item.product;
          } else if (item.product && typeof item.product === "object") {
            const populatedProduct = item.product as {
              _id?: string;
              details?: { _id?: string };
            };
            productId = populatedProduct._id || populatedProduct.details?._id;
          }

          if (!productId) {
            console.warn("Could not extract product ID from inventory item:", item);
            return null;
          }

          // Find product in productsData
          const product = productsData.find(
            (p) => p.details._id === productId || p._id === productId
          );

          if (!product) {
            console.warn(`Product not found in productsData for ID: ${productId}`);
            return null;
          }

          return {
            product,
            quantity: item.quantity,
            unitPrice: item.basePrice,
            wholesalePrice: item.wholesalePrice,
            retailPrice: item.retailPrice,
            creditPrice: (item as { creditPrice?: number }).creditPrice,
            discount: item.discount,
            isPriceManuallyEdited: true,
            isWholesalePriceManuallyEdited: !!item.wholesalePrice,
            isRetailPriceManuallyEdited: !!item.retailPrice,
            isCreditPriceManuallyEdited: !!(item as { creditPrice?: number }).creditPrice,
          } as ReceiveStockItem;
        })
        .filter((item): item is ReceiveStockItem => item !== null);
    },
    [productsData]
  );

  // Load inventory and create/edit tab
  const loadInventory = useCallback(
    async (inventoryId: string) => {
      // Check if inventory is already loaded
      if (loadedInventoryIds.has(inventoryId)) {
        const existingTab = tabs.find((tab) => tab.inventoryId === inventoryId);
        if (existingTab) {
          setActiveTabId(existingTab.id);
          return { success: true };
        }
      }

      // Check if inventory is already in tabs (for re-activation)
      const inventoryAlreadyLoaded = tabs.some((tab) => tab.inventoryId === inventoryId);
      if (inventoryAlreadyLoaded) {
        const existingTab = tabs.find((tab) => tab.inventoryId === inventoryId);
        if (existingTab) {
          setActiveTabId(existingTab.id);
          setLoadedInventoryIds((prev) => new Set(prev).add(inventoryId));
          return { success: true };
        }
      }

      setLoadingInventory(true);

      try {
        const response = await getInventoryById(inventoryId);

        if (!response.success || !response.inventory) {
          toastError(response.error ?? "Failed to load inventory");
          setLoadingInventory(false);
          return { success: false };
        }

        const inventory = response.inventory;

        // Convert inventory products to receive stock items
        const items = convertInventoryProductsToItems(inventory.products);

        // Find supplier in suppliersData
        let supplier: SupplierType | null = null;
        if (inventory.supplier) {
          const supplierId = typeof inventory.supplier === "string"
            ? inventory.supplier
            : inventory.supplier._id;
          supplier = suppliersData.find((s) => s._id === supplierId) || null;
        }

        // Create new tab with inventory data
        const editTab: ReceiveStockTab = {
          id: Date.now().toString(),
          supplier,
          items,
          paymentType: inventory.paymentType || "cash",
          receiveDate: inventory.invoiceDate?.split("T")[0] || getTodayDate(),
          discountType: inventory.discountType || null,
          discountValue: inventory.discountValue || 0,
          isEditMode: true,
          inventoryId: inventory._id,
        };

        // Add the edit tab and set it as active
        const newTabs = [...tabs, editTab];
        setTabs(newTabs);
        setLoadedInventoryIds((prev) => new Set(prev).add(inventoryId));
        setLoadingInventory(false);

        return { success: true };
      } catch (error) {
        console.error("Error loading inventory:", error);
        toastError("Failed to load inventory");
        setLoadingInventory(false);
        return { success: false };
      }
    },
    [
      tabs,
      setTabs,
      setActiveTabId,
      toastError,
      loadedInventoryIds,
      convertInventoryProductsToItems,
      suppliersData,
    ]
  );

  const handleAddTab = useCallback(() => {
    const newTab: ReceiveStockTab = {
      id: Date.now().toString(),
      supplier: null,
      items: [],
      paymentType: "cash",
      receiveDate: getTodayDate(),
      discountType: null,
      discountValue: 0,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs, setTabs, setActiveTabId]);

  const handleCloseTab = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (tabs.length === 1) return;
      const newTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(newTabs);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
    },
    [tabs, activeTabId, setTabs, setActiveTabId]
  );

  const handleSupplierChange = useCallback(
    (supplier: SupplierType | null) => {
      setTabs(
        tabs.map((tab) => (tab.id === activeTabId ? { ...tab, supplier } : tab))
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handleDateChange = useCallback(
    (receiveDate: string) => {
      setTabs(
        tabs.map((tab) => (tab.id === activeTabId ? { ...tab, receiveDate } : tab))
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const addProductToItems = useCallback(
    (
      product: Product,
      stockItem: Product | undefined,
      quantity: number,
      unitPrice?: number,
      wholesalePrice?: number,
      retailPrice?: number
    ) => {
      setTabs(
        tabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          // Use basePrice for receive stock
          const finalUnitPrice =
            unitPrice !== undefined
              ? unitPrice
              : stockItem?.basePrice ?? product.basePrice ?? 0;

          // Calculate derived prices if not manually provided
          const derivedPrices = calculateDerivedPrices(finalUnitPrice, branchSettings, priceSettings);

          return {
            ...tab,
            items: [
              ...tab.items,
              {
                product,
                quantity,
                unitPrice: finalUnitPrice,
                wholesalePrice: wholesalePrice ?? derivedPrices.wholesalePrice,
                retailPrice: retailPrice ?? derivedPrices.retailPrice,
                isPriceManuallyEdited: unitPrice !== undefined,
                isWholesalePriceManuallyEdited: wholesalePrice !== undefined,
                isRetailPriceManuallyEdited: retailPrice !== undefined,
              },
            ],
          };
        })
      );
    },
    [tabs, activeTabId, setTabs, branchSettings, priceSettings]
  );

  const handleProductSelect = useCallback(
    (product: Product, stockItem: Product | undefined) => {
      if (showEditOnClick) {
        setPendingProduct({ product, stockItem });
        return;
      }
      addProductToItems(product, stockItem, 1);
    },
    [showEditOnClick, setPendingProduct, addProductToItems]
  );

  const createPendingProductSaveHandler = useCallback(
    (
      pendingProduct: {
        product: Product;
        stockItem: Product | undefined;
      } | null
    ) => {
      return (quantity: number, unitPrice: number) => {
        if (!pendingProduct) return;

        addProductToItems(
          pendingProduct.product,
          pendingProduct.stockItem,
          quantity,
          unitPrice === 0 ? undefined : unitPrice
        );

        setPendingProduct(null);
      };
    },
    [addProductToItems, setPendingProduct]
  );

  const handleUpdateQuantity = useCallback(
    (index: number, newQuantity: number) => {
      if (newQuantity <= 0) return;
      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId
            ? {
              ...tab,
              items: tab.items.map((item, i) =>
                i === index ? { ...item, quantity: newQuantity } : item
              ),
            }
            : tab
        )
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handleRemoveProduct = useCallback(
    (index: number) => {
      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId
            ? {
              ...tab,
              items: tab.items.filter((_, i) => i !== index),
            }
            : tab
        )
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handlePaymentTypeChange = useCallback(
    (newPaymentType: "cash" | "credit") => {
      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId ? { ...tab, paymentType: newPaymentType } : tab
        )
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handleUpdateItem = useCallback(
    (
      index: number,
      quantity: number,
      unitPrice: number,
      discount?: number,
      wholesalePrice?: number,
      retailPrice?: number,
      creditPrice?: number,
      recalculatePrices?: boolean
    ) => {
      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId
            ? {
              ...tab,
              items: tab.items.map((item, i) => {
                if (i !== index) return item;

                // If recalculating prices (base price changed and user wants auto-calc)
                let finalWholesalePrice = wholesalePrice;
                let finalRetailPrice = retailPrice;
                let isWholesaleManual = item.isWholesalePriceManuallyEdited;
                let isRetailManual = item.isRetailPriceManuallyEdited;
                let isCreditManual = item.isCreditPriceManuallyEdited ?? false;

                if (recalculatePrices) {
                  const derivedPrices = calculateDerivedPrices(unitPrice, branchSettings, priceSettings);
                  // Only recalculate if not manually edited
                  if (!item.isWholesalePriceManuallyEdited) {
                    finalWholesalePrice = derivedPrices.wholesalePrice;
                  }
                  if (!item.isRetailPriceManuallyEdited) {
                    finalRetailPrice = derivedPrices.retailPrice;
                  }
                }

                // If wholesale/retail/credit price explicitly provided, mark as manually edited
                if (wholesalePrice !== undefined) {
                  isWholesaleManual = true;
                }
                if (retailPrice !== undefined) {
                  isRetailManual = true;
                }
                if (creditPrice !== undefined) {
                  isCreditManual = true;
                }

                return {
                  ...item,
                  quantity,
                  unitPrice,
                  isPriceManuallyEdited: true,
                  discount: discount ?? item.discount,
                  wholesalePrice: finalWholesalePrice ?? item.wholesalePrice,
                  retailPrice: finalRetailPrice ?? item.retailPrice,
                  creditPrice: creditPrice ?? item.creditPrice,
                  isWholesalePriceManuallyEdited: isWholesaleManual,
                  isRetailPriceManuallyEdited: isRetailManual,
                  isCreditPriceManuallyEdited: isCreditManual,
                };
              }),
            }
            : tab
        )
      );
    },
    [tabs, activeTabId, setTabs, branchSettings, priceSettings]
  );

  const handleInvoiceDiscountChange = useCallback(
    (discountType: "percentage" | "fixed" | null, discountValue: number) => {
      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId
            ? { ...tab, discountType, discountValue }
            : tab
        )
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handleSaveReceiveStock = useCallback(
    async (
      supplier: SupplierType | null,
      items: ReceiveStockItem[],
      total: number,
      paymentMethod: "cash" | "momo"
    ) => {
      if (activeTab.paymentType === "credit" && !supplier) {
        toastError("Please select a supplier for credit purchases");
        return;
      }

      if (!activeTab.receiveDate) {
        toastError("Please select a receive date");
        return;
      }

      try {
        setSaving(true);

        // Check if we're updating an existing inventory
        const isEditMode = activeTab.isEditMode && activeTab.inventoryId;

        const payload = {
          products: items.map((item) => {
            const itemDiscount = item.discount ?? 0;
            const rawTotal = item.unitPrice * item.quantity;
            const discountedTotal = rawTotal * (1 - itemDiscount / 100);
            return {
              product: item.product.details._id,
              quantity: item.quantity,
              basePrice: item.unitPrice,
              wholesalePrice: item.wholesalePrice,
              retailPrice: item.retailPrice,
              creditPrice: item.creditPrice,
              discount: item.discount,
              total: parseFloat(discountedTotal.toFixed(2)),
            };
          }),
          branch: branchId,
          supplier: supplier?._id,
          totalCost: parseFloat(total.toFixed(2)),
          invoiceDate: activeTab.receiveDate,
          paymentType: activeTab.paymentType,
          paymentMethod,
          discountType: activeTab.discountType ?? "percentage",
          discountValue: activeTab.discountValue,
        };

        const response = isEditMode
          ? await updateInventory(activeTab.inventoryId as string, payload, branchId)
          : await createReceiveStock(payload, branchId);

        setSaving(false);

        if (response.success) {
          toastSuccess(
            isEditMode
              ? "Stock receipt updated successfully"
              : "Stock received successfully"
          );

          // Clear the active tab after successful save
          setTabs((prevTabs) =>
            prevTabs.map((tab) =>
              tab.id === activeTabId
                ? {
                  ...tab,
                  items: [],
                  supplier: null,
                  paymentType: "cash",
                  receiveDate: getTodayDate(),
                  discountType: null,
                  discountValue: 0,
                  isEditMode: false,
                  inventoryId: undefined,
                }
                : tab
            )
          );
        } else {
          toastError(
            response.error ??
            (isEditMode ? "Failed to update stock receipt" : "Failed to save stock receipt")
          );
        }
      } catch (error) {
        setSaving(false);
        toastError("Failed to save stock receipt");
        console.error(error);
      }
    },
    [activeTab, branchId, activeTabId, setTabs, toastError, toastSuccess]
  );

  return {
    handleAddTab,
    handleCloseTab,
    handleSupplierChange,
    handleDateChange,
    handleProductSelect,
    addProductToItems,
    createPendingProductSaveHandler,
    handleUpdateQuantity,
    handleRemoveProduct,
    handleSaveReceiveStock,
    handlePaymentTypeChange,
    handleUpdateItem,
    handleInvoiceDiscountChange,
    loadInventory,
    saving,
    loadingInventory,
    activeTab,
  };
};
