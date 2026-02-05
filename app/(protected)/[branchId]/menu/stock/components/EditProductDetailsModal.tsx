"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Product } from "@/types";
import { PRODUCT_TYPES } from "@/types";

type EditProductDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (payload: {
    name?: string;
    manufacturer?: string;
    nickname?: string;
    size?: string;
    type?: string;
  }) => Promise<void>;
  saving: boolean;
};

const EditProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  saving,
}: EditProductDetailsModalProps) => {
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [nickname, setNickname] = useState("");
  const [size, setSize] = useState("");
  const [type, setType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && product?.details) {
      const d = product.details;
      Promise.resolve().then(() => {
        setName(d.name ?? "");
        setManufacturer(d.manufacturer ?? "");
        setNickname(d.nickname ?? "");
        setSize(d.size ?? "");
        setType(d.type ?? "");
        setErrors({});
      });
    }
  }, [isOpen, product]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required";
    if (!type.trim()) newErrors.type = "Type is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      await onSave({
        name: name.trim(),
        manufacturer: manufacturer.trim(),
        nickname: nickname.trim() || undefined,
        size: size.trim() || undefined,
        type: type.toLowerCase().trim(),
      });
      onClose();
    } catch {
      // Parent handles toast
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Edit product details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: "" }));
              }}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? "border-red-500" : "border-gray-200 dark:border-neutral-800"
                }`}
              placeholder="Product name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Manufacturer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => {
                setManufacturer(e.target.value);
                setErrors((p) => ({ ...p, manufacturer: "" }));
              }}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.manufacturer ? "border-red-500" : "border-gray-200 dark:border-neutral-800"
                }`}
              placeholder="Manufacturer"
            />
            {errors.manufacturer && (
              <p className="mt-1 text-sm text-red-500">{errors.manufacturer}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optional nickname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Size
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. 500ml"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setErrors((p) => ({ ...p, type: "" }));
              }}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.type ? "border-red-500" : "border-gray-200 dark:border-neutral-800"
                }`}
            >
              <option value="">Select type</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductDetailsModal;
