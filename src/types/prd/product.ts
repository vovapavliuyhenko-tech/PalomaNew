/**
 * Целевая модель товара по PRD (витрина / data-слой).
 * Не путать с `MockProduct` и `DbProduct` — постепенная унификация на этапах 6–7.
 */
export type PrdProduct = {
  id: string;
  slug: string;
  title: string;
  price: number;
  oldPrice?: number;
  category: string;
  images: string[];
  description: string;
  composition?: string;
  size?: string;
  care?: string;
  delivery?: string;
  isAvailable: boolean;
  isOnlineShowcase?: boolean;
  isBestseller?: boolean;
  isSeasonal?: boolean;
  addOns?: string[];
};
