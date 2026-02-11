export type AccountType = {
  _id: string;
  name: string;
  phoneNumber: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  account?: AccountType;
};

export type AuthAction =
  | { type: "LOGIN_REQUEST" }
  | { type: "LOGIN_SUCCESS" }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "REQUEST_ACCOUNT" }
  | { type: "REQUEST_ACCOUNT_SUCCESS"; payload: AccountType }
  | { type: "REQUEST_ACCOUNT_FAILURE"; payload: string };

export type CompanyType = {
  _id: string;
  name: string;
  members: Array<{
    userId: string;
    role: string;
  }>;
  branches: Array<{
    _id: string;
    name: string;
    address: string;
  }>;
};

export type BranchType = {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  settings: {
    retailPricePercentage: number; // between 0 and 1
    wholesalePricePercentage: number; // between 0 and 1
    roundRetailPrices: boolean;
    roundWholesalePrices: boolean;
    wholesaleEnabled: boolean;
    retailEnabled: boolean;
    currency: string;
    isWarehouse: boolean;
    suspended: boolean;
    creditEnabled: boolean;
    dailySalesTarget: number;
  },
};

export type CustomerType = {
  _id: string;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  sales: string[];
  totalCreditPurchase: number;
  due: number;
  creditLimit: number;
  payments: string[];
  createdBy: string;
  company: string;
  branch: string;
};

export type CustomersBalanceDueType = {
  _id: string;
  due: number;
};
export type PaymentType = {
  receivedBy: string;
  customer: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
  paymentMethod: "cash" | "momo" | "cheque";
  company: string;
  branch: string;
  momoName: string;
  transactionId: string;
  receiptNumber: string;
  date: Date | string;
  cheque: {
    bank: string;
    branch: string;
    number: string;
    date: Date | string;
  };
  paymentType: "supplier" | "customer";
  createdAt: Date | string;
};

export type SupplierType = {
  _id: string;
  name: string;
  address?: string;
  phoneNumbers?: string[];
  email?: string;
  totalOutstandingBalance: number;
  totalProcurement: number;
};

export type ProductDetailsType = {
  _id: string;
  name: string;
  manufacturer?: string;
  nickname?: string;
  size?: string;
  type?: string;
};

export type Product = {
  _id: string;
  details: ProductDetailsType;
  stock: number | undefined;
  retailPrice: number | undefined;
  basePrice: number | undefined;
  wholesalePrice: number | undefined;
  retailPriceHistory: Array<{
    price: number;
    date: Date | string;
  }>;
  wholesalePriceHistory: Array<{
    price: number;
    date: Date | string;
  }>;
  supplier?: string | undefined;
  lowStockThreshold: number;
  expiryDates?: (Date | string)[] | null;
};

export const PRODUCT_TYPES = [
  "ointment",
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "cream",
  "powder",
  "gel",
  "drops",
  "inhaler",
  "lotion",
  "suspension",
  "suppository",
  "sachet",
  "aerosol",
  "solution",
  "mouthwash",
  "lozenges",
  "mixture",
  "drop",
  "kit",
  "soap",
  "oil",
];

export type SaleProductItem = {
  product: string; // ObjectId
  quantity: number;
  price: number;
  total: number;
};

export type SaleType = {
  _id?: string;
  seller: string; // ObjectId
  company: string; // ObjectId
  branch: string; // ObjectId
  customer?: string; // ObjectId (optional)
  products: SaleProductItem[];
  total: number;
  discount: number;
  paid: number;
  due: number;
  paymentMethod: "cash" | "momo";
  note?: string;
  salesType?: "credit" | "cash";
  priceMode?: "wholesale" | "retail";
  createdAt?: Date | string;
};

export type SalePopulatedType = {
  _id: string;
  seller: {
    _id: string;
    name: string;
  };
  customer?: {
    _id: string;
    name: string;
  };
  branch?: {
    _id: string;
    name: string;
  };
  products: SaleProductItem[];
  total: number;
  discount: number;
  paid: number;
  due: number;
  paymentMethod: "cash" | "momo";
  note?: string;
  salesType?: "credit" | "cash";
  priceMode?: "wholesale" | "retail";
  createdAt?: Date | string;
  invoiceNumber?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  unitPrice: number; // Stored price when item was added
  isPriceManuallyEdited?: boolean; // Track if user manually edited the price
};

export type Tab = {
  id: string;
  customer: CustomerType | null;
  products: CartItem[];
  priceType: "retail" | "wholesale";
  salesType: "cash" | "credit";
  saleId?: string | null; // ID of the sale being edited
  isEditMode?: boolean; // Whether this tab is in edit mode
  saleDate?: string; // ISO date string (YYYY-MM-DD) for custom date sales
};

export type ReceiveStockItem = {
  product: Product;
  quantity: number;
  unitPrice: number; // basePrice
  wholesalePrice?: number;
  retailPrice?: number;
  isPriceManuallyEdited?: boolean;
  isWholesalePriceManuallyEdited?: boolean;
  isRetailPriceManuallyEdited?: boolean;
  discount?: number; // percentage discount for this item (0-100)
};

export type ReceiveStockTab = {
  id: string;
  supplier: SupplierType | null;
  items: ReceiveStockItem[];
  discountType: "percentage" | "fixed" | null;
  discountValue: number; // percentage (0-100) or fixed amount in currency
  paymentType: "cash" | "credit";
  receiveDate: string; // ISO date string (YYYY-MM-DD) - required
  isEditMode?: boolean;
  inventoryId?: string;
};

export type CustomDateSalePayload = {
  seller: string;
  company: string;
  branch: string;
  products: Array<{
    product: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  date: string | Date;
  total: number;
  note?: string;
  salesType: "credit" | "cash";
  priceMode: "wholesale" | "retail";
  paymentMethod: "cash" | "momo";
  customer?: string;
};


export type DailySalesSummary = {
  eachDay: Array<{
    date: string; // ISO date string (YYYY-MM-DD)
    totalSales: number;
    creditSales: number;
    cashSales: number;
  }>
  totalSales: string;
  creditSales: string;
  cashSales: string;
};

export type DailySalesReport = {
  totalSales: string;
  totalCashSales: string;
  totalCreditSales: string;
  totalExpenses: string;
  grossProfit: string;
  totalProductsSold: string;
  totalElectronicPayments: string;
  dailySalesTarget: string;
  totalPaymentsReceived: string;
  averageSale: string;
  recentSales: SalePopulatedType[];
  topProducts: ProductDetailsType[];
};

export type InventoryProductItem = {
  product: ProductDetailsType;
  quantity: number;
  basePrice: number;
  wholesalePrice?: number;
  retailPrice?: number;
  discount?: number;
  total: number;
};

export type InventoryHistoryType = {
  _id: string;
  receivedBy: {
    _id: string;
    name: string;
  };
  supplier?: {
    _id: string;
    name: string;
  };
  branch?: {
    _id: string;
    name: string;
  };
  products: InventoryProductItem[];
  totalCost: number;
  paymentType: "cash" | "credit";
  paymentMethod?: "cash" | "momo";
  invoiceDate: string;
  discountType?: "percentage" | "fixed" | null;
  discountValue?: number;
  note?: string;
  createdAt?: Date | string;
  reversed: boolean;
  reversedAt: Date | string;
  reversedBy: string;
  replacedBy: string;
  replacesReceipt: string;
};

