import {
  AccountType,
  BranchType,
  CartItem,
  CustomerType,
  PriceType,
  SalePopulatedType,
} from "@/types";

type BuildSaleForPrintParams = {
  cartItems: CartItem[];
  customer: CustomerType | null;
  total: number;
  discount: number;
  amountPaid: number;
  paymentMethod: "cash" | "momo";
  salesType: "cash" | "credit";
  priceType: PriceType;
  note?: string;
  seller: AccountType | null;
  branch: BranchType;
  createdAt?: string;
  saleId?: string;
  invoiceNumber?: string;
};

export const buildSaleForPrint = ({
  cartItems,
  customer,
  total,
  discount,
  amountPaid,
  paymentMethod,
  salesType,
  priceType,
  note,
  seller,
  branch,
  createdAt,
  saleId,
  invoiceNumber,
}: BuildSaleForPrintParams): SalePopulatedType => {
  const due = total - amountPaid > 0 ? parseFloat((total - amountPaid).toFixed(2)) : 0;

  return {
    _id: saleId ?? `temp-${Date.now()}`,
    seller: {
      _id: seller?._id ?? "",
      name: seller?.name ?? "—",
    },
    customer: customer
      ? ({
          _id: customer._id,
          name: customer.name,
          address: customer.address,
          phoneNumber: customer.phoneNumber,
        } as SalePopulatedType["customer"])
      : undefined,
    branch: {
      _id: branch._id,
      name: branch.name,
    },
    products: cartItems.map((item) => ({
      product: {
        _id: item.product.details._id,
        name: item.product.details.name,
        manufacturer: item.product.details.manufacturer,
        size: item.product.details.size,
        type: item.product.details.type,
      },
      quantity: item.quantity,
      price: item.unitPrice,
      total: item.unitPrice * item.quantity,
    })),
    total,
    discount,
    paid: amountPaid,
    due,
    paymentMethod,
    note,
    salesType,
    priceMode: priceType === "credit" ? "retail" : priceType,
    createdAt: createdAt ?? new Date().toISOString(),
    invoiceNumber,
  } as unknown as SalePopulatedType;
};
