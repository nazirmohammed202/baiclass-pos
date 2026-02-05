"use client";

import { SupplierType } from "@/types";
import React, { useState, useRef, useMemo } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createSupplier } from "@/lib/suppliers-actions";
import { useParams } from "next/navigation";
import { useToast } from "@/context/toastContext";

type SearchSupplierProps = {
  onSelectSupplier?: (supplier: SupplierType) => void;
  suppliers: SupplierType[];
};

const SearchSupplier = ({ onSelectSupplier, suppliers }: SearchSupplierProps) => {
  const params = useParams();
  const branchId = params.branchId as string;
  const { error: toastError, success: toastSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSuppliers = useMemo(() => {
    if (searchQuery.trim() === "") {
      return suppliers;
    }
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phoneNumbers?.some((phone) => phone.includes(searchQuery)) ||
        supplier.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, suppliers]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (
      dropdownRef.current &&
      dropdownRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    setIsOpen(false);
  };

  const handleSelectSupplier = (supplier: SupplierType) => {
    setSearchQuery("");
    setIsOpen(false);
    if (onSelectSupplier) {
      onSelectSupplier(supplier);
    }
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      phoneNumbers: formData.phoneNumber.trim() ? [formData.phoneNumber.trim()] : undefined,
      email: formData.email.trim() || undefined,
    };

    const response = await createSupplier(payload, branchId);

    setIsSaving(false);

    if (response.success && response.supplier) {
      toastSuccess("Supplier created successfully");
      if (onSelectSupplier) {
        onSelectSupplier(response.supplier);
      }
      handleCloseModal();
    } else {
      toastError(response.error ?? "Failed to create supplier");
    }
  };

  return (
    <div className="relative w-full">
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
        placeholder="Search suppliers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full pl-12 pr-12 py-2 rounded-full bg-background"
      />

      <button
        type="button"
        onClick={handleOpenModal}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors z-10"
        aria-label="Add new supplier"
      >
        <Plus className="w-4 h-4" />
      </button>

      {isOpen && filteredSuppliers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 max-h-64 overflow-y-auto z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier._id}
              onClick={() => handleSelectSupplier(supplier)}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer border-b border-gray-100 dark:border-neutral-800 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {supplier.name}
              </div>
              {supplier.address && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {supplier.address}
                </div>
              )}
              {supplier.phoneNumbers && supplier.phoneNumbers.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {supplier.phoneNumbers[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredSuppliers.length === 0 && searchQuery.trim() !== "" && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-4 z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No suppliers found
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                Add New Supplier
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  placeholder="Enter address"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Supplier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSupplier;
