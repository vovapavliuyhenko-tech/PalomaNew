export type PrdCartItem = {
  productId: string;
  quantity: number;
  addOns?: string[];
};

/** Расширенная позиция для итогов заказа (с снимком цены — позже на checkout). */
export type PrdCartLine = PrdCartItem & {
  slug?: string;
  title?: string;
  unitPrice?: number;
};
