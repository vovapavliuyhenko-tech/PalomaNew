"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { MockProduct } from "@/data/mockProducts";
import ProductQuickViewModal from "./ProductQuickViewModal";

type Ctx = {
  openQuickView: (product: MockProduct) => void;
  closeQuickView: () => void;
  activeProduct: MockProduct | null;
};

const ProductQuickViewContext = createContext<Ctx | null>(null);

export function ProductQuickViewProvider({ children }: { children: React.ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<MockProduct | null>(null);

  const openQuickView = useCallback((product: MockProduct) => setActiveProduct(product), []);
  const closeQuickView = useCallback(() => setActiveProduct(null), []);

  const value = useMemo(
    () => ({ openQuickView, closeQuickView, activeProduct }),
    [openQuickView, closeQuickView, activeProduct]
  );

  return (
    <ProductQuickViewContext.Provider value={value}>
      {children}
      <ProductQuickViewModal product={activeProduct} onClose={closeQuickView} />
    </ProductQuickViewContext.Provider>
  );
}

export function useProductQuickView(): Ctx | null {
  return useContext(ProductQuickViewContext);
}
