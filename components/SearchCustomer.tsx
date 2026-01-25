"use client";
import { CustomerType } from "@/types";
import React, { useState, useRef, useMemo, use } from "react";
import { Plus, X } from "lucide-react";

type SearchCustomerProps = {
  onSelectCustomer?: (customer: CustomerType) => void;
  customers: Promise<CustomerType[]>;
};

// Initial mock customer data

const SearchCustomer = ({
  onSelectCustomer,
  customers: customersPromise,
}: SearchCustomerProps) => {
  const customersData = use(customersPromise);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    city: "",
    region: "",
    landmark: "",
    phoneNumber: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCustomers = useMemo(() => {
    if (searchQuery.trim() === "") {
      return customersData;
    }
    return customersData?.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phoneNumber.includes(searchQuery) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, customersData]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking inside the dropdown
    if (
      dropdownRef.current &&
      dropdownRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    setIsOpen(false);
  };

  const handleSelectCustomer = (customer: CustomerType) => {
    setSearchQuery("");
    setIsOpen(false);
    if (onSelectCustomer) {
      onSelectCustomer(customer);
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
      area: "",
      city: "",
      region: "",
      landmark: "",
      phoneNumber: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.name.trim() &&
      formData.area.trim() &&
      formData.city.trim() &&
      formData.region.trim() &&
      formData.phoneNumber.trim()
    ) {
      // Combine address fields into a single address string
      const addressParts = [
        formData.area.trim(),
        formData.city.trim(),
        formData.region.trim(),
        formData.landmark.trim(),
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");

      const newCustomer: CustomerType = {
        name: formData.name.trim(),
        address: fullAddress,
        phoneNumber: formData.phoneNumber.trim(),
        _id: "",
      };

      // Add to customers list (in real app, this would be an API call)

      // Select the new customer
      if (onSelectCustomer) {
        onSelectCustomer(newCustomer);
      }

      handleCloseModal();
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
        placeholder="Search customers..."
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
        aria-label="Add new customer"
      >
        <Plus className="w-4 h-4" />
      </button>

      {isOpen && filteredCustomers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 max-h-64 overflow-y-auto z-50"
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur
        >
          {filteredCustomers.map((customer, index) => (
            <div
              key={index}
              onClick={() => handleSelectCustomer(customer)}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer border-b border-gray-100 dark:border-neutral-800 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {customer.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {customer.address}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                {customer.phoneNumber}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen &&
        filteredCustomers.length === 0 &&
        searchQuery.trim() !== "" && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 p-4 z-50"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              No customers found
            </div>
          </div>
        )}

      {/* Add Customer Modal */}
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
                Add New Customer
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
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
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter customer name"
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
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="area"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Area
                </label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter area"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Region
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter region"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="landmark"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter landmark"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-800 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchCustomer;
