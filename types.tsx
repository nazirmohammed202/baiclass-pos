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
};

export type CustomerType = {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
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
  lowStockThreshold: number | undefined;
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
};

