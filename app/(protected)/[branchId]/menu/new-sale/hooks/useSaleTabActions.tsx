"use client";

import { useCallback, useState } from "react";
import {
  CartItem,
  CustomerType,
  PriceType,
  Product,
  SalePopulatedType,
  SaleType,
  Tab,
} from "@/types";
import {
  createNewSale,
  createCustomDateSale,
  getSaleById,
  updateSale,
} from "@/lib/sale-actions";
import { useToast } from "@/context/toastContext";
import { handleError } from "@/utils/errorHandlers";

type UseSaleTabsActionsProps = {
  tabs: Tab[];
  setTabs: (tabs: Tab[] | ((prev: Tab[]) => Tab[])) => void;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  branchId: string;
  account: { _id: string } | null;
  company: { _id: string } | null;
  showEditOnClick: boolean;
  setPendingProduct: (
    product: {
      product: Product;
      stockItem: Product | undefined;
      priceType: PriceType;
    } | null
  ) => void;
  productsData: Product[];
  customers: Promise<CustomerType[]>;
};

export const useSaleTabsActions = ({
  tabs,
  setTabs,
  activeTabId,
  setActiveTabId,
  branchId,
  account,
  company,
  showEditOnClick,
  setPendingProduct,
  productsData,
}: UseSaleTabsActionsProps) => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [savingSale, setSavingSale] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
  const [loadedSaleIds, setLoadedSaleIds] = useState<Set<string>>(new Set());

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  // Helper function to convert sale products to cart items
  const convertSaleProductsToCartItems = useCallback(
    (saleProducts: SalePopulatedType["products"]): CartItem[] => {
      return saleProducts
        .map((item) => {
          // Handle both string (ObjectId) and object (populated) product
          let productId: string | undefined;

          if (typeof item.product === "string") {
            productId = item.product;
          } else if (item.product && typeof item.product === "object") {
            // Product is populated - get _id from various possible structures
            const populatedProduct = item.product as {
              _id?: string;
              details?: { _id?: string };
              product?: { _id?: string };
            };
            productId =
              populatedProduct._id ||
              populatedProduct.details?._id ||
              populatedProduct.product?._id;
          }

          if (!productId) {
            console.warn("Could not extract product ID from sale item:", item);
            return null;
          }

          // Find product in productsData
          const product = productsData.find(
            (p) => p.details._id === productId || p._id === productId
          );

          if (!product) {
            console.warn(
              `Product not found in productsData for ID: ${productId}`
            );
            return null;
          }

          return {
            product,
            quantity: item.quantity,
            unitPrice: item.price,
            isPriceManuallyEdited: true, // Mark as manually edited since it's from a saved sale
          } as CartItem;
        })
        .filter((item): item is CartItem => item !== null);
    },
    [productsData]
  );

  // Load sale and create/edit tab
  const loadSale = useCallback(
    async (saleId: string) => {
      // Check if sale is already loaded
      if (loadedSaleIds.has(saleId)) {
        const existingTab = tabs.find((tab) => tab.saleId === saleId);
        if (existingTab) {
          setActiveTabId(existingTab.id);
          return { success: true };
        }
      }

      // Check if sale is already in tabs (for re-activation)
      const saleAlreadyLoaded = tabs.some((tab) => tab.saleId === saleId);
      if (saleAlreadyLoaded) {
        const existingTab = tabs.find((tab) => tab.saleId === saleId);
        if (existingTab) {
          setActiveTabId(existingTab.id);
          setLoadedSaleIds((prev) => new Set(prev).add(saleId));
          return { success: true };
        }
      }

      setLoadingSale(true);

      try {
        const response = await getSaleById(saleId);

        if (!response.success || !response.sale) {
          toastError(response.error ?? "Failed to load sale");
          setLoadingSale(false);
          return { success: false };
        }

        const sale: SalePopulatedType = response.sale;

        // Convert sale to cart items
        const cartItems = convertSaleProductsToCartItems(sale.products);

        // Create new tab with sale data
        const editTab: Tab = {
          id: Date.now().toString(),
          customer: sale.customer as CustomerType | null,
          priceType: sale.priceMode || "retail",
          salesType: sale.salesType || "cash",
          saleId: sale._id,
          isEditMode: true,
          products: cartItems,
        };

        // Add the edit tab and set it as active
        const newTabs = [...tabs, editTab];
        setTabs(newTabs);
        // setActiveTabId(editTab.id);
        setLoadedSaleIds((prev) => new Set(prev).add(saleId));

        return { success: true };
      } catch (error) {
        console.error("Error loading sale:", error);
        toastError("Failed to load sale");
        return { success: false };
      }
    },
    [
      tabs,
      setTabs,
      setActiveTabId,
      toastError,
      loadedSaleIds,
      convertSaleProductsToCartItems,
    ]
  );

  const handleAddTab = useCallback(
    (customer?: CustomerType | null) => {
      const newTab: Tab = {
        id: Date.now().toString(),
        customer: customer ?? null,
        products: [],
        priceType: "retail",
        salesType: customer ? "credit" : "cash",
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs, setTabs, setActiveTabId]
  );

  const handleCloseTab = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (tabs.length === 1) return; // Don't close the last tab
      const newTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(newTabs);
      // If the closed tab was active, switch to another tab
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
    },
    [tabs, activeTabId, setTabs, setActiveTabId]
  );

  const handleCustomerChange = useCallback(
    (customer: CustomerType | null) => {
      setTabs(
        tabs.map((tab) => (tab.id === activeTabId ? { ...tab, customer } : tab))
      );
    },
    [tabs, activeTabId, setTabs]
  );

  // Helper function to get price based on price type
  const getPriceByType = useCallback(
    (
      product: Product,
      stockItem: Product | undefined,
      priceType: PriceType
    ): number => {
      switch (priceType) {
        case "credit":
          return (
            stockItem?.creditPrice ??
            product.creditPrice ??
            stockItem?.retailPrice ??
            product.retailPrice ??
            product.basePrice ??
            0
          );
        case "wholesale":
          return (
            stockItem?.wholesalePrice ??
            product.wholesalePrice ??
            product.basePrice ??
            0
          );
        case "retail":
        default:
          return (
            stockItem?.retailPrice ??
            product.retailPrice ??
            product.basePrice ??
            0
          );
      }
    },
    []
  );

  const addProductToCart = useCallback(
    (
      product: Product,
      stockItem: Product | undefined,
      priceType: PriceType,
      quantity: number,
      unitPrice?: number
    ) => {
      setTabs(
        tabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          // Get the price based on priceType (use provided unitPrice if available)
          const finalUnitPrice =
            unitPrice !== undefined
              ? unitPrice
              : getPriceByType(product, stockItem, priceType);

          return {
            ...tab,
            products: [
              ...tab.products,
              {
                product,
                quantity,
                unitPrice: finalUnitPrice,
                isPriceManuallyEdited: unitPrice !== undefined,
              },
            ],
          };
        })
      );
    },
    [tabs, activeTabId, setTabs, getPriceByType]
  );

  const handleProductSelect = useCallback(
    (
      product: Product,
      stockItem: Product | undefined,
      priceType: PriceType
    ) => {
      // If showEditOnClick is enabled, show modal instead of adding directly
      if (showEditOnClick) {
        setPendingProduct({ product, stockItem, priceType });
        return;
      }

      // Original behavior: add directly to cart
      addProductToCart(product, stockItem, priceType, 1);
    },
    [showEditOnClick, setPendingProduct, addProductToCart]
  );

  const createPendingProductSaveHandler = useCallback(
    (
      pendingProduct: {
        product: Product;
        stockItem: Product | undefined;
        priceType: PriceType;
      } | null
    ) => {
      return (quantity: number, unitPrice: number) => {
        if (!pendingProduct) return;

        addProductToCart(
          pendingProduct.product,
          pendingProduct.stockItem,
          pendingProduct.priceType,
          quantity,
          unitPrice === 0 ? undefined : unitPrice
        );

        setPendingProduct(null);
      };
    },
    [addProductToCart, setPendingProduct]
  );

  const handleUpdateQuantity = useCallback(
    (index: number, newQuantity: number) => {
      if (newQuantity <= 0) return;
      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId
            ? {
              ...tab,
              products: tab.products.map((item, i) =>
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
              products: tab.products.filter((_, i) => i !== index),
            }
            : tab
        )
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handleSaveSale = useCallback(
    async (
      customer: CustomerType | null,
      cartItems: CartItem[],
      total: number,
      amountPaid: number,
      priceType: PriceType,
      shouldPrint: boolean,
      paymentMethod: "cash" | "momo"
    ) => {
      if (activeTab.salesType === "credit" && !customer) {
        toastError("Please select a customer for credit sales");
        return;
      }
      try {
        setSavingSale(true);

        // Check if we're updating an existing sale
        const isEditMode = activeTab.isEditMode && activeTab.saleId;

        // Check if we have a custom date (and not in edit mode)
        const customDate = activeTab.saleDate;
        const hasCustomDate = customDate && !isEditMode;

        let response;
        if (hasCustomDate && customDate) {
          // Use custom date sale endpoint
          const customDateSale = {
            seller: account ? account._id : "",
            company: company ? company._id : "",
            branch: branchId,
            customer: customer ? customer._id : undefined,
            products: cartItems.map((item) => ({
              product: item.product.details._id,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.unitPrice * item.quantity,
            })),
            date: customDate, // ISO date string (YYYY-MM-DD)
            total: parseFloat(total.toFixed(2)),
            note: "",
            salesType: activeTab.salesType,
            priceMode: priceType,
            paymentMethod: paymentMethod,
          };
          response = await createCustomDateSale(customDateSale, branchId);
        } else {
          // Use regular sale endpoint
          const sale: SaleType = {
            seller: account ? account._id : "",
            company: company ? company._id : "",
            branch: branchId,
            customer: customer ? customer._id : undefined,
            products: cartItems.map((item) => ({
              product: item.product.details._id,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.unitPrice * item.quantity,
            })),
            total: parseFloat(total.toFixed(2)),
            discount: 0,
            paid: amountPaid,
            due: total - amountPaid > 0 ? total - amountPaid : 0,
            paymentMethod:
              paymentMethod,
            note: "",
            salesType: activeTab.salesType,
            priceMode: priceType,
            ...(activeTab.saleDate && { createdAt: activeTab.saleDate }),
          };
          response = isEditMode
            ? await updateSale(activeTab.saleId as string, sale)
            : await createNewSale(sale, branchId);
        }

        setSavingSale(false);
        if (response.success) {
          toastSuccess(
            isEditMode
              ? "Sale updated successfully"
              : "Sale created successfully"
          );

          // Clear the active tab after successful sale
          setTabs((prevTabs) =>
            prevTabs.map((tab) =>
              tab.id === activeTabId
                ? {
                  ...tab,
                  products: [],
                  customer: null,
                  salesType: "cash",
                  isEditMode: false,
                  saleId: undefined,
                  saleDate: undefined,
                }
                : tab
            )
          );

          if (shouldPrint) {
            // TODO: Implement print logic
          }
          return;
        }
        toastError(
          response.error ??
          (isEditMode ? "Failed to update sale" : "Failed to create sale")
        );
      } catch (error) {
        setSavingSale(false);
        toastError(handleError(error));
      }
    },
    [
      activeTab,
      account,
      company,
      branchId,
      activeTabId,
      setTabs,
      toastError,
      toastSuccess,
    ]
  );

  const handleSalesTypeChange = useCallback(
    (newSalesType: "cash" | "credit") => {
      setTabs(
        tabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          // When switching to credit sales type, auto-switch to credit price type
          // and update prices for items that weren't manually edited
          if (newSalesType === "credit" && tab.priceType !== "credit") {
            const updatedProducts = tab.products.map((item) => {
              if (item.isPriceManuallyEdited) return item;

              const newPrice =
                item.product.creditPrice ??
                item.product.retailPrice ??
                item.product.basePrice ??
                0;

              return { ...item, unitPrice: newPrice };
            });

            return {
              ...tab,
              salesType: newSalesType,
              priceType: "credit",
              products: updatedProducts,
            };
          }

          // When switching from credit to cash and priceType is credit,
          // revert to retail prices
          if (newSalesType === "cash" && tab.priceType === "credit") {
            const updatedProducts = tab.products.map((item) => {
              if (item.isPriceManuallyEdited) return item;

              const newPrice =
                item.product.retailPrice ??
                item.product.basePrice ??
                0;

              return { ...item, unitPrice: newPrice };
            });

            return {
              ...tab,
              salesType: newSalesType,
              priceType: "retail",
              products: updatedProducts,
            };
          }

          return { ...tab, salesType: newSalesType };
        })
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handlePriceTypeChange = useCallback(
    (newPriceType: PriceType) => {
      setTabs(
        tabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          // Update prices for items that weren't manually edited when priceType changes
          const updatedProducts = tab.products.map((item) => {
            if (item.isPriceManuallyEdited) return item;

            // Get price from product data based on new price type
            let newPrice: number;
            switch (newPriceType) {
              case "credit":
                newPrice =
                  item.product.creditPrice ??
                  item.product.retailPrice ??
                  item.product.basePrice ??
                  0;
                break;
              case "wholesale":
                newPrice =
                  item.product.wholesalePrice ?? item.product.basePrice ?? 0;
                break;
              case "retail":
              default:
                newPrice =
                  item.product.retailPrice ?? item.product.basePrice ?? 0;
            }

            return { ...item, unitPrice: newPrice };
          });

          return { ...tab, priceType: newPriceType, products: updatedProducts };
        })
      );
    },
    [tabs, activeTabId, setTabs]
  );

  const handleUpdateItem = useCallback(
    (index: number, quantity: number, unitPrice: number) => {
      setTabs(
        tabs.map((tab) =>
          tab.id === activeTabId
            ? {
              ...tab,
              products: tab.products.map((item, i) =>
                i === index
                  ? {
                    ...item,
                    quantity,
                    unitPrice,
                    isPriceManuallyEdited: true,
                  }
                  : item
              ),
            }
            : tab
        )
      );
    },
    [tabs, activeTabId, setTabs]
  );

  return {
    handleAddTab,
    handleCloseTab,
    handleCustomerChange,
    handleProductSelect,
    addProductToCart,
    createPendingProductSaveHandler,
    handleUpdateQuantity,
    handleRemoveProduct,
    handleSaveSale,
    handleSalesTypeChange,
    handlePriceTypeChange,
    handleUpdateItem,
    loadSale,
    savingSale,
    activeTab,
  };
};
