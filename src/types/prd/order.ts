import type { PrdCartLine } from "./cart";

/** Заказ после oформления (checkout) — целевая модель PRD. */
export type PrdOrder = {
  id: string;
  items: PrdCartLine[];
  customer: Record<string, unknown>;
  recipient: Record<string, unknown>;
  delivery: Record<string, unknown>;
  postcardText?: string;
  promoCode?: string;
  paymentMethod: string;
  total: number;
};
