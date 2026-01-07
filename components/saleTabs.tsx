"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import SaleTab from "./saleTab";
import { CustomerType, Product, SaleType } from "@/types";
import { StockProvider, useStock } from "@/context/stockContext";
import { useParams } from "next/navigation";
import { use } from "react";
import {
  useSaleTabsPersistence,
  Tab,
  CartItem,
} from "@/hooks/useSaleTabsPersistence";
import EditCartItemModal from "./EditCartItemModal";
import { useCompany } from "@/context/companyContext";
import { createNewSale } from "@/lib/sale-actions";
import { useToast } from "@/context/toastContext";
import { handleError } from "@/utils/errorHandlers";

export type { CartItem };

// Component to watch stockMap changes and update prices for items that weren't manually edited
const StockPriceUpdater = ({
  setTabs,
  activeTabId,
  priceType,
}: {
  setTabs: (tabs: Tab[] | ((prev: Tab[]) => Tab[])) => void;
  activeTabId: string;
  priceType: "retail" | "wholesale";
}) => {
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

const SaleTabs = ({
  customers,
  products,
  stockData,
}: {
  customers: Promise<CustomerType[]>;
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
}) => {
  const params = useParams();
  const branchId = params.branchId as string;
  const productsData = use(products);
  const { account, company } = useCompany();
  const { error: toastError, success: toastSuccess } = useToast();
  const [savingSale, setSavingSale] = useState(false);
  // Use custom hook for localStorage persistence
  const { tabs, setTabs, activeTabId, setActiveTabId } = useSaleTabsPersistence(
    branchId,
    productsData
  );

  // Store showEditOnClick setting in localStorage
  const [showEditOnClick, setShowEditOnClick] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(`showEditOnClick-${branchId}`);
      return stored === "true";
    } catch {
      return false;
    }
  });

  // Store switch visibility settings in localStorage
  // Initialize with default values to avoid hydration mismatch
  const [showPriceTypeSwitch, setShowPriceTypeSwitch] = useState(true);
  const [showSalesTypeSwitch, setShowSalesTypeSwitch] = useState(true);
  const [, startTransition] = useTransition();

  // Load switch visibility settings from localStorage after hydration
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedPriceType = localStorage.getItem(
        `showPriceTypeSwitch-${branchId}`
      );
      const storedSalesType = localStorage.getItem(
        `showSalesTypeSwitch-${branchId}`
      );

      startTransition(() => {
        if (storedPriceType !== null) {
          setShowPriceTypeSwitch(storedPriceType !== "false");
        }
        if (storedSalesType !== null) {
          setShowSalesTypeSwitch(storedSalesType !== "false");
        }
      });
    } catch (error) {
      console.error("Error loading switch visibility settings:", error);
    }
  }, [branchId, startTransition]);

  // State for pending product to add (when showEditOnClick is enabled)
  const [pendingProduct, setPendingProduct] = useState<{
    product: Product;
    stockItem: Product | undefined;
    priceType: "retail" | "wholesale";
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `showEditOnClick-${branchId}`,
        showEditOnClick.toString()
      );
    } catch (error) {
      console.error("Error saving showEditOnClick setting:", error);
    }
  }, [showEditOnClick, branchId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `showPriceTypeSwitch-${branchId}`,
        showPriceTypeSwitch.toString()
      );
    } catch (error) {
      console.error("Error saving showPriceTypeSwitch setting:", error);
    }
  }, [showPriceTypeSwitch, branchId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `showSalesTypeSwitch-${branchId}`,
        showSalesTypeSwitch.toString()
      );
    } catch (error) {
      console.error("Error saving showSalesTypeSwitch setting:", error);
    }
  }, [showSalesTypeSwitch, branchId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  const handleAddTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      customer: null,
      products: [],
      priceType: "retail",
      salesType: "cash",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close the last tab

    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // If the closed tab was active, switch to another tab
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleCustomerChange = (customer: CustomerType | null) => {
    setTabs(
      tabs.map((tab) => (tab.id === activeTabId ? { ...tab, customer } : tab))
    );
  };
  const handleProductSelect = (
    product: Product,
    stockItem: Product | undefined,
    priceType: "retail" | "wholesale"
  ) => {
    // If showEditOnClick is enabled, show modal instead of adding directly
    if (showEditOnClick) {
      setPendingProduct({ product, stockItem, priceType });
      return;
    }

    // Original behavior: add directly to cart
    addProductToCart(product, stockItem, priceType, 1);
  };

  const addProductToCart = (
    product: Product,
    stockItem: Product | undefined,
    priceType: "retail" | "wholesale",
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
            : priceType === "wholesale"
            ? stockItem?.wholesalePrice ??
              product.wholesalePrice ??
              product.basePrice ??
              0
            : stockItem?.retailPrice ??
              product.retailPrice ??
              product.basePrice ??
              0;

        // Check if product already exists in cart
        const existingItemIndex = tab.products.findIndex(
          (item) => item.product._id === product.details._id
        );

        if (existingItemIndex >= 0) {
          // Increase quantity if product already exists (keep existing unitPrice and manual edit flag)
          const newProducts = [...tab.products];
          newProducts[existingItemIndex] = {
            ...newProducts[existingItemIndex],
            quantity: newProducts[existingItemIndex].quantity + quantity,
            // Preserve isPriceManuallyEdited flag
          };
          return { ...tab, products: newProducts };
        } else {
          // Add new product with quantity and captured price
          // Mark as manually edited if unitPrice was provided
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
        }
      })
    );
  };

  const handlePendingProductSave = (quantity: number, unitPrice: number) => {
    if (!pendingProduct) return;

    addProductToCart(
      pendingProduct.product,
      pendingProduct.stockItem,
      pendingProduct.priceType,
      quantity,
      unitPrice
    );

    setPendingProduct(null);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
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
  };

  const handleRemoveProduct = (index: number) => {
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
  };

  const handleSaveSale = async (
    customer: CustomerType | null,
    cartItems: CartItem[],
    total: number,
    amountPaid: number,
    priceType: "retail" | "wholesale",
    shouldPrint: boolean
  ) => {
    if (activeTab.salesType === "credit" && !customer) {
      toastError("Please select a customer for credit sales");
      return;
    }
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
      paymentMethod: "cash",
      note: "",
      salesType: activeTab.salesType,
      priceMode: priceType,
    };
    try {
      setSavingSale(true);
      const response = await createNewSale(sale, branchId);
      setSavingSale(false);
      if (response.success) {
        toastSuccess("Sale created successfully");

        // Clear the active tab after successful sale
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  products: [],
                  customer: null,
                  salesType: "cash",
                }
              : tab
          )
        );

        if (shouldPrint) {
          // TODO: Implement print logic
        }
        return;
      }
      toastError(response.error ?? "Failed to create sale");
    } catch (error) {
      setSavingSale(false);
      toastError(handleError(error));
    }
  };

  const handleSalesTypeChange = (newSalesType: "cash" | "credit") => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, salesType: newSalesType } : tab
      )
    );
  };

  const handlePriceTypeChange = (newPriceType: "retail" | "wholesale") => {
    setTabs(
      tabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;

        // Update prices for items that weren't manually edited when priceType changes
        const updatedProducts = tab.products.map((item) => {
          if (item.isPriceManuallyEdited) return item;

          // Get price from product data (stock data might not be loaded yet)
          const newPrice =
            newPriceType === "wholesale"
              ? item.product.wholesalePrice ?? item.product.basePrice ?? 0
              : item.product.retailPrice ?? item.product.basePrice ?? 0;

          return { ...item, unitPrice: newPrice };
        });

        return { ...tab, priceType: newPriceType, products: updatedProducts };
      })
    );
  };

  const handleUpdateItem = (
    index: number,
    quantity: number,
    unitPrice: number
  ) => {
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
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Header */}
      <section className="flex items-center gap-1  overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-4 rounded-t cursor-pointer transition-colors relative
              ${
                activeTabId === tab.id
                  ? tab.salesType === "credit"
                    ? "bg-amber-50 dark:bg-amber-900/20 "
                    : "bg-white dark:bg-neutral-900 "
                  : tab.salesType === "credit"
                  ? "bg-amber-100/50 dark:bg-amber-900/10 hover:bg-amber-200/50 dark:hover:bg-amber-900/20"
                  : "bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }
            `}
          >
            <span
              className={`text-sm whitespace-nowrap ${
                activeTabId === tab.id
                  ? tab.salesType === "credit"
                    ? "font-bold text-amber-700 dark:text-amber-400"
                    : "font-bold text-primary"
                  : tab.salesType === "credit"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-500"
              }`}
            >
              {tab.customer ? tab.customer.name : "New Sale"}
            </span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="p-1 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddTab}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
          aria-label="Add new tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </section>

      {/* Active Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <StockProvider>
          <StockPriceUpdater
            setTabs={setTabs}
            activeTabId={activeTabId}
            priceType={activeTab.priceType}
          />
          <SaleTab
            customer={activeTab.customer}
            products={products}
            onProductSelect={(product, stockItem) =>
              handleProductSelect(product, stockItem, activeTab.priceType)
            }
            onCustomerChange={handleCustomerChange}
            customers={customers}
            stockData={stockData}
            tabProducts={activeTab.products}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveProduct={handleRemoveProduct}
            onUpdateItem={handleUpdateItem}
            priceType={activeTab.priceType}
            onPriceTypeChange={handlePriceTypeChange}
            salesType={activeTab.salesType}
            onSalesTypeChange={handleSalesTypeChange}
            showEditOnClick={showEditOnClick}
            onShowEditOnClickChange={setShowEditOnClick}
            showPriceTypeSwitch={showPriceTypeSwitch}
            showSalesTypeSwitch={showSalesTypeSwitch}
            onShowPriceTypeSwitchChange={setShowPriceTypeSwitch}
            onShowSalesTypeSwitchChange={setShowSalesTypeSwitch}
            onSaveSale={(
              customer,
              cartItems,
              total,
              amountPaid,
              priceType,
              shouldPrint
            ) =>
              handleSaveSale(
                customer,
                cartItems,
                total,
                amountPaid,
                priceType,
                shouldPrint
              )
            }
            savingSale={savingSale}
          />
        </StockProvider>
      </div>

      {/* Edit Modal for pending product */}
      {pendingProduct && (
        <EditCartItemModal
          isOpen={!!pendingProduct}
          onClose={() => setPendingProduct(null)}
          item={{
            product: pendingProduct.product,
            quantity: 1,
            unitPrice:
              pendingProduct.priceType === "wholesale"
                ? pendingProduct.stockItem?.wholesalePrice ??
                  pendingProduct.product.wholesalePrice ??
                  pendingProduct.product.basePrice ??
                  0
                : pendingProduct.stockItem?.retailPrice ??
                  pendingProduct.product.retailPrice ??
                  pendingProduct.product.basePrice ??
                  0,
            isPriceManuallyEdited: false,
          }}
          onSave={handlePendingProductSave}
          focusField="quantity"
        />
      )}
    </div>
  );
};

export default SaleTabs;
