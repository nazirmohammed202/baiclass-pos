"use client";
import { useCompany } from "@/context/companyContext";
import { ProductDetailsType } from "@/types";
import { use, useEffect } from "react";

export const AllSystemProducts = ({
  products,
}: {
  products: Promise<ProductDetailsType[]>;
}) => {
  const productsData = use(products);
  const { setAllSystemProducts } = useCompany();

  useEffect(() => {
    setAllSystemProducts(productsData);
  }, [productsData, setAllSystemProducts]);

  return null;
};
