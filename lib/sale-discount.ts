export type SaleDiscountType = "percentage" | "fixed" | null;

export const calculateInvoiceDiscountAmount = (
  subtotal: number,
  discountType: SaleDiscountType,
  discountValue: number
): number => {
  if (!discountType || discountValue <= 0 || subtotal <= 0) return 0;

  if (discountType === "percentage") {
    return Math.min(subtotal, subtotal * (discountValue / 100));
  }

  return Math.min(discountValue, subtotal);
};

export const calculateSaleTotal = (
  subtotal: number,
  discountType: SaleDiscountType,
  discountValue: number
): number => {
  const discount = calculateInvoiceDiscountAmount(
    subtotal,
    discountType,
    discountValue
  );
  return parseFloat((subtotal - discount).toFixed(2));
};
