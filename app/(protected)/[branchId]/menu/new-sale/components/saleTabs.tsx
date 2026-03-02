"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, X, History } from "lucide-react";
import SaleTab from "@/app/(protected)/[branchId]/menu/new-sale/components/saleTab";
import { BranchType, CustomerType, PriceType, Product } from "@/types";
import { StockProvider } from "@/context/stockContext";
import {
  useParams,
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import { use } from "react";
import { useSaleTabsPersistence } from "@/app/(protected)/[branchId]/menu/new-sale/hooks/useSaleTabsPersistence";
import { useSaleSettingsPersistence } from "@/app/(protected)/[branchId]/menu/new-sale/hooks/useSaleSettingsPersistence";
import EditCartItemModal from "@/app/(protected)/[branchId]/menu/new-sale/components/EditCartItemModal";
import { useCompany } from "@/context/companyContext";
import { useSaleTabsActions } from "@/app/(protected)/[branchId]/menu/new-sale/hooks/useSaleTabActions";
import StockPriceUpdater from "./StockPriceUpdater";
import TodaySalesSidebar from "./TodaySalesSidebar";
import DatePickerModal from "./DatePickerModal";
import { formatDateToDisplay } from "@/lib/date-utils";
import { Calendar } from "lucide-react";

const SaleTabs = ({
  customers,
  products,
  stockData,
  branch,
}: {
  customers: Promise<CustomerType[]>;
  products: Promise<Product[]>;
  stockData: Promise<Product[]>;
  branch: Promise<BranchType>;
}) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const saleId = searchParams.get("saleId");
  const customDate = searchParams.get("customDate");
  const customerId = searchParams.get("customerId");
  const branchId = params.branchId as string;
  const productsData = use(products);
  const customersData = use(customers);
  const { account, company } = useCompany();
  const branchData = use(branch);
  // Use custom hook for localStorage persistence
  const { tabs, setTabs, activeTabId, setActiveTabId, isHydrated } =
    useSaleTabsPersistence(branchId, productsData);

  // Use custom hook for settings persistence
  const {
    showEditOnClick,
    setShowEditOnClick,
    showPriceTypeSwitch,
    setShowPriceTypeSwitch,
    showSalesTypeSwitch,
    setShowSalesTypeSwitch,
    defaultPriceType,
    setDefaultPriceType,
    defaultSalesType,
    setDefaultSalesType,
  } = useSaleSettingsPersistence(branchId);

  // State for pending product to add (when showEditOnClick is enabled)
  const [pendingProduct, setPendingProduct] = useState<{
    product: Product;
    stockItem: Product | undefined;
    priceType: PriceType;
  } | null>(null);

  // State for sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for date picker modal
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // State for close tab confirmation
  const [tabIdToClose, setTabIdToClose] = useState<string | null>(null);

  // Prevent double-processing customerId from URL
  const processedCustomerIdRef = useRef<string | null>(null);

  // Use custom hook for sale tabs actions
  const {
    handleAddTab,
    handleCloseTab,
    handleCustomerChange,
    handleProductSelect,
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
  } = useSaleTabsActions({
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
    customers,
    defaultPriceType,
    defaultSalesType,
    branchData,
  });

  // Load sale when saleId is present in URL
  useEffect(() => {
    // Wait for localStorage hydration to complete and products to be loaded
    if (!saleId || !isHydrated || productsData.length === 0) return;

    const removeSaleIdFromUrl = () => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("saleId");
      const newUrl = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      router.replace(newUrl);
    };

    // Check if sale tab already exists
    const existingTab = tabs.find((tab) => tab.saleId === saleId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      removeSaleIdFromUrl();
      return;
    }

    // Load the sale and clean up URL after loading
    loadSale(saleId).then(() => {
      removeSaleIdFromUrl();
    });
  }, [
    saleId,
    isHydrated,
    productsData.length,
    tabs,
    loadSale,
    setActiveTabId,
    searchParams,
    pathname,
    router,
  ]);

  // Show date picker when customDate is present in URL
  useEffect(() => {
    if (!customDate || !isHydrated) return;

    // Remove customDate from URL and show date picker
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("customDate");
    const newUrl = newSearchParams.toString()
      ? `${pathname}?${newSearchParams.toString()}`
      : pathname;
    router.replace(newUrl);

    // Use setTimeout to avoid synchronous state update in effect
    setTimeout(() => {
      setIsDatePickerOpen(true);
    }, 0);
  }, [customDate, isHydrated, searchParams, pathname, router]);

  // Add tab with preselected customer when customerId is present in URL
  useEffect(() => {
    if (!customerId || !isHydrated) return;
    if (processedCustomerIdRef.current === customerId) return;
    processedCustomerIdRef.current = customerId;

    const removeCustomerIdFromUrl = () => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("customerId");
      const newUrl = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      router.replace(newUrl);
    };

    const customer = customersData.find((c) => c._id === customerId);
    if (!customer) {
      removeCustomerIdFromUrl();
      return;
    }

    // Check if there's already a tab with this customer and no products - switch to it
    const existingTab = tabs.find(
      (tab) => tab.customer?._id === customerId && tab.products.length === 0
    );
    if (existingTab) {
      setActiveTabId(existingTab.id);
      removeCustomerIdFromUrl();
      return;
    }

    handleAddTab(customer);
    removeCustomerIdFromUrl();
  }, [
    customerId,
    isHydrated,
    customersData,
    tabs,
    handleAddTab,
    setActiveTabId,
    searchParams,
    pathname,
    router,
  ]);

  // Create handler for pending product save
  const handlePendingProductSave =
    createPendingProductSaveHandler(pendingProduct);

  // Handler for editing sale from sidebar
  const handleEditSaleFromSidebar = async (saleId: string) => {
    await loadSale(saleId);
  };

  // Handler for date selection
  const handleDateConfirm = (date: string) => {
    // Update the active tab with the selected date
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, saleDate: date } : tab
      )
    );
    setIsDatePickerOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      <h1 className="text-2xl font-bold mb-1">Make a Sale</h1>
      {/* Tabs Header */}
      <section className="flex items-end gap-1  overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-4 rounded-t cursor-pointer transition-colors relative
              ${activeTabId === tab.id
                ? "bg-white dark:bg-neutral-900 "
                : "bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }
            `}
          >
            <div className="flex flex-col items-start gap-1">
              <span
                className={`text-sm whitespace-nowrap ${activeTabId === tab.id
                  ? tab.salesType === "credit"
                    ? "font-bold text-amber-700 dark:text-amber-400"
                    : "font-bold text-primary"
                  : tab.salesType === "credit"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-500"
                  }`}
              >
                {tab.isEditMode
                  ? `Edit Sale${tab.customer ? ` - ${tab.customer.name}` : ""} ${tab.salesType === "credit" ? " (Credit)" : ""}`
                  : tab.customer
                    ? tab.customer.name
                    : "New Sale" + (tab.salesType === "credit" ? " (Credit)" : "")}
              </span>
              {tab.saleDate && activeTabId === tab.id && (
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
                  <span>{formatDateToDisplay(tab.saleDate)}</span>
                </button>
              )}
            </div>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTabIdToClose(tab.id);
                }}
                className="p-1 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
                aria-label="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        <div className="flex h-full gap-2">
          <button
            onClick={() => handleAddTab()}
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
            aria-label="Toggle sales history sidebar"
            title="Today's Sales"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Active Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <StockProvider>
          <StockPriceUpdater
            setTabs={setTabs}
            activeTabId={activeTabId}
            priceType={activeTab.priceType}
            branchData={branchData}
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
            defaultPriceType={defaultPriceType}
            onDefaultPriceTypeChange={setDefaultPriceType}
            defaultSalesType={defaultSalesType}
            onDefaultSalesTypeChange={setDefaultSalesType}
            onSaveSale={(
              customer,
              cartItems,
              total,
              amountPaid,
              priceType,
              shouldPrint,
              paymentMethod,
              creditDueDate
            ) =>
              handleSaveSale(
                customer,
                cartItems,
                total,
                amountPaid,
                priceType,
                shouldPrint,
                paymentMethod,
                creditDueDate
              )
            }
            savingSale={savingSale}
            isEditMode={activeTab.isEditMode || false}
            saleId={activeTab.saleId}
            saleDate={activeTab.saleDate}
          />
        </StockProvider>

        {/* Today's Sales Sidebar */}
        <TodaySalesSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onEditSale={handleEditSaleFromSidebar}
        />
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
              pendingProduct.priceType === "credit"
                ? pendingProduct.stockItem?.creditPrice ??
                pendingProduct.product.creditPrice ??
                pendingProduct.stockItem?.retailPrice ??
                pendingProduct.product.retailPrice ??
                pendingProduct.product.basePrice ??
                0
                : pendingProduct.priceType === "wholesale"
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

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={handleDateConfirm}
        initialDate={activeTab.saleDate}
      />

      {/* Close Tab Confirmation Modal */}
      {tabIdToClose && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setTabIdToClose(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Close tab?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Any unsaved items in this tab will be lost. Are you sure you want
              to close it?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setTabIdToClose(null)}
                className="px-4 py-2 rounded-md border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCloseTab(tabIdToClose);
                  setTabIdToClose(null);
                }}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Close tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleTabs;
