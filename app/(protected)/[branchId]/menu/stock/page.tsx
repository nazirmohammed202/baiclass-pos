import { getBranchProductsMetadata, getBranchProductsStockData } from "@/lib/branch-actions";
import StockTable from "@/app/(protected)/[branchId]/menu/stock/components/StockTable";
import React, { Suspense } from "react";
import StockLoading from "./loading";
import { StockProvider } from "@/context/stockContext";

const StockPage = async ({
    params,
}: {
    params: Promise<{ branchId: string }>;
}) => {
    const { branchId } = await params;
    const products = getBranchProductsMetadata(branchId);
    const stockData = getBranchProductsStockData(branchId);

    return (
        <Suspense fallback={<StockLoading />}>
            <div className="p-4 h-full">
                <StockProvider>
                    <StockTable branchId={branchId} products={products} stockData={stockData} />
                </StockProvider>
            </div>
        </Suspense>
    );
};

export default StockPage;
