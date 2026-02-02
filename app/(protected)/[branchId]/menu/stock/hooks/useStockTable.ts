"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useToast } from "@/context/toastContext";
import { useStock } from "@/context/stockContext";
import { updateBranchProductStock, removeProductFromBranch } from "@/lib/branch-actions";
import { updateProductDetails, UpdateProductDetailsPayload } from "@/lib/product-actions";
import { StockFilterType } from "../components/StockHeader";
import { PriceFieldType } from "../components/EditPriceModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StockCounts = {
  all: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
};

export type UseStockTableParams = {
  branchId: string;
  products: Product[];
  stockDataPromise: Promise<Product[]>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

export const extractProductTypes = (products: Product[]): string[] => {
  const types = new Set<string>();
  products.forEach((p) => {
    const type = p.details?.type;
    if (type && typeof type === "string") {
      types.add(type.toLowerCase());
    }
  });
  return Array.from(types).sort();
};

export const computeStockCounts = (
  products: Product[],
  getStock: (p: Product) => number
): StockCounts => {
  let outOfStock = 0;
  let lowStock = 0;
  let inStock = 0;

  products.forEach((product) => {
    const stock = getStock(product);
    const threshold = product.lowStockThreshold ?? 5;

    if (stock <= 0) {
      outOfStock++;
    } else if (stock <= threshold) {
      lowStock++;
    } else {
      inStock++;
    }
  });

  return {
    all: products.length,
    outOfStock,
    lowStock,
    inStock,
  };
};

export const filterProducts = (
  products: Product[],
  options: {
    stockFilter: StockFilterType;
    selectedTypes: string[];
    searchQuery: string;
    getStock: (p: Product) => number;
  }
): Product[] => {
  const { stockFilter, selectedTypes, searchQuery, getStock } = options;
  let filtered = products;

  // Filter by stock status
  if (stockFilter !== "all") {
    filtered = filtered.filter((p) => {
      const stock = getStock(p);
      const threshold = p.lowStockThreshold ?? 5;

      switch (stockFilter) {
        case "out_of_stock":
          return stock <= 0;
        case "low_stock":
          return stock > 0 && stock <= threshold;
        case "in_stock":
          return stock > threshold;
        default:
          return true;
      }
    });
  }

  // Filter by selected types
  if (selectedTypes.length > 0) {
    filtered = filtered.filter((p) => {
      const type = p.details?.type?.toLowerCase() ?? "";
      return selectedTypes.includes(type);
    });
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((p) => {
      const d = p.details;
      const flat = p as Product & { name?: string; manufacturer?: string; nickname?: string };
      const name = (typeof d === "object" && d?.name ? d.name : flat.name) ?? "";
      const manufacturer = (typeof d === "object" && d?.manufacturer ? d.manufacturer : flat.manufacturer) ?? "";
      const nickname = (typeof d === "object" && d?.nickname ? d.nickname : flat.nickname) ?? "";
      return (
        name.toLowerCase().includes(q) ||
        manufacturer.toLowerCase().includes(q) ||
        nickname.toLowerCase().includes(q)
      );
    });
  }

  return filtered;
};

export const exportStockToCSV = (
  filteredProducts: Product[],
  stockMap: Map<string, Product>,
  onSuccess?: () => void
) => {
  const headers = [
    "Product Name",
    "Manufacturer",
    "Nickname",
    "Type",
    "Size",
    "Stock",
    "Low Stock Threshold",
    "Stock Status",
    "Base Price",
    "Wholesale Price",
    "Retail Price",
  ];

  const rows = filteredProducts.map((product) => {
    const stockItem = stockMap.get(product.details._id);
    const stock = stockItem?.stock ?? 0;
    const threshold = product.lowStockThreshold ?? 5;

    let stockStatus = "In Stock";
    if (stock <= 0) {
      stockStatus = "Out of Stock";
    } else if (stock <= threshold) {
      stockStatus = "Low Stock";
    }

    return [
      product.details.name || "",
      product.details.manufacturer || "",
      product.details.nickname || "",
      product.details.type || "",
      product.details.size || "",
      stock.toString(),
      threshold.toString(),
      stockStatus,
      stockItem?.basePrice?.toString() || "0",
      stockItem?.wholesalePrice?.toString() || "0",
      stockItem?.retailPrice?.toString() || "0",
    ];
  });

  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `stock-report-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  onSuccess?.();
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useStockTable = ({
  branchId,
  products,
  stockDataPromise,
}: UseStockTableParams) => {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const { stockMap, setStockMap, setIsStockLoading, isStockLoading } = useStock();

  // ─────────────────────────────────────────────────────────────────────────
  // Filter State
  // ─────────────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<StockFilterType>("all");

  // ─────────────────────────────────────────────────────────────────────────
  // Modal State
  // ─────────────────────────────────────────────────────────────────────────
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [thresholdModalProduct, setThresholdModalProduct] = useState<Product | null>(null);
  const [priceModalProduct, setPriceModalProduct] = useState<Product | null>(null);
  const [priceModalField, setPriceModalField] = useState<PriceFieldType>("basePrice");
  const [detailsModalProduct, setDetailsModalProduct] = useState<Product | null>(null);
  const [removeModalProduct, setRemoveModalProduct] = useState<Product | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Add Products State
  // ─────────────────────────────────────────────────────────────────────────
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isSystemProductModalOpen, setIsSystemProductModalOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    stockDataPromise.then((stock) => {
      const map = new Map<string, Product>();
      stock.forEach((item) => map.set(item._id, item));
      setStockMap(map);
      setIsStockLoading(false);
    });
  }, [stockDataPromise, setStockMap, setIsStockLoading]);

  // ─────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ─────────────────────────────────────────────────────────────────────────
  const getProductStock = useCallback(
    (product: Product) => {
      const stockItem = stockMap.get(product.details._id);
      return stockItem?.stock ?? 0;
    },
    [stockMap]
  );

  const productTypes = useMemo(
    () => extractProductTypes(products),
    [products]
  );

  const stockCounts = useMemo(
    () => computeStockCounts(products, getProductStock),
    [products, getProductStock]
  );

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, {
        stockFilter,
        selectedTypes,
        searchQuery,
        getStock: getProductStock,
      }),
    [products, searchQuery, selectedTypes, stockFilter, getProductStock]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Filter Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleToggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleClearTypes = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Export Handler
  // ─────────────────────────────────────────────────────────────────────────
  const handleExportToExcel = useCallback(() => {
    exportStockToCSV(filteredProducts, stockMap, () => {
      toastSuccess?.("Stock report exported successfully");
    });
  }, [filteredProducts, stockMap, toastSuccess]);

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleSaveStock = useCallback(
    async (product: Product, stock: number) => {
      setSaving(true);

      console.log(product)
      try {
        const result = await updateBranchProductStock(branchId, {
          productId: product.details._id,
          stock,
        });
        setSaving(false);
        if (result.success) {
          toastSuccess?.("Stock updated");
          setStockModalProduct(null);
          router.refresh();
        } else {
          toastError?.(result.error ?? "Update failed");
          throw new Error(result.error ?? "Update failed");
        }
      } catch (err) {
        setSaving(false);
        throw err;
      }
    },
    [branchId, router, toastError, toastSuccess]
  );

  const handleSaveThreshold = useCallback(
    async (product: Product, threshold: number) => {
      setSaving(true);
      try {
        const result = await updateBranchProductStock(branchId, {
          productId: product.details._id,
          lowStockThreshold: threshold,
        });
        setSaving(false);
        if (result.success) {
          toastSuccess?.("Threshold updated");
          setThresholdModalProduct(null);
          router.refresh();
        } else {
          toastError?.(result.error ?? "Update failed");
          throw new Error(result.error ?? "Update failed");
        }
      } catch (err) {
        setSaving(false);
        throw err;
      }
    },
    [branchId, router, toastError, toastSuccess]
  );

  const handleSavePrice = useCallback(
    async (product: Product, field: PriceFieldType, value: number) => {
      setSaving(true);
      try {
        const payload =
          field === "basePrice"
            ? { basePrice: value }
            : field === "wholesalePrice"
              ? { wholesalePrice: value }
              : { retailPrice: value };
        const result = await updateBranchProductStock(branchId, {
          productId: product.details._id,
          ...payload,
        });
        setSaving(false);
        if (result.success) {
          toastSuccess?.("Price updated");
          setPriceModalProduct(null);
          router.refresh();
        } else {
          toastError?.(result.error ?? "Update failed");
          throw new Error(result.error ?? "Update failed");
        }
      } catch (err) {
        setSaving(false);
        throw err;
      }
    },
    [branchId, router, toastError, toastSuccess]
  );

  const handleSaveDetails = useCallback(
    async (product: Product, payload: UpdateProductDetailsPayload) => {
      setSaving(true);
      try {
        const detailsId = product.details?._id ?? product._id;
        const result = await updateProductDetails(detailsId, branchId, payload);
        setSaving(false);
        if (result.success) {
          toastSuccess?.("Product details updated");
          setDetailsModalProduct(null);
          router.refresh();
        } else {
          toastError?.(result.error ?? "Update failed");
          throw new Error(result.error ?? "Update failed");
        }
      } catch (err) {
        setSaving(false);
        throw err;
      }
    },
    [branchId, router, toastError, toastSuccess]
  );

  const handleRemoveProduct = useCallback(
    async (product: Product) => {
      setRemoving(true);
      try {
        const result = await removeProductFromBranch(branchId, product.details._id);
        setRemoving(false);
        if (result.success) {
          toastSuccess?.("Product removed from branch");
          setRemoveModalProduct(null);
          router.refresh();
        } else {
          toastError?.(result.error ?? "Remove failed");
          throw new Error(result.error ?? "Remove failed");
        }
      } catch (err) {
        setRemoving(false);
        throw err;
      }
    },
    [branchId, router, toastError, toastSuccess]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Modal Helpers
  // ─────────────────────────────────────────────────────────────────────────
  const openPriceModal = useCallback((product: Product, field: PriceFieldType) => {
    setPriceModalProduct(product);
    setPriceModalField(field);
  }, []);

  const openAddNewProductModal = useCallback(() => {
    setIsAddDropdownOpen(false);
    setIsNewProductModalOpen(true);
  }, []);

  const openAddSystemProductModal = useCallback(() => {
    setIsAddDropdownOpen(false);
    setIsSystemProductModalOpen(true);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────────────
  return {
    // Data
    stockMap,
    isStockLoading,
    filteredProducts,
    productTypes,
    stockCounts,
    getProductStock,

    // Filter state & handlers
    searchQuery,
    setSearchQuery,
    selectedTypes,
    stockFilter,
    setStockFilter,
    handleToggleType,
    handleClearTypes,

    // Modal state
    stockModalProduct,
    setStockModalProduct,
    thresholdModalProduct,
    setThresholdModalProduct,
    priceModalProduct,
    setPriceModalProduct,
    priceModalField,
    detailsModalProduct,
    setDetailsModalProduct,
    removeModalProduct,
    setRemoveModalProduct,

    // Add products state
    isAddDropdownOpen,
    setIsAddDropdownOpen,
    isNewProductModalOpen,
    setIsNewProductModalOpen,
    isSystemProductModalOpen,
    setIsSystemProductModalOpen,

    // Loading state
    saving,
    removing,

    // Handlers
    handleSaveStock,
    handleSaveThreshold,
    handleSavePrice,
    handleSaveDetails,
    handleRemoveProduct,
    handleExportToExcel,
    openPriceModal,
    openAddNewProductModal,
    openAddSystemProductModal,

    // Router
    router,
  };
};
