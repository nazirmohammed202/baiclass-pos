"use client";
import React, { useState, useTransition } from "react";
import { X } from "lucide-react";
import { useParams } from "next/navigation";
import { PRODUCT_TYPES } from "@/types";
import { createNewProduct } from "@/lib/product-actions";
import { useToast } from "@/context/toastContext";
import { handleError } from "@/utils/errorHandlers";
import { Spinner } from "./ui/spinner";

type AddNewProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddNewProductModal = ({ isOpen, onClose }: AddNewProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    nickname: "",
    type: "",
    size: "",
    factoryPrice: "" as number | "",
  });
  const { branchId } = useParams();
  const [pending, startTransition] = useTransition();
  const { error: toastError, success: toastSuccess } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "factoryPrice" ? (value === "" ? "" : Number(value)) : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    if (pending) return;
    setFormData({
      name: "",
      manufacturer: "",
      nickname: "",
      type: "",
      size: "",
      factoryPrice: "",
    });
    setErrors({});
    onClose();
  };

  const handleCreateProduct = () => {
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required";
    }
    if (!formData.type) {
      newErrors.type = "Type is required";
    }
    if (
      formData.factoryPrice !== "" &&
      (typeof formData.factoryPrice !== "number" || formData.factoryPrice < 0)
    ) {
      newErrors.factoryPrice = "Factory price must be a number >= 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name.trim());
      formDataObj.append("manufacturer", formData.manufacturer.trim());
      formDataObj.append("type", formData.type.toLowerCase());
      formDataObj.append("branchId", branchId as string);

      if (formData.nickname) {
        formDataObj.append("nickname", formData.nickname.trim());
      }
      if (formData.size) {
        formDataObj.append("size", formData.size.trim());
      }
      if (formData.factoryPrice !== "") {
        formDataObj.append("factoryPrice", formData.factoryPrice.toString());
      }

      try {
        await createNewProduct(formDataObj);
        toastSuccess("Product created successfully");
        handleClose();
      } catch (error) {
        toastError(handleError(error));
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-neutral-900  shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              Add New Product
            </h2>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              Add a new product to the system
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={pending}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form action={handleCreateProduct} className="space-y-6">
          <fieldset className="space-y-4 border border-gray-200 dark:border-neutral-800 rounded-lg p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Basic Information <span className="text-red-500">*</span>
            </legend>

            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-200 dark:border-neutral-800"
                }`}
                placeholder="Enter product name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="manufacturer"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.manufacturer
                    ? "border-red-500"
                    : "border-gray-200 dark:border-neutral-800"
                }`}
                placeholder="Enter manufacturer name"
                required
              />
              {errors.manufacturer && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.manufacturer}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="type"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.type
                    ? "border-red-500"
                    : "border-gray-200 dark:border-neutral-800"
                }`}
                required
              >
                <option value="">Select product type</option>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-500">{errors.type}</p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4 border border-gray-200 dark:border-neutral-800 rounded-lg p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Additional Details
            </legend>

            <div>
              <label
                htmlFor="nickname"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nickname
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter product nickname"
              />
            </div>

            <div>
              <label
                htmlFor="size"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Size
              </label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter product size"
              />
            </div>

            <div>
              <label
                htmlFor="factoryPrice"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Factory Price
              </label>
              <input
                type="number"
                id="factoryPrice"
                name="factoryPrice"
                value={formData.factoryPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.factoryPrice
                    ? "border-red-500"
                    : "border-gray-200 dark:border-neutral-800"
                }`}
                placeholder="Enter factory price"
              />
              {errors.factoryPrice && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.factoryPrice}
                </p>
              )}
            </div>
          </fieldset>

          <div className="flex gap-3 pt-4">
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
              disabled={pending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Spinner className="w-4 h-4 text-white" />
                  Creating...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProductModal;
