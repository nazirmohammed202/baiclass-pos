"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createSupplier } from "@/lib/suppliers-actions";

type AddSupplierModalProps = {
  branchId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddSupplierModal({
  branchId,
  isOpen,
  onClose,
  onSuccess,
}: AddSupplierModalProps) {
  const [name, setName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    const phones = phoneNumbers.trim()
      ? phoneNumbers.split(",").map((p) => p.trim()).filter(Boolean)
      : undefined;
    const result = await createSupplier(
      {
        name: trimmedName,
        phoneNumbers: phones,
        address: address.trim() || undefined,
        email: email.trim() || undefined,
      },
      branchId
    );
    setSaving(false);
    if (result.success) {
      setName("");
      setPhoneNumbers("");
      setAddress("");
      setEmail("");
      onSuccess();
      onClose();
    } else {
      setError(result.error ?? "Failed to add supplier");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Supplier</h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">{error}</p>
          )}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary"
              placeholder="Supplier name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Phone</label>
            <input
              type="text"
              value={phoneNumbers}
              onChange={(e) => setPhoneNumbers(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary"
              placeholder="Phone numbers (comma-separated)"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary"
              placeholder="Email"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary"
              placeholder="Address"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Add Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
