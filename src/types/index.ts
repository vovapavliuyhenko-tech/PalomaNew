/**
 * Целевые типы домена PALOMA; эталон каталога в БД: `Db*` из `./db`.
 */
export type { DbCategory, DbProduct, DbProductImage } from "./db";

export type {
  PrdProduct,
  PrdCategory,
  PrdOrder,
  PrdCartItem,
  PrdCartLine,
} from "./prd";

export type ProductBadge = "hit" | "new" | "today" | "preorder" | "seasonal";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ProductFormat =
  | "bouquet"
  | "mono"
  | "composition"
  | "basket"
  | "wedding"
  | "vase"
  | "gift"
  | "service";

export type ProductCategory =
  | "bouquets"
  | "author"
  | "mono"
  | "compositions"
  | "stems"
  | "wedding"
  | "gifts"
  | "coffee"
  | "pastry";

export type ProductOccasion =
  | "birthday"
  | "date"
  | "wedding"
  | "thanks"
  | "noReason"
  | "sorry";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  composition: string[];
  category: ProductCategory;
  occasion?: ProductOccasion[];
  price: number;
  oldPrice?: number;
  size?: ProductSize;
  format: ProductFormat;
  images: string[];
  badge?: ProductBadge;
  inStock: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  bundle?: string[];
  careNote?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface OrderLineItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type: "flower" | "coffee" | "gift";
}

export interface Order {
  id: string;
  items: OrderLineItem[];
  customer: {
    name: string;
    phone: string;
    messenger: "whatsapp" | "telegram" | "call";
    messengerId?: string;
  };
  delivery: {
    type: "delivery" | "pickup";
    address?: string;
    date?: string;
    time?: string;
    comment?: string;
  };
  card?: string;
  paymentMethod: "online" | "onDelivery";
  status: "pending" | "paid" | "failed";
  total: number;
  createdAt: string;
}

export interface WeddingFormData {
  name: string;
  phone: string;
  date: string;
  venue: string;
  budget: string;
  services: string[];
  comment?: string;
  messenger: "whatsapp" | "telegram" | "call";
}

export interface CoffeeItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: "coffee" | "cold" | "tea" | "pastry" | "dessert" | "combo";
  image: string;
  volume?: string;
}
