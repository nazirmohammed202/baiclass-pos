"use client";

import { useState, useEffect } from "react";
import { Plus, X, Calendar, History } from "lucide-react";
import ReceiveStockTab from "./ReceiveStockTab";
import { BranchType, Product, SupplierType } from "@/types";
import { StockProvider } from "@/context/stockContext";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { use } from "react";
import { useReceiveStockPersistence } from "../hooks/useReceiveStockPersistence";
import { useReceiveStockSettings } from "../hooks/useReceiveStockSettings";
import { useReceiveStockActions } from "../hooks/useReceiveStockActions";
import EditReceiveStockItemModal from "./EditReceiveStockItemModal";
import DatePickerModal from "./DatePickerModal";
import { formatDateToDisplay } from "@/lib/date-utils";
import StockPriceUpdater from "./StockPriceUpdater";
import RecentStockHistorySidebar from "@/app/(protected)/[branchId]/menu/stock-history/components/RecentStockHistorySidebar";

const ReceiveStockTabs = ({
  products,
  stockData,
  suppliers,
  branch,
}: {
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
  suppliers: Promise<SupplierType[]>;
  branch: Promise<BranchType>;
}) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inventoryId = searchParams.get("inventoryId");
  const branchId = params.branchId as string;
  const productsData = use(products);
  const suppliersData = use(suppliers);
  const branchData = use(branch);

  const { tabs, setTabs, activeTabId, setActiveTabId, isHydrated } =
    useReceiveStockPersistence(branchId, productsData);

  const {
    showEditOnClick,
    setShowEditOnClick,
    showPaymentTypeSwitch,
    setShowPaymentTypeSwitch,
    autoCalcWholesale,
    setAutoCalcWholesale,
    autoCalcRetail,
    setAutoCalcRetail,
    roundWholesale,
    setRoundWholesale,
    roundRetail,
    setRoundRetail,
  } = useReceiveStockSettings(branchId);

  const priceSettings = {
    autoCalcWholesale,
    autoCalcRetail,
    roundWholesale,
    roundRetail,
  };

  const [pendingProduct, setPendingProduct] = useState<{
    product: Product;
    stockItem: Product | undefined;
  } | null>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    handleAddTab,
    handleCloseTab,
    handleSupplierChange,
    handleDateChange,
    handleProductSelect,
    createPendingProductSaveHandler,
    handleUpdateQuantity,
    handleRemoveProduct,
    handleSaveReceiveStock,
    handlePaymentTypeChange,
    handleUpdateItem,
    handleInvoiceDiscountChange,
    loadInventory,
    saving,
    activeTab,
  } = useReceiveStockActions({
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    branchId,
    showEditOnClick,
    setPendingProduct,
    branchSettings: branchData.settings,
    priceSettings,
    productsData,
    suppliersData,
  });

  const handlePendingProductSave = createPendingProductSaveHandler(pendingProduct);

  const handleDateConfirm = (date: string) => {
    handleDateChange(date);
    setIsDatePickerOpen(false);
  };

  // Load inventory when inventoryId is present in URL
  useEffect(() => {
    // Wait for localStorage hydration to complete and products to be loaded
    if (!inventoryId || !isHydrated || productsData.length === 0) return;

    const removeInventoryIdFromUrl = () => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("inventoryId");
      const newUrl = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      router.replace(newUrl);
    };

    // Check if inventory tab already exists
    const existingTab = tabs.find((tab) => tab.inventoryId === inventoryId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      removeInventoryIdFromUrl();
      return;
    }

    // Load the inventory and clean up URL after loading
    loadInventory(inventoryId).then(() => {
      removeInventoryIdFromUrl();
    });
  }, [
    inventoryId,
    isHydrated,
    productsData.length,
    tabs,
    loadInventory,
    setActiveTabId,
    searchParams,
    pathname,
    router,
  ]);

  return (
    <div className="h-full flex flex-col relative">
      <h1 className="text-2xl font-bold mb-1">Receive Stock</h1>
      {/* Tabs Header */}
      <section className="flex items-end gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-4 rounded-t cursor-pointer transition-colors relative
              ${activeTabId === tab.id
                ? tab.paymentType === "credit"
                  ? "bg-amber-50 dark:bg-amber-900/20"
                  : "bg-white dark:bg-neutral-900"
                : tab.paymentType === "credit"
                  ? "bg-amber-100/50 dark:bg-amber-900/10 hover:bg-amber-200/50 dark:hover:bg-amber-900/20"
                  : "bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }
            `}
          >
            <div className="flex flex-col items-start gap-1">
              <span
                className={`text-sm whitespace-nowrap ${activeTabId === tab.id
                  ? tab.paymentType === "credit"
                    ? "font-bold text-amber-700 dark:text-amber-400"
                    : "font-bold text-primary"
                  : tab.paymentType === "credit"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-500"
                  }`}
              >
                {tab.isEditMode
                  ? `Edit Receipt${tab.supplier ? ` - ${tab.supplier.name}` : ""}`
                  : tab.supplier
                    ? tab.supplier.name
                    : "Receive Stock"}
              </span>
              {activeTabId === tab.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTabId(tab.id);
                    setIsDatePickerOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                  title="Click to change date"
                >
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateToDisplay(tab.receiveDate)}</span>
                </button>
              )}
            </div>
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

        <div className="flex h-full gap-2">
          <button
            onClick={handleAddTab}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            aria-label="Add new tab"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors shrink-0 ${isSidebarOpen
              ? "bg-primary text-white hover:bg-primary/90"
              : "hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            aria-label="Toggle recent stock history sidebar"
            title="Today's Stock Receipts"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Active Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <RecentStockHistorySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onEditInventory={(inventoryId) => {
            loadInventory(inventoryId);
            setIsSidebarOpen(false);
          }}
        />
        <StockProvider>
          <StockPriceUpdater setTabs={setTabs} activeTabId={activeTabId} />
          <ReceiveStockTab
            supplier={activeTab.supplier}
            suppliers={suppliersData}
            products={products}
            onProductSelect={handleProductSelect}
            onSupplierChange={handleSupplierChange}
            stockData={stockData}
            tabItems={activeTab.items}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveProduct={handleRemoveProduct}
            onUpdateItem={handleUpdateItem}
            paymentType={activeTab.paymentType}
            onPaymentTypeChange={handlePaymentTypeChange}
            showEditOnClick={showEditOnClick}
            onShowEditOnClickChange={setShowEditOnClick}
            showPaymentTypeSwitch={showPaymentTypeSwitch}
            onShowPaymentTypeSwitchChange={setShowPaymentTypeSwitch}
            autoCalcWholesale={autoCalcWholesale}
            onAutoCalcWholesaleChange={setAutoCalcWholesale}
            autoCalcRetail={autoCalcRetail}
            onAutoCalcRetailChange={setAutoCalcRetail}
            roundWholesale={roundWholesale}
            onRoundWholesaleChange={setRoundWholesale}
            roundRetail={roundRetail}
            onRoundRetailChange={setRoundRetail}
            onSave={(supplier, items, total, paymentMethod) =>
              handleSaveReceiveStock(supplier, items, total, paymentMethod)
            }
            saving={saving}
            receiveDate={activeTab.receiveDate}
            discountType={activeTab.discountType}
            discountValue={activeTab.discountValue}
            onInvoiceDiscountChange={handleInvoiceDiscountChange}
            branchSettings={branchData.settings}
            priceSettings={priceSettings}
          />
        </StockProvider>
      </div>

      {/* Edit Modal for pending product */}
      {pendingProduct && (
        <EditReceiveStockItemModal
          isOpen={!!pendingProduct}
          onClose={() => setPendingProduct(null)}
          item={{
            product: pendingProduct.product,
            quantity: 1,
            unitPrice:
              pendingProduct.stockItem?.basePrice ??
              pendingProduct.product.basePrice ??
              0,
            isPriceManuallyEdited: false,
          }}
          onSave={handlePendingProductSave}
          focusField="quantity"
          branchSettings={branchData.settings}
          priceSettings={priceSettings}
        />
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={handleDateConfirm}
        initialDate={activeTab.receiveDate}
      />
    </div>
  );
};

export default ReceiveStockTabs;
