"use client";
import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useTransition,
} from "react";
import { X, Check } from "lucide-react";
import { Product, ProductDetailsType } from "@/types";
import { Spinner } from "./ui/spinner";
import { addSystemProductsToBranch } from "@/lib/product-actions";
import { useParams } from "next/navigation";
import { useToast } from "@/context/toastContext";
import { handleError } from "@/utils/errorHandlers";

type AddSystemProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  systemProducts: ProductDetailsType[];
  branchProducts: Product[];
  onSuccess?: () => void;
};

const AddSystemProductModal = ({
  isOpen,
  onClose,
  systemProducts,
  branchProducts,
  onSuccess,
}: AddSystemProductModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const branchId = useParams().branchId;
  const [pending, startTransition] = useTransition();
  const { error: toastError, success: toastSuccess } = useToast();

  const productsNotInBranch = useMemo(() => {
    return systemProducts.filter(
      (product) =>
        !branchProducts.some(
          (branchProduct) => branchProduct.details?._id === product._id
        )
    );
  }, [systemProducts, branchProducts]);

  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() === "") {
      return productsNotInBranch || [];
    }
    const query = searchQuery.toLowerCase();
    return productsNotInBranch.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.nickname?.toLowerCase().includes(query) ||
        product.manufacturer?.toLowerCase().includes(query)
    );
  }, [searchQuery, productsNotInBranch]);

  const handleFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (
      dropdownRef.current &&
      dropdownRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    setIsDropdownOpen(false);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleClose = () => {
    if (pending) return;
    setSearchQuery("");
    setSelectedProducts(new Set());
    setIsDropdownOpen(false);
    onClose();
  };

  const handleAddSystemProducts = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("branchId", branchId as string);
      formData.append("productIds", Array.from(selectedProducts).join(","));
      try {
        await addSystemProductsToBranch(formData);
        toastSuccess("Products added successfully");
        onSuccess?.();
      } catch (error) {
        toastError(handleError(error));
      }
      handleClose();
    });
  };

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <form action={handleAddSystemProducts}>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleClose}
      >
        <div
          className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              Add System Products
            </h2>
            <button
              onClick={handleClose}
              disabled={pending}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full pl-12 pr-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            {isDropdownOpen && filteredProducts.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 max-h-96 overflow-y-auto z-50"
                onMouseDown={(e) => e.preventDefault()}
              >
                {filteredProducts.map((product) => {
                  const isSelected = selectedProducts.has(product._id);
                  return (
                    <div
                      key={product._id}
                      onClick={() => toggleProductSelection(product._id)}
                      className={`p-3 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer border-b border-gray-100 dark:border-neutral-800 last:border-b-0 transition-colors flex items-center gap-3 ${isSelected ? "bg-primary/10" : ""
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected
                            ? "bg-primary border-primary"
                            : "border-gray-300 dark:border-neutral-600"
                          }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 dark:text-gray-400 uppercase">
                          {product.manufacturer}
                        </p>
                        <p className="font-medium">
                          {product.name}
                          {product.nickname && (
                            <span className="text-gray-500 ml-2 font-normal">
                              ({product.nickname})
                            </span>
                          )}
                        </p>
                        {product.size && (
                          <p className="text-sm text-gray-500 mt-1">
                            • {product.size}
                          </p>
                        )}
                        {product.type && (
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            Type: {product.type}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isDropdownOpen &&
              filteredProducts.length === 0 &&
              searchQuery.trim() !== "" && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-4 z-50"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    No products found
                  </div>
                </div>
              )}
          </div>

          {selectedProducts.size > 0 && (
            <div className="mb-4 p-3 bg-primary/10 rounded-md">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selectedProducts.size} product
                {selectedProducts.size !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 mt-auto">
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedProducts.size === 0 || pending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Spinner className="w-4 h-4 text-white" />
                  Adding...
                </>
              ) : (
                <>
                  Add{" "}
                  {selectedProducts.size > 0
                    ? `(${selectedProducts.size})`
                    : ""}{" "}
                  Product
                  {selectedProducts.size !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddSystemProductModal;
